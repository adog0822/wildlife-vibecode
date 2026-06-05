import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { createPokerRoom, wsURL } from "../lib/api";
import { getPlayerName, setPlayerName } from "../lib/storage";
import { getWikiImage } from "../lib/wikiImage";
import { playTileClack, playChi, playSplinter, playUnlock } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

const PokerLobby = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(getPlayerName());
  const [code, setCode] = useState("");

  const host = async () => {
    if (!name.trim()) return;
    setPlayerName(name);
    const { code: c } = await createPokerRoom();
    navigate(`/poker/${c}`);
  };
  const join = () => {
    if (!name.trim() || !code.trim()) return;
    setPlayerName(name);
    navigate(`/poker/${code.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }} data-testid="poker-lobby">
      <div className="max-w-md w-full parchment parchment-edge rounded-md p-8 unroll mx-4">
        <div className="font-['Pirata_One'] text-4xl text-[#2C241B] text-center">Ecosystem Poker</div>
        <div className="font-['Cinzel'] italic text-[#5C5042] text-center mb-6">Enter the lodge</div>
        <label className="block font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042] mb-1">Your Name</label>
        <input data-testid="lobby-name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 mb-4 border border-[#8C7356] rounded bg-[#F4EFE6] text-[#2C241B]" placeholder="Scholar" />
        <button onClick={host} data-testid="host-room" className="btn-chi w-full mb-3">Host a New Game</button>
        <div className="text-center text-[#5C5042] my-2">— or —</div>
        <label className="block font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042] mb-1">Room Code</label>
        <input data-testid="lobby-code" value={code} onChange={(e) => setCode(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-[#8C7356] rounded bg-[#F4EFE6] text-[#2C241B] uppercase tracking-widest" placeholder="ABCD" />
        <button onClick={join} data-testid="join-room" className="btn-wood w-full">Join Game</button>
        <button onClick={() => navigate("/games")} className="block mx-auto mt-4 text-[#5C5042] text-sm" data-testid="lobby-back">← Back to Games</button>
      </div>
      <SaolaGuide context="lobby for ecosystem poker" />
    </div>
  );
};

export const PokerGame = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const [state, setState] = useState(null);
  const [pickedTile, setPickedTile] = useState(null);
  const [claim, setClaim] = useState("");
  const playerIdRef = useRef(localStorage.getItem(`poker.pid.${code}`) || crypto.randomUUID());
  const [imgCache, setImgCache] = useState({});

  useEffect(() => {
    localStorage.setItem(`poker.pid.${code}`, playerIdRef.current);
    const ws = new WebSocket(wsURL(code));
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", name: getPlayerName() || "Scholar", player_id: playerIdRef.current }));
    };
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.type === "state") {
        const prev = state;
        setState(m.state);
        // SFX cues based on state diff
        if (prev) {
          const prevBoard = prev.board?.length || 0;
          const newBoard = m.state.board?.length || 0;
          if (newBoard > prevBoard) {
            const newest = m.state.board[newBoard - 1];
            if (newest?.result === "exposed_lie" || newest?.result === "parasite_drain") {
              playSplinter();
            } else if (newest?.result === "oracle" || newest?.result === "truthful") {
              playUnlock();
            } else {
              playTileClack();
            }
          } else if (!prev.pending_play && m.state.pending_play) {
            playTileClack();
          }
          if ((m.state.harmony || 0) < (prev.harmony || 100) - 10) {
            setSaolaMood("wideEyes", 1400);
          }
        }
      }
      if (m.type === "error") console.warn(m.message);
    };
    ws.onclose = () => {};
    return () => ws.close();
  }, [code]);

  useEffect(() => {
    if (!state?.my_hand) return;
    state.my_hand.forEach(async (t) => {
      if (t.wiki && !imgCache[t.wiki]) {
        const url = await getWikiImage(t.wiki);
        setImgCache((c) => ({ ...c, [t.wiki]: url }));
      }
    });
  }, [state?.my_hand]);

  const send = (obj) => wsRef.current?.send(JSON.stringify(obj));
  const start = () => send({ type: "start" });
  const playTile = () => {
    if (!pickedTile || !claim.trim()) return;
    // chin-stroke saola when the player is about to play something risky (low rarity but high claim, or spirit)
    if (pickedTile.is_spirit || (state.demand?.kind === "rarity" && pickedTile.rarity !== state.demand.value)) {
      setSaolaMood("chinStroke", 1600);
    }
    playTileClack();
    send({ type: "play", tile_id: pickedTile.id, claim });
    setPickedTile(null); setClaim("");
  };
  const challenge = () => { playChi(); send({ type: "challenge" }); };

  if (!state) return <div className="min-h-screen flex items-center justify-center text-[#FFD700] font-['Pirata_One'] text-2xl">Connecting to the lodge…</div>;

  const myTurn = state.current_player_id === state.my_id;
  const canChallenge = state.pending_play && state.pending_play.player_id !== state.my_id;

  return (
    <div className={`min-h-screen biome-${state.biome}`} data-testid="poker-game">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <button onClick={() => navigate("/poker")} className="btn-wood text-xs sm:text-sm" data-testid="game-leave">← Leave</button>
          <div className="text-center min-w-0">
            <div className="font-['Pirata_One'] text-xl sm:text-3xl md:text-4xl text-[#FFD700] truncate" style={{ textShadow: "0 0 14px rgba(255,140,0,0.6)" }}>{state.biome_label}</div>
            <div className="font-['Space_Mono'] text-[10px] sm:text-xs tracking-widest text-[#f4efe6]/70">ROOM {state.code} · ROUND {state.round}/{state.max_rounds}</div>
          </div>
          <div className="text-right">
            <div className="font-['Bebas_Neue'] tracking-widest text-[#FFD700] text-[10px] sm:text-sm">HARMONY</div>
            <div className="w-24 sm:w-40 h-3 bg-black/40 rounded overflow-hidden" data-testid="harmony-meter">
              <div className="h-full bg-gradient-to-r from-[#4ADE80] via-[#FFD700] to-[#FF8C00]" style={{ width: `${state.harmony}%` }} />
            </div>
            <div className="text-[#f4efe6] text-[10px] sm:text-xs font-['Space_Mono']">{state.harmony}%</div>
          </div>
        </div>

        {/* Players */}
        <div className="flex gap-2 mb-3 flex-wrap" data-testid="players-list">
          {state.players.map((p) => (
            <div key={p.id} className={`px-3 py-1 rounded font-['Bebas_Neue'] tracking-widest text-xs sm:text-sm ${p.id===state.current_player_id ? "bg-[#FFD700] text-black" : "bg-black/40 text-[#f4efe6]"}`}>
              {p.name}{p.is_host ? " 👑" : ""}{p.eclipse_armed ? " ☽" : ""} · {p.hand_size} tiles
            </div>
          ))}
        </div>

        {state.state === "lobby" && (
          <div className="parchment parchment-edge rounded-md p-6 unroll text-center mb-4">
            <div className="font-['Pirata_One'] text-3xl text-[#2C241B] mb-2">Waiting in the lodge</div>
            <div className="font-['Cinzel'] text-[#5C5042] mb-4">Share room code <b>{state.code}</b> with friends.</div>
            <button onClick={start} className="btn-chi" data-testid="start-game">Start Game</button>
          </div>
        )}

        {state.state !== "lobby" && (
          <>
            {/* Board demand */}
            <div className="parchment p-4 rounded-md mb-4 text-center">
              <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042]">THE BOARD DEMANDS</div>
              <div className="font-['Pirata_One'] text-2xl text-[#2C241B]" data-testid="demand-label">{state.demand?.label || "—"}</div>
            </div>

            {/* Board tiles */}
            <div className="mb-4">
              <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]/80 mb-2">ECOSYSTEM</div>
              <div className="flex gap-2 overflow-x-auto sm:flex-wrap" data-testid="board-tiles">
                {state.board.map((t, i) => (
                  <div key={i} className={`wood-tile ${t.revealed && t.actual ? `wood-tile-${t.actual.rarity}` : "wood-tile-3"} p-2 w-24 sm:w-28 shrink-0`}>
                    <div className="text-[10px] text-[#f4efe6]/70">{t.player_name} claimed:</div>
                    <div className="font-['Pirata_One'] text-sm text-[#f4efe6]">{t.claim}</div>
                    {t.revealed && t.actual ? (
                      <div className="mt-1">
                        <div className="font-['Space_Mono'] text-xs text-[#FFD700]">{t.actual.name}</div>
                        <div className="text-[10px] text-[#f4efe6]/70">{t.result?.replace("_"," ")}</div>
                      </div>
                    ) : (
                      <div className="text-center mt-2 font-['Shojumaru'] text-[#8C7356]">⟁</div>
                    )}
                  </div>
                ))}
                {state.pending_play && (
                  <div className="wood-tile wood-tile-3 p-2 w-24 sm:w-28 chi-glow shrink-0" data-testid="pending-tile">
                    <div className="text-[10px] text-[#f4efe6]/70">{state.pending_play.player_name} slid:</div>
                    <div className="font-['Pirata_One'] text-sm text-[#f4efe6]">{state.pending_play.claim}</div>
                    {canChallenge && (
                      <button onClick={challenge} data-testid="challenge-btn" className="mt-2 w-full bg-[#FF8C00] text-black text-xs px-1 py-1 rounded font-['Bebas_Neue']">CHALLENGE!</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* My hand */}
            {state.state === "playing" && (
              <div className="mb-4">
                <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]/80 mb-2">
                  YOUR RACK {state.is_saboteur ? "· 🜏 The Saboteur" : "· The Warden"}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap" data-testid="my-hand">
                  {state.my_hand?.map((t) => (
                    <button key={t.id} onClick={() => myTurn && !state.pending_play && setPickedTile(t)}
                      disabled={!myTurn || state.pending_play}
                      className={`${t.is_spirit ? "spirit-tile" : `wood-tile wood-tile-${t.rarity}`} p-2 w-24 sm:w-28 shrink-0 text-left ${pickedTile?.id===t.id ? "ring-2 ring-[#FFD700] -translate-y-2" : ""} ${(!myTurn||state.pending_play) ? "opacity-50" : ""}`}
                      data-testid={`hand-tile-${t.id}`}>
                      <div className="w-full aspect-square bg-black/30 rounded mb-1 overflow-hidden">
                        {imgCache[t.wiki] && <img src={imgCache[t.wiki]} alt={t.name} className="w-full h-full object-cover pyrography" />}
                      </div>
                      <div className={`font-['Pirata_One'] text-xs ${t.is_spirit?"text-[#2c241b]":"text-[#f4efe6]"}`}>{t.name}</div>
                      <div className="text-[10px] text-[#FFD700]">{"★".repeat(t.rarity)}</div>
                      {t.spirit_kind && <div className="text-[9px] text-[#5C5042] italic mt-0.5">{t.spirit_kind}</div>}
                    </button>
                  ))}
                </div>
                {myTurn && pickedTile && !state.pending_play && (
                  <div className="mt-3 flex gap-2 items-center flex-wrap">
                    <input data-testid="claim-input" value={claim} onChange={(e) => setClaim(e.target.value)}
                      placeholder={pickedTile.spirit_kind === "eclipse" ? "Arm The Eclipse (no claim needed)" : `I am playing a ${state.demand?.label || "creature"}`}
                      className="flex-1 min-w-[180px] px-3 py-2 border border-[#8C7356] rounded bg-black/40 text-[#f4efe6] font-['Space_Mono'] text-sm"
                      disabled={pickedTile.spirit_kind === "eclipse"} />
                    <button onClick={() => {
                      if (pickedTile.spirit_kind === "eclipse") { setClaim("arm"); send({ type: "play", tile_id: pickedTile.id, claim: "Arm Eclipse" }); playTileClack(); setPickedTile(null); setClaim(""); }
                      else playTile();
                    }} className="btn-chi" data-testid="slide-btn">
                      {pickedTile.spirit_kind === "eclipse" ? "☽ Arm Eclipse" : "Slide Face-Down"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {state.state === "finished" && (
              <div className="parchment p-6 rounded-md text-center burn-in mb-4">
                <div className="font-['Luckiest_Guy'] text-4xl text-[#FF8C00]" data-testid="game-over-banner">
                  {state.harmony <= 0 ? "The Saboteur Wins" : "The Wardens Prevail"}
                </div>
                <div className="font-['Cinzel'] text-[#5C5042] mt-2">Final Harmony: {state.harmony}%</div>
              </div>
            )}

            {/* Log */}
            <div className="bg-black/40 rounded p-3 max-h-40 overflow-y-auto font-['Space_Mono'] text-xs text-[#f4efe6]/80" data-testid="game-log">
              {state.log.map((l, i) => <div key={i}>· {l}</div>)}
            </div>
          </>
        )}
      </div>
      <SaolaGuide context={`playing ecosystem poker in ${state.biome_label}, harmony ${state.harmony}%`} />
    </div>
  );
};

export default PokerLobby;
