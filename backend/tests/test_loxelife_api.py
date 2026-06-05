import os, requests, pytest, websocket, json, threading, time

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://wildlife-kingdom-1.preview.emergentagent.com").rstrip("/")
WS_BASE = BASE.replace("https://", "wss://").replace("http://", "ws://")

def test_root():
    r = requests.get(f"{BASE}/api/")
    assert r.status_code == 200
    j = r.json()
    assert "animals" in j and j["animals"] >= 200

def test_animals_list():
    r = requests.get(f"{BASE}/api/animals")
    assert r.status_code == 200
    j = r.json()
    assert j["count"] >= 200
    a = j["animals"][0]
    for k in ["id","name","region","rarity","facts","wiki"]:
        assert k in a

@pytest.mark.parametrize("region", ["savanna","dunes","canopy","peaks","woods","outback","wastes","ocean"])
def test_animals_by_region(region):
    r = requests.get(f"{BASE}/api/animals", params={"region": region})
    assert r.status_code == 200
    j = r.json()
    assert j["count"] > 0
    assert all(a["region"] == region for a in j["animals"])

@pytest.mark.parametrize("aid", ["lion","saola","snow-leopard"])
def test_animal_detail(aid):
    r = requests.get(f"{BASE}/api/animals/{aid}")
    assert r.status_code == 200, f"{aid} -> {r.status_code} {r.text[:200]}"
    j = r.json()
    assert j["id"] == aid
    assert "facts" in j

def test_animal_404():
    r = requests.get(f"{BASE}/api/animals/not-an-animal-xyz")
    assert r.status_code == 404

def test_regions():
    r = requests.get(f"{BASE}/api/regions")
    assert r.status_code == 200
    j = r.json()
    keys = {x["key"] for x in j["regions"]}
    assert {"savanna","dunes","canopy","peaks","woods","outback","wastes","ocean"} <= keys
    assert j["total_animals"] >= 200

def test_scholar_round():
    r = requests.get(f"{BASE}/api/scholar/round")
    assert r.status_code == 200
    j = r.json()
    assert "round_id" in j and j["fact"] and len(j["options"]) == 2 and j["correct_id"]
    assert j["correct_id"] in [o["id"] for o in j["options"]]

def test_poker_create():
    r = requests.post(f"{BASE}/api/poker/create")
    assert r.status_code == 200
    code = r.json()["code"]
    assert len(code) == 4 and code.isalpha() and code.isupper()

def test_saola_chat_streaming():
    r = requests.post(f"{BASE}/api/saola/chat",
                      json={"session_id":"test-sess-1","message":"Greet me in one short sentence."},
                      stream=True, timeout=60)
    assert r.status_code == 200
    chunks = []
    for c in r.iter_content(chunk_size=None, decode_unicode=True):
        if c: chunks.append(c)
        if sum(len(x) for x in chunks) > 5: break
    text = "".join(chunks)
    assert text.strip(), f"No text streamed: {text!r}"
    assert "[The Saola hums quietly" not in text, f"LLM error: {text}"

def test_websocket_poker_flow():
    code = requests.post(f"{BASE}/api/poker/create").json()["code"]
    url = f"{WS_BASE}/api/ws/poker/{code}"
    msgs = {"a":[], "b":[]}
    def reader(ws, key, stop):
        try:
            while not stop["s"]:
                ws.settimeout(8)
                m = ws.recv()
                if m: msgs[key].append(json.loads(m))
        except Exception: pass
    wsa = websocket.create_connection(url, timeout=10)
    wsb = websocket.create_connection(url, timeout=10)
    stop = {"s": False}
    ta = threading.Thread(target=reader, args=(wsa,"a",stop), daemon=True); ta.start()
    tb = threading.Thread(target=reader, args=(wsb,"b",stop), daemon=True); tb.start()
    wsa.send(json.dumps({"type":"join","name":"Alice"}))
    time.sleep(0.5)
    wsb.send(json.dumps({"type":"join","name":"Bob"}))
    time.sleep(1.0)
    wsa.send(json.dumps({"type":"start"}))
    time.sleep(1.5)
    # find first player's hand
    state_msgs_a = [m for m in msgs["a"] if m.get("type")=="state"]
    assert state_msgs_a, f"no state for A. msgs={msgs}"
    last_a = state_msgs_a[-1]["state"]
    assert last_a["state"] == "playing"
    cur_id = last_a["current_player_id"]
    my_id = last_a["my_id"]
    if cur_id == my_id:
        tile = last_a["my_hand"][0]
        wsa.send(json.dumps({"type":"play","tile_id":tile["id"],"claim":"satisfies demand"}))
    else:
        last_b = [m for m in msgs["b"] if m.get("type")=="state"][-1]["state"]
        tile = last_b["my_hand"][0]
        wsb.send(json.dumps({"type":"play","tile_id":tile["id"],"claim":"satisfies demand"}))
    time.sleep(1.0)
    # opposite player challenges
    other = wsb if cur_id == my_id else wsa
    other.send(json.dumps({"type":"challenge"}))
    time.sleep(2.0)
    stop["s"] = True
    try: wsa.close()
    except: pass
    try: wsb.close()
    except: pass
    # verify board updated and broadcast received
    final_a = [m for m in msgs["a"] if m.get("type")=="state"][-1]["state"]
    assert len(final_a["board"]) >= 1, f"board not updated: {final_a}"
    assert final_a["harmony"] != 100 or final_a["board"][0]["revealed"] is True
