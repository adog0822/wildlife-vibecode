import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SaolaGuide from "../components/SaolaGuide";

const ScholarLeaderboard = () => {
  const navigate = useNavigate();
  let scores = [];
  try { scores = JSON.parse(localStorage.getItem("scholar.scores") || "[]"); } catch {}
  const best = parseInt(localStorage.getItem("scholar.best") || "0");
  const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  return (
    <motion.div className="min-h-screen" style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }}
                data-testid="scholar-leaderboard"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/singleplayer")} className="btn-wood text-sm" data-testid="leaderboard-back">← Trial</button>
          <div className="font-['Pirata_One'] text-3xl md:text-4xl text-[#FFD700]">The Scholar's Records</div>
          <div className="w-16" />
        </div>

        <div className="parchment parchment-edge rounded-md p-6 unroll">
          <div className="text-center font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#8C7356] mb-1">PERSONAL BEST</div>
          <div className="text-center font-['Luckiest_Guy'] text-5xl text-[#8C2703] mb-4" data-testid="best-score">{best}</div>

          <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#5C5042] mb-2">RECENT TRIALS (TOP 10)</div>
          {sorted.length === 0 ? (
            <div className="font-['Cinzel'] italic text-[#5C5042] text-center py-6">No trials recorded yet. Begin your first.</div>
          ) : (
            <ol className="space-y-2">
              {sorted.map((s, i) => (
                <li key={i} className="flex justify-between items-center border-b border-[#8C7356]/30 pb-1">
                  <div className="font-['Bebas_Neue'] tracking-widest text-[#2C241B] text-sm">
                    <span className="text-[#8C7356] mr-2">#{i+1}</span>
                    Streak {s.score}
                  </div>
                  <div className="font-['Space_Mono'] text-xs text-[#5C5042]">{formatDate(s.at)}</div>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/singleplayer")} className="btn-chi" data-testid="leaderboard-play">Begin Another Trial →</button>
          </div>
        </div>
      </div>
      <SaolaGuide context="viewing scholar's trial records" />
    </motion.div>
  );
};

export default ScholarLeaderboard;
