import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchScholarRound, submitLeaderboard } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { playDing, playWrong, playChi } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import { getPlayerName } from "../lib/storage";
import SaolaGuide from "../components/SaolaGuide";

const BEST_KEY = "scholar.best";
const SCORES_KEY = "scholar.scores";

const getBest = () => parseInt(localStorage.getItem(BEST_KEY) || "0");
const setBest = (n) => localStorage.setItem(BEST_KEY, String(n));
const recordScore = (n) => {
  try {
    const arr = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    arr.push({ score: n, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(arr.slice(-50)));
  } catch {}
};

const Singleplayer = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [images, setImages] = useState({});
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBestState] = useState(getBest());
  const [newRecord, setNewRecord] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flashRed, setFlashRed] = useState(false);

  const loadRound = async () => {
    setPicked(null);
    const r = await fetchScholarRound();
    setRound(r);
    const imgs = {};
    await Promise.all(r.options.map(async (o) => { imgs[o.id] = await getWikiImage(o.wiki); }));
    setImages((prev) => ({ ...prev, ...imgs }));
  };
  useEffect(() => { loadRound(); }, []);

  const handlePick = (id) => {
    if (picked) return;
    setPicked(id);
    const correct = id === round.correct_id;
    if (correct) {
      playDing();
      setSaolaMood("lanternFlare", 900);
      setScore((s) => s + 1);
      setTimeout(loadRound, 1400);
    } else {
      // Dramatic wrong sequence
      playWrong();
      setSaolaMood("wideEyes", 1800);
      setShaking(true);
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 350);
      setTimeout(() => setShaking(false), 1200);
      setTimeout(() => {
        const finalScore = score;
        if (finalScore > best) {
          setBest(finalScore); setBestState(finalScore); setNewRecord(true);
        }
        recordScore(finalScore);
        // Submit to global leaderboard (fire-and-forget)
        if (finalScore > 0) {
          const playerName = getPlayerName() || "Anonymous Scholar";
          submitLeaderboard({ name: playerName, score: finalScore, biome: round?.options?.[0]?.region })
            .catch(() => {});
        }
        setGameOver(true);
      }, 1500);
    }
  };

  const reset = () => {
    setScore(0); setGameOver(false); setNewRecord(false); setBestState(getBest()); loadRound();
  };

  if (!round) return <div className="min-h-screen flex items-center justify-center text-[#FFD700] font-['Pirata_One'] text-2xl">Summoning a trial…</div>;

  return (
    <motion.div className={`min-h-screen relative ${shaking ? "shake" : ""}`}
                style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }}
                data-testid="singleplayer-page"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Red flash overlay on wrong */}
      <AnimatePresence>
        {flashRed && (
          <motion.div className="absolute inset-0 z-40 pointer-events-none"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ background: "radial-gradient(circle, rgba(220,30,30,0.55), rgba(120,8,8,0.4))" }} />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <button onClick={() => navigate("/games")} className="btn-wood text-sm" data-testid="sp-back">← Box</button>
          <div className="font-['Pirata_One'] text-3xl md:text-4xl text-[#FFD700]">Scholar's Trial</div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => navigate("/scholar/leaderboard")} className="font-['Bebas_Neue'] tracking-widest text-[#f4efe6]/70 hover:text-[#FFD700]" data-testid="sp-leaderboard-link">📜 Records</button>
            <div className="font-['Bebas_Neue'] tracking-widest text-[#FFD700]" data-testid="sp-score">Streak: {score}</div>
            <div className="font-['Bebas_Neue'] tracking-widest text-[#f4efe6]/70" data-testid="sp-best">Best: {best}</div>
          </div>
        </div>

        <div className="parchment parchment-edge rounded-md p-6 md:p-10 unroll">
          <div className="text-center font-['Cinzel'] italic text-lg md:text-2xl text-[#2C241B] mb-6" data-testid="sp-fact">"{round.fact}"</div>
          <div className="text-center font-['Bebas_Neue'] tracking-widest text-[#5C5042] mb-6">Which creature is this true of?</div>
          <div className="grid grid-cols-2 gap-6">
            {round.options.map((o) => {
              const ok = picked && o.id === round.correct_id;
              const bad = picked && o.id === picked && picked !== round.correct_id;
              return (
                <motion.button
                  key={o.id}
                  data-testid={`sp-option-${o.id}`}
                  onClick={() => handlePick(o.id)}
                  whileHover={!picked ? { scale: 1.03 } : {}}
                  animate={bad ? { rotate: [0,-3,3,-3,3,0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`wood-tile wood-tile-3 p-3 transition-all ${ok ? "chi-glow scale-105" : ""} ${bad ? "opacity-40" : ""}`}>
                  <div className="w-full aspect-square bg-black/30 rounded overflow-hidden mb-2 relative">
                    {images[o.id] && <img src={images[o.id]} alt={o.name} className="w-full h-full object-cover pyrography" />}
                    {bad && <div className="absolute inset-0 bg-red-600/40" />}
                    {ok && <div className="absolute inset-0 bg-yellow-300/30" />}
                  </div>
                  <div className="font-['Pirata_One'] text-xl text-[#f4efe6] text-center">{o.name}</div>
                  <div className="text-center text-[#FFD700] text-sm">{"★".repeat(o.rarity)}</div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {gameOver && (
              <motion.div className="mt-6 text-center"
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6 }}>
                <div className="font-['Luckiest_Guy'] text-4xl md:text-5xl text-[#FF8C00] burn-in" style={{ textShadow: "2px 2px 0 #4a2308" }}>The Trial Ends</div>
                <div className="font-['Cinzel'] text-[#2C241B] mt-2 text-lg">Your final streak: <b>{score}</b></div>
                {newRecord ? (
                  <motion.div className="font-['Shojumaru'] text-[#FFD700] text-xl mt-1 chi-glow inline-block px-3 py-1 rounded"
                              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: 3 }}
                              data-testid="sp-new-record">
                    ★ NEW PERSONAL BEST ★
                  </motion.div>
                ) : (
                  <div className="font-['Cinzel'] italic text-[#5C5042] text-sm mt-1">Personal best: {best}</div>
                )}
                <div className="mt-4 flex gap-2 justify-center">
                  <button onClick={reset} className="btn-chi" data-testid="sp-restart">Try Again</button>
                  <button onClick={() => navigate("/scholar/leaderboard")} className="btn-wood" data-testid="sp-records">View Records</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SaolaGuide context={`playing scholar's trial, streak ${score}`} />
    </motion.div>
  );
};

export default Singleplayer;
