import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SaolaGuide from "../components/SaolaGuide";
import { fetchLeaderboard } from "../lib/api";

const BIOME_LABEL = {
  savanna: "Savanna", dunes: "Dunes", canopy: "Canopy", peaks: "Peaks",
  woods: "Woods", outback: "Outback", wastes: "Wastes", ocean: "Ocean",
};

const ScholarLeaderboard = () => {
  const navigate = useNavigate();
  let scores = [];
  try { scores = JSON.parse(localStorage.getItem("scholar.scores") || "[]"); } catch {}
  const best = parseInt(localStorage.getItem("scholar.best") || "0");
  const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  const [global, setGlobal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchLeaderboard(10)
      .then((d) => { if (alive) setGlobal(d.entries || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  const myRank = (() => {
    if (!best || global.length === 0) return null;
    const ahead = global.filter(g => g.score > best).length;
    return ahead + 1;
  })();

  return (
    <motion.div className="min-h-screen" style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }}
                data-testid="scholar-leaderboard"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <button onClick={() => navigate("/singleplayer")} className="btn-wood text-sm" data-testid="leaderboard-back">← Trial</button>
          <div className="font-['Pirata_One'] text-3xl md:text-4xl text-[#FFD700] text-center">The Scholar's Records</div>
          <div className="w-16" />
        </div>

        {/* GLOBAL LEADERBOARD — anchored by seeded scholars */}
        <div className="parchment parchment-edge rounded-md p-6 unroll mb-5" data-testid="global-leaderboard">
          <div className="flex items-center justify-between mb-2">
            <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#8C2703]">THE SANCTUARY HALL OF SCHOLARS</div>
            {myRank && <div className="font-['Space_Mono'] text-[10px] text-[#5C5042]">Your rank: <b className="text-[#8C2703]">#{myRank}</b></div>}
          </div>
          {loading ? (
            <div className="font-['Cinzel'] italic text-[#5C5042] text-center py-4">Consulting the archives…</div>
          ) : global.length === 0 ? (
            <div className="font-['Cinzel'] italic text-[#5C5042] text-center py-4">Records unavailable.</div>
          ) : (
            <ol className="space-y-1.5" data-testid="global-leaderboard-list">
              {global.map((s, i) => {
                const rank = i + 1;
                const isMe = best > 0 && s.score === best && !s.seed;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
                return (
                  <li key={i}
                      className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded ${isMe ? "bg-[#FFD700]/30 border border-[#8C2703]" : "border-b border-[#8C7356]/20"}`}
                      data-testid={`global-row-${rank}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-['Pirata_One'] text-lg text-[#8C2703] w-10 shrink-0 text-center">{medal}</span>
                      <span className="font-['Bebas_Neue'] tracking-widest text-sm text-[#2C241B] truncate">{s.name}</span>
                      {s.biome && <span className="font-['Cinzel'] italic text-[10px] text-[#5C5042] hidden sm:inline">· {BIOME_LABEL[s.biome] || s.biome}</span>}
                    </div>
                    <div className="font-['Luckiest_Guy'] text-xl text-[#8C2703] shrink-0">{s.score}</div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* PERSONAL RECORDS */}
        <div className="parchment parchment-edge rounded-md p-6 unroll">
          <div className="text-center font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#8C7356] mb-1">YOUR PERSONAL BEST</div>
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
