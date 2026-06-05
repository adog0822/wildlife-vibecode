from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import random
import string
import asyncio
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from animals_data import ANIMALS, by_region, by_id

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============== ANIMAL ENDPOINTS ==============

@api_router.get("/animals")
async def list_animals(region: Optional[str] = None):
    if region:
        data = by_region().get(region, [])
    else:
        data = ANIMALS
    return {"count": len(data), "animals": data}

@api_router.get("/animals/{animal_id}")
async def get_animal(animal_id: str):
    a = by_id().get(animal_id)
    if not a:
        raise HTTPException(status_code=404, detail="Animal not found")
    return a

@api_router.get("/regions")
async def list_regions():
    regions = {}
    for a in ANIMALS:
        r = a["region"]
        regions.setdefault(r, {"key": r, "count": 0, "rarity_counts": {1:0,2:0,3:0,4:0,5:0}})
        regions[r]["count"] += 1
        regions[r]["rarity_counts"][a["rarity"]] += 1
    return {"regions": list(regions.values()), "total_animals": len(ANIMALS)}


# ============== SINGLEPLAYER: SCHOLAR'S TRIAL ==============

class ScholarRoundResponse(BaseModel):
    round_id: str
    fact: str
    options: List[Dict[str, Any]]  # each {id, name, image_wiki, rarity}
    correct_id: str  # client side determines but server also records

@api_router.get("/scholar/round")
async def scholar_round():
    # pick a random animal with at least one fact, then pick a similar partner from same region
    by_r = by_region()
    region_key = random.choice(list(by_r.keys()))
    pool = by_r[region_key]
    if len(pool) < 2:
        pool = ANIMALS
    a, b = random.sample(pool, 2)
    # pick fact from a (correct) — fact phrased as third-person
    fact = random.choice(a["facts"])
    round_id = str(uuid.uuid4())
    payload = {
        "round_id": round_id,
        "fact": fact,
        "correct_id": a["id"],
        "options": [
            {"id": a["id"], "name": a["name"], "wiki": a["wiki"], "rarity": a["rarity"], "region": a["region"]},
            {"id": b["id"], "name": b["name"], "wiki": b["wiki"], "rarity": b["rarity"], "region": b["region"]},
        ],
    }
    random.shuffle(payload["options"])
    return payload


# ============== SAOLA AI CHAT ==============

class SaolaChatRequest(BaseModel):
    session_id: str
    message: str

SAOLA_SYSTEM = """You are the Saola — a mythical, wise, and witty animal guide in the LoxeLife wildlife sanctuary. You are also called the Asian Unicorn (a real, critically endangered animal discovered in 1992). You speak with quiet humor, gentle sarcasm, and reverence for nature. Keep responses SHORT (1-3 sentences usually). You can:
- Help users navigate (Loxedex book, World Map, Singleplayer 'Scholar's Trial', Multiplayer 'Ecosystem Poker').
- Share fun facts about animals.
- Tease the user lightly when they make obvious mistakes in the game.
- Occasionally refer to your bamboo staff or your lantern.
Never break character. Never reveal you are an AI."""

@api_router.post("/saola/chat")
async def saola_chat(req: SaolaChatRequest):
    # Streaming SSE-like response using emergentintegrations
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=SAOLA_SYSTEM,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    async def gen():
        try:
            async for ev in chat.stream_message(UserMessage(text=req.message)):
                if isinstance(ev, TextDelta):
                    yield ev.content
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            yield f"\n[The Saola hums quietly... ({type(e).__name__})]"

    return StreamingResponse(gen(), media_type="text/plain",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ============== MULTIPLAYER: ECOSYSTEM POKER (WEBSOCKETS) ==============

# In-memory room registry
ROOMS: Dict[str, "PokerRoom"] = {}

REGION_LABEL = {
    "savanna":"Sun-Baked Savanna","dunes":"The Great Dunes","canopy":"Emerald Canopy",
    "peaks":"Mystic Peaks","woods":"Whispering Woods","outback":"Crimson Outback",
    "wastes":"Frozen Wastes","ocean":"The Deep Blue",
}

class PokerRoom:
    def __init__(self, code: str):
        self.code = code
        self.players: Dict[str, Dict[str, Any]] = {}  # player_id -> {name, hand, sockets, is_saboteur}
        self.host_id: Optional[str] = None
        self.state = "lobby"  # lobby | playing | reveal | finished
        self.harmony = 100
        self.biome = random.choice(list(REGION_LABEL.keys()))
        self.board: List[Dict[str, Any]] = []  # tiles played [{player_id, claim, actual, revealed}]
        self.current_demand: Optional[Dict[str, Any]] = None
        self.current_player_index = 0
        self.round_number = 0
        self.max_rounds = 6
        self.pending_play: Optional[Dict[str, Any]] = None  # {player_id, claim, actual, challenges:set}
        self.challenge_window_task: Optional[asyncio.Task] = None
        self.sockets: List[WebSocket] = []
        self.log: List[str] = []

    def player_order(self):
        return list(self.players.keys())

    def deal(self):
        # spirit tile templates
        spirit_pool = [
            {"id":"spirit-mimic","name":"The Mimic","rarity":4,"is_spirit":True,"spirit_kind":"mimic",
             "wiki":"Chameleon","superpower":"Substitute any demand (+0 harmony).","region":"any"},
            {"id":"spirit-oracle","name":"The Oracle","rarity":4,"is_spirit":True,"spirit_kind":"oracle",
             "wiki":"Owl","superpower":"Play face-up to instantly reveal all face-down tiles on the board.","region":"any"},
            {"id":"spirit-parasite","name":"The Parasite","rarity":5,"is_spirit":True,"spirit_kind":"parasite",
             "wiki":"Cuscuta","superpower":"Played face-down. +20 harmony now, but drains -40 at reveal.","region":"any"},
            {"id":"spirit-scavenger","name":"The Scavenger","rarity":3,"is_spirit":True,"spirit_kind":"scavenger",
             "wiki":"Vulture","superpower":"Play face-up to swap in for the last shattered tile.","region":"any"},
        ]
        for i, pid in enumerate(self.players):
            hand = random.sample(ANIMALS, 6)
            # give each player 1–2 random spirit tiles (unique-ish per player)
            spirits = random.sample(spirit_pool, k=2)
            for sp in spirits:
                # Make unique id per player so frontend tracks them separately
                hand.append({**sp, "id": f"{sp['id']}-{pid[:6]}"})
            random.shuffle(hand)
            self.players[pid]["hand"] = hand

    def assign_saboteur(self):
        pids = list(self.players.keys())
        if pids:
            sab = random.choice(pids)
            for pid in pids:
                self.players[pid]["is_saboteur"] = (pid == sab)

    def next_demand(self):
        # board demands: rarity range OR trophic OR impact
        kind = random.choice(["rarity", "trophic", "impact"])
        if kind == "rarity":
            r = random.choice([2,3,4])
            self.current_demand = {"kind":"rarity", "value":r, "label":f"a {r}★ creature for {REGION_LABEL[self.biome]}"}
        elif kind == "trophic":
            self.current_demand = {"kind":"trophic", "min":7, "label":f"a predator (Trophic 7+) for {REGION_LABEL[self.biome]}"}
        else:
            self.current_demand = {"kind":"impact", "min":6, "label":f"a keystone species (Impact 6+) for {REGION_LABEL[self.biome]}"}

    def validate(self, actual: Dict[str, Any], demand: Dict[str, Any]) -> bool:
        if actual.get("is_spirit"):
            return True  # mimic always satisfies, but adds 0
        if demand["kind"] == "rarity":
            return actual["rarity"] == demand["value"]
        if demand["kind"] == "trophic":
            return actual["diet"] >= demand["min"]
        if demand["kind"] == "impact":
            return actual["impact"] >= demand["min"]
        return False

    def claim_is_true(self, claim: Dict[str, Any], actual: Dict[str, Any]) -> bool:
        # claim contains {rarity_class}; player claims they meet the demand of certain attributes
        # We treat claim as: player asserts the tile satisfies current demand
        return self.validate(actual, self.current_demand)

    def public_state(self):
        return {
            "code": self.code,
            "state": self.state,
            "biome": self.biome,
            "biome_label": REGION_LABEL[self.biome],
            "harmony": self.harmony,
            "round": self.round_number,
            "max_rounds": self.max_rounds,
            "demand": self.current_demand,
            "board": [{"player_id":t["player_id"],"player_name":self.players.get(t["player_id"],{}).get("name","?"),
                       "claim":t["claim"],"revealed":t["revealed"],
                       "actual": t["actual"] if t["revealed"] else None,
                       "result": t.get("result")} for t in self.board],
            "players":[{"id":pid,"name":p["name"],"hand_size":len(p.get("hand",[])),
                        "is_host": pid==self.host_id} for pid,p in self.players.items()],
            "current_player_id": self.player_order()[self.current_player_index] if self.players else None,
            "pending_play": None if not self.pending_play else {
                "player_id": self.pending_play["player_id"],
                "player_name": self.players.get(self.pending_play["player_id"],{}).get("name","?"),
                "claim": self.pending_play["claim"]},
            "log": self.log[-20:],
        }

    def private_state_for(self, player_id: str):
        ps = self.public_state()
        p = self.players.get(player_id, {})
        ps["my_hand"] = p.get("hand", [])
        ps["is_saboteur"] = p.get("is_saboteur", False)
        ps["my_id"] = player_id
        return ps

async def broadcast(room: PokerRoom):
    # send each player their private state
    for pid, p in list(room.players.items()):
        for ws in list(p.get("sockets", [])):
            try:
                await ws.send_json({"type":"state","state":room.private_state_for(pid)})
            except Exception:
                pass
    # also broadcast to spectator host-only sockets (none separate now)

@api_router.post("/poker/create")
async def create_room():
    code = ''.join(random.choices(string.ascii_uppercase, k=4))
    while code in ROOMS:
        code = ''.join(random.choices(string.ascii_uppercase, k=4))
    ROOMS[code] = PokerRoom(code)
    return {"code": code}

@app.websocket("/api/ws/poker/{code}")
async def ws_poker(websocket: WebSocket, code: str):
    await websocket.accept()
    code = code.upper()
    room = ROOMS.get(code)
    if not room:
        await websocket.send_json({"type":"error","message":"Room not found"})
        await websocket.close()
        return

    player_id: Optional[str] = None
    try:
        while True:
            msg = await websocket.receive_json()
            t = msg.get("type")
            if t == "join":
                name = msg.get("name","Player")
                player_id = msg.get("player_id") or str(uuid.uuid4())
                if player_id not in room.players:
                    room.players[player_id] = {"name": name, "hand": [], "sockets":[], "is_saboteur":False}
                    if not room.host_id:
                        room.host_id = player_id
                room.players[player_id]["sockets"].append(websocket)
                room.log.append(f"{name} joined")
                await websocket.send_json({"type":"joined","player_id":player_id,"is_host":player_id==room.host_id})
                await broadcast(room)

            elif t == "start" and room.state == "lobby":
                if len(room.players) < 2:
                    await websocket.send_json({"type":"error","message":"Need at least 2 players"})
                    continue
                room.deal()
                room.assign_saboteur()
                room.state = "playing"
                room.round_number = 1
                room.current_player_index = 0
                room.next_demand()
                room.log.append("Game started — a Saboteur lurks among you...")
                await broadcast(room)

            elif t == "play" and room.state == "playing" and player_id:
                if room.pending_play:
                    continue
                cur_pid = room.player_order()[room.current_player_index]
                if cur_pid != player_id:
                    await websocket.send_json({"type":"error","message":"Not your turn"})
                    continue
                tile_id = msg.get("tile_id")
                claim_label = msg.get("claim","plays a tile")
                hand = room.players[player_id]["hand"]
                idx = next((i for i,h in enumerate(hand) if h["id"]==tile_id), -1)
                if idx < 0:
                    await websocket.send_json({"type":"error","message":"Tile not in hand"})
                    continue
                actual = hand.pop(idx)
                kind = actual.get("spirit_kind")

                # Oracle: face-up, reveals all face-down tiles, no challenge
                if kind == "oracle":
                    for tile in room.board:
                        tile["revealed"] = True
                    if room.pending_play:
                        room.pending_play["forced_reveal"] = True
                    room.board.append({"player_id": player_id, "claim": "Oracle: Reveal all!",
                                       "actual": actual, "revealed": True, "result": "oracle"})
                    room.log.append(f"{room.players[player_id]['name']} plays THE ORACLE — all tiles flip!")
                    # advance turn
                    room.current_player_index = (room.current_player_index + 1) % len(room.players)
                    if room.current_player_index == 0:
                        room.round_number += 1
                        if room.round_number > room.max_rounds: room.state = "finished"
                        else: room.next_demand()
                    await broadcast(room)
                    continue

                # Scavenger: revive last splintered tile slot (simplified: small heal)
                if kind == "scavenger":
                    room.harmony = min(100, room.harmony + 8)
                    room.board.append({"player_id": player_id, "claim": "Scavenger: cleanse the splinters",
                                       "actual": actual, "revealed": True, "result": "scavenger"})
                    room.log.append(f"{room.players[player_id]['name']} plays THE SCAVENGER — the ecosystem mends (+8 harmony).")
                    room.current_player_index = (room.current_player_index + 1) % len(room.players)
                    if room.current_player_index == 0:
                        room.round_number += 1
                        if room.round_number > room.max_rounds: room.state = "finished"
                        else: room.next_demand()
                    await broadcast(room)
                    continue

                # Parasite: face-down, +20 now, -40 on reveal
                if kind == "parasite":
                    room.harmony = min(100, room.harmony + 20)
                    room.pending_play = {"player_id": player_id, "claim": claim_label, "actual": actual,
                                         "challenges": set(), "parasite_pending": True}
                    room.log.append(f"{room.players[player_id]['name']} slides a tile face-down: \"{claim_label}\" — the ecosystem swells deceptively…")
                    await broadcast(room)
                    async def resolve_after_window(r=room):
                        await asyncio.sleep(10)
                        await resolve_play(r)
                    room.challenge_window_task = asyncio.create_task(resolve_after_window())
                    continue

                room.pending_play = {"player_id": player_id, "claim": claim_label, "actual": actual, "challenges": set()}
                room.log.append(f"{room.players[player_id]['name']} slides a tile face-down: \"{claim_label}\"")
                await broadcast(room)
                async def resolve_after_window(r=room):
                    await asyncio.sleep(10)
                    await resolve_play(r)
                room.challenge_window_task = asyncio.create_task(resolve_after_window())

            elif t == "challenge" and room.pending_play and player_id:
                if player_id == room.pending_play["player_id"]:
                    continue
                room.pending_play["challenges"].add(player_id)
                room.log.append(f"{room.players[player_id]['name']} CHALLENGES the play!")
                # cancel timer and resolve immediately
                if room.challenge_window_task:
                    room.challenge_window_task.cancel()
                await resolve_play(room)

            elif t == "leave":
                break

    except WebSocketDisconnect:
        pass
    finally:
        if player_id and player_id in room.players:
            socks = room.players[player_id].get("sockets", [])
            if websocket in socks:
                socks.remove(websocket)


async def resolve_play(room: PokerRoom):
    if not room.pending_play:
        return
    play = room.pending_play
    actual = play["actual"]
    is_true = room.claim_is_true(play["claim"], actual)
    challenged = len(play["challenges"]) > 0
    result = ""
    revealed = challenged  # only reveal if challenged
    delta = 0

    if challenged:
        if is_true:
            # truthful play — accusers penalized
            delta = +10
            result = "truthful"
            room.log.append(f"The tile blazes with golden chi — it was TRUE! Accusers lose face.")
        else:
            delta = -25
            result = "exposed_lie"
            room.log.append(f"The wooden tile SPLINTERS — {room.players[play['player_id']]['name']} was caught lying!")
    else:
        # unchallenged
        if is_true:
            delta = +5
            result = "passed_true"
            room.log.append(f"{room.players[play['player_id']]['name']}'s tile slides into the ecosystem.")
        else:
            delta = -15
            result = "passed_lie"
            room.log.append(f"A hidden corruption seeps into the ecosystem...")

    if actual.get("is_spirit"):
        if actual.get("spirit_kind") == "parasite":
            # Parasite punishes at reveal
            delta = -40
            result = "parasite_drain"
            room.log.append(f"THE PARASITE blooms — vines choke the harmony (-40).")
        else:
            delta = 0  # Mimic etc add zero
    # invasive bonus drain
    if actual.get("invasive", 0) >= 4 and not actual.get("is_spirit"):
        delta -= 5

    room.harmony = max(0, min(100, room.harmony + delta))
    room.board.append({"player_id": play["player_id"], "claim": play["claim"],
                       "actual": actual, "revealed": revealed, "result": result})
    room.pending_play = None
    room.challenge_window_task = None

    # advance turn
    room.current_player_index = (room.current_player_index + 1) % len(room.players)
    if room.current_player_index == 0:
        room.round_number += 1
        # reveal all unchallenged tiles on round end
        for tile in room.board:
            tile["revealed"] = True
        room.log.append(f"— Reveal phase — all tiles flip!")
        room.next_demand()

    # check end
    if room.harmony <= 0:
        room.state = "finished"
        room.log.append("Harmony collapses! The Saboteur wins.")
    elif room.round_number > room.max_rounds:
        room.state = "finished"
        room.log.append("The Wardens preserve the ecosystem!")
    else:
        room.next_demand()

    await broadcast(room)


# ============== INIT ==============

@api_router.get("/")
async def root():
    return {"message": "LoxeLife backend running", "animals": len(ANIMALS)}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
