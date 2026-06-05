import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPokerRoom, wsURL } from "../lib/api";
import { getPlayerName, setPlayerName } from "../lib/storage";
import { getWikiImage } from "../lib/wikiImage";
import { playTileClack, playChi, playSplinter, playUnlock } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import { track } from "../lib/track";
import SaolaGuide from "../components/SaolaGuide";

// Readable bluff-result labels + theme colors for tile reveal
const RESULT_META = {
  truthful:       { label: "TRUTHFUL",      icon: "✓", color: "#A3D977", halo: "rgba(163,217,119,0.55)" },
  exposed_lie:    { label: "EXPOSED LIE",   icon: "✗", color: "#FF4040", halo: "rgba(255,64,64,0.6)" },
  passed_true:    { label: "PASSED · TRUE", icon: "✓", color: "#7BC4FF", halo: "rgba(123,196,255,0.45)" },
  passed_lie:     { label: "PASSED · LIE",  icon: "⊘", color: "#FFD700", halo: "rgba(255,215,0,0.5)" },
  parasite_drain: { label: "PARASITE DRAIN", icon: "🜏", color: "#C77BFF", halo: "rgba(199,123,255,0.6)" },
  oracle:         { label: "ORACLE SIGHT",  icon: "⊕", color: "#FFD700", halo: "rgba(255,215,0,0.7)" },
};
const PokerLobby = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(getPlayerName());
  const [code, setCode] = useState("");

  const host = async () => {
    if (!name.trim()) return;
    setPlayerName(name);
    const { code: c } = await createPokerRoom();
    track("poker_game_start", { mode: "host", code: c });
    navigate(`/poker/${c}`);
  };
  const join = () => {
    if (!name.trim() || !code.trim()) return;
    setPlayerName(name);
    track("poker_game_start", { mode: "join", code: code.toUpperCase() });
    navigate(`/poker/${code.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }} data-testid="poker-lobby">
      <div className="max-w-md w-full parchment parchment-edge rounded-md p-8 unroll mx-4">
        <div className="font-['Pirata_One'] text-4xl text-[#2C241B] text-center">Ecosystem Poker</div>
        <div className="font-['Cinzel'] italic text-[#5C5042] text-center mb-2">Enter the lodge</div>
        <div className="font-['Space_Mono'] text-xs text-[#8C7356] text-center mb-5">
          2–8 players. Host opens a room, then shares the code or link with friends. Each player joins on their own device.
        </div>
        <label className="block font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042] mb-1">Your Name</label>
        <input data-testid="lobby-name" value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (code.trim() ? join() : host())}
          className="w-full px-3 py-2 mb-4 border border-[#8C7356] rounded bg-[#F4EFE6] text-[#2C241B]" placeholder="Scholar" />
        <button onClick={host} data-testid="host-room" className="btn-chi w-full mb-3">🎲 Host a New Game</button>
        <div className="text-center text-[#5C5042] my-2 font-['Cinzel'] italic text-xs">— or join an existing room —</div>
        <label className="block font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042] mb-1">4-Letter Room Code</label>
        <input data-testid="lobby-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0,4))}
          onKeyDown={(e) => e.key === "Enter" && join()}
          className="w-full px-3 py-2 mb-3 border-2 border-[#8C7356] rounded bg-[#F4EFE6] text-[#2C241B] uppercase tracking-[0.4em] text-center text-2xl font-['Pirata_One']" placeholder="ABCD" maxLength={4} />
        <button onClick={join} disabled={!code.trim()} data-testid="join-room" className="btn-wood w-full disabled:opacity-50">Join Game</button>
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
          // detect new player joining (lobby state)
          if (m.state.state === "lobby" && (m.state.players?.length || 0) > (prev.players?.length || 0)) {
            playChi();
            setSaolaMood("wideEyes", 1000);
          }
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
          <div className="parchment parchment-edge rounded-md p-6 unroll text-center mb-4 max-w-2xl mx-auto">
            <div className="font-['Pirata_One'] text-3xl text-[#2C241B] mb-2">Waiting in the lodge</div>
            <div className="font-['Bebas_Neue'] tracking-[0.3em] text-xs text-[#8C7356] mt-3 mb-1">SHARE THIS CODE</div>
            <div className="inline-block bg-[#1c0e06] border-2 border-[#FFD700] rounded px-6 py-3 text-5xl font-['Pirata_One'] text-[#FFD700] tracking-[0.4em]"
                 style={{ textShadow: "0 0 18px rgba(255,140,0,0.7)" }}
                 data-testid="room-code-display">
              {state.code}
            </div>
            <div className="mt-3 flex items-center gap-2 justify-center flex-wrap">
              <button onClick={() => { navigator.clipboard?.writeText(state.code); }}
                      className="btn-wood text-sm" data-testid="copy-code">📋 Copy Code</button>
              <button onClick={async () => {
                const url = `${window.location.origin}/poker/${state.code}`;
                if (navigator.share) {
                  try { await navigator.share({ title: "Join my LoxeLife game!", text: `Code: ${state.code}`, url }); }
                  catch (e) { if (e?.name !== "AbortError") { try { await navigator.clipboard?.writeText(url); } catch {} } }
                } else {
                  try { await navigator.clipboard?.writeText(url); } catch {}
                }
              }} className="btn-wood text-sm" data-testid="copy-link">🔗 Copy Link</button>
            </div>
            <div className="font-['Cinzel'] italic text-[#5C5042] text-sm mt-4">
              Players in the lodge: <b>{state.players.length}</b> · Need at least 2
            </div>
            <div className="mt-2 flex justify-center gap-2 flex-wrap" data-testid="players-roster">
              {state.players.map((p) => (
                <motion.span key={p.id}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="bg-[#FFD700]/20 border border-[#8C7356] rounded-full px-3 py-1 font-['Bebas_Neue'] tracking-widest text-xs text-[#2C241B]">
                  {p.name}{p.is_host ? " 👑" : ""}
                </motion.span>
              ))}
            </div>
            <button onClick={start} disabled={state.players.length < 2}
                    className="btn-chi mt-5 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    data-testid="start-game">
              {state.players.length < 2 ? `Waiting for ${2 - state.players.length} more player${2-state.players.length===1?"":"s"}...` : "Start the Game →"}
            </button>
            <div className="mt-4 text-left bg-black/5 border border-[#8C7356]/30 rounded p-3 font-['Cinzel'] text-xs text-[#2C241B]">
              <div className="font-['Bebas_Neue'] tracking-widest text-[#8C2703] mb-1">HOW TO WIN</div>
              <div className="mb-1">🛡️ <b>Wardens</b> protect the ecosystem — keep Harmony above 0 for 6 rounds.</div>
              <div className="mb-1">🜏 <b>One hidden Saboteur</b> sneaks invasive tiles in. Drag Harmony to 0 to win.</div>
              <div>Bluff. Challenge. Use Spirit Tiles. Trust no one.</div>
            </div>
          </div>
        )}

        {state.state !== "lobby" && (
          <>
            {/* YOUR TURN pulse banner (subtle but unmissable) */}
            <AnimatePresence>
              {myTurn && state.state === "playing" && !state.pending_play && (
                <motion.div
                  key="your-turn"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-3 rounded-md text-center py-2 font-['Bebas_Neue'] tracking-[0.4em] text-sm"
                  style={{
                    background: "linear-gradient(90deg, rgba(255,215,0,0.18), rgba(255,140,0,0.32), rgba(255,215,0,0.18))",
                    border: "1px solid rgba(255,215,0,0.55)",
                    color: "#FFD700",
                    boxShadow: "0 0 18px rgba(255,140,0,0.35)",
                    animation: "glow-pulse 2.2s ease-in-out infinite",
                  }}
                  data-testid="your-turn-banner">
                  ⟁ YOUR TURN — pick a tile &amp; slide it face-down ⟁
                </motion.div>
              )}
            </AnimatePresence>

            {/* High-stakes role banner */}
            <div className="bg-black/50 border-2 border-[#8C2703] rounded p-2 mb-3 text-center" data-testid="role-banner">
              <div className="font-['Bebas_Neue'] tracking-[0.3em] text-[10px] text-[#FFD700]">YOUR ROLE</div>
              <div className="font-['Pirata_One'] text-xl" style={{ color: state.is_saboteur ? "#FF4040" : "#A3D977" }}>
                {state.is_saboteur ? "🜏 THE SABOTEUR — drain Harmony to 0" : "🛡 A WARDEN — keep Harmony above 0 for 6 rounds"}
              </div>
              <div className="font-['Cinzel'] italic text-[10px] text-[#f4efe6]/70 mt-0.5">
                {state.is_saboteur
                  ? "Bluff with invasive species. Stay hidden. Trust no one."
                  : "Bluff when forced. Challenge the Saboteur. Protect the ecosystem."}
              </div>
            </div>

            {/* Board demand */}
            <div className="parchment p-4 rounded-md mb-4 text-center">
              <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042]">THE BOARD DEMANDS</div>
              <div className="font-['Pirata_One'] text-2xl text-[#2C241B]" data-testid="demand-label">{state.demand?.label || "—"}</div>
            </div>

            {/* Board tiles */}
            <div className="mb-4">
              <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]/80 mb-2">ECOSYSTEM</div>
              <div className="flex gap-2 overflow-x-auto sm:flex-wrap" data-testid="board-tiles">
                {state.board.map((t, i) => {
                  const meta = t.revealed ? RESULT_META[t.result] : null;
                  return (
                  <motion.div key={i}
                    initial={t.revealed ? { rotateY: 180, scale: 0.85, opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: t.revealed ? 0.7 : 0.35, ease: "easeOut" }}
                    className={`wood-tile ${t.revealed && t.actual ? `wood-tile-${t.actual.rarity}` : "wood-tile-3"} p-2 w-24 sm:w-28 shrink-0 relative`}
                    style={ meta ? { boxShadow: `0 0 22px ${meta.halo}, 0 0 4px ${meta.halo} inset` } : undefined }
                    data-testid={`board-tile-${i}`}>
                    {t.result === "passed_lie" && !t.revealed && (
                      <div className="absolute -inset-1 rounded-full pointer-events-none chi-glow"
                           style={{ background: "radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)" }} />
                    )}
                    {t.actual?.spirit_kind === "eclipse" && (
                      <svg viewBox="0 0 60 60" className="absolute -top-3 -right-3 w-8 h-8 pointer-events-none">
                        <circle cx="30" cy="30" r="22" fill="none" stroke="#FFD700" strokeWidth="2" />
                        <circle cx="30" cy="30" r="16" fill="#1a0e04" />
                        <circle cx="30" cy="30" r="22" fill="none" stroke="#FF8C00" strokeWidth="1" opacity="0.5">
                          <animate attributeName="r" values="22;28;22" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    )}
                    <div className="text-[10px] text-[#f4efe6]/70">{t.player_name} claimed:</div>
                    <div className="font-['Pirata_One'] text-sm text-[#f4efe6]">{t.claim}</div>
                    {t.revealed && t.actual ? (
                      <div className="mt-1">
                        <div className="font-['Space_Mono'] text-xs text-[#FFD700]">{t.actual.name}</div>
                        {meta && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-['Bebas_Neue'] tracking-widest text-[9px]"
                               style={{ background: `${meta.color}26`, color: meta.color, border: `1px solid ${meta.color}66` }}>
                            <span>{meta.icon}</span><span>{meta.label}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center mt-2 font-['Shojumaru'] text-[#8C7356]">⟁</div>
                    )}
                  </motion.div>
                  );
                })}
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
