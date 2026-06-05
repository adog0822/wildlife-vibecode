import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SaolaGuide from "../components/SaolaGuide";
import { playChi } from "../lib/sfx";
import { fetchAnimals } from "../lib/api";
import { getUnlocked } from "../lib/storage";
import { getDailyQuest, isQuestComplete } from "../lib/dailyQuest";

const Home = () => {
  const navigate = useNavigate();
  const [hour, setHour] = useState(new Date().getHours());
  const [quest, setQuest] = useState(null);
  const [questDone, setQuestDone] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 60_000);
    fetchAnimals().then((d) => {
      const q = getDailyQuest(d.animals || [], getUnlocked());
      setQuest(q);
      if (q) localStorage.setItem("loxedex.lastQuest", JSON.stringify(q));
      setQuestDone(isQuestComplete());
    });
    return () => clearInterval(t);
  }, []);

  const isNight = hour < 6 || hour >= 20;
  const ambient = isNight ? "rgba(50,80,180,0.18)" : "rgba(255,170,80,0.16)";
  const timeLabel = isNight ? "Night Watch" : (hour < 12 ? "Dawn Patrol" : (hour < 17 ? "Midday Expedition" : "Twilight Tracking"));

  return (
    <motion.div className="relative min-h-screen w-full overflow-hidden" style={{ background: "var(--color-desk)" }} data-testid="home-page"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="absolute inset-0" style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1619976553860-b7ffbe9a093b?auto=format&fit=crop&w=2400&q=80)",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at center, transparent 30%, #050708 100%), linear-gradient(0deg, ${ambient}, ${ambient})`
      }} />
      {/* drifting embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({length: 18}).map((_, i) => {
          const left = Math.random() * 100, top = Math.random() * 100;
          const delay = Math.random() * 5;
          return (
            <span key={i} className="absolute rounded-full"
              style={{ left: `${left}%`, top: `${top}%`,
                width: 3, height: 3, background: "#FFD700",
                boxShadow: "0 0 8px #FFD700",
                opacity: 0.5,
                animation: `float-y ${6 + Math.random()*6}s ease-in-out ${delay}s infinite` }}/>
          );
        })}
      </div>

      <div className="relative z-10 pt-10 px-8 text-center">
        <div className="font-['Space_Mono'] text-xs tracking-[0.5em] text-[#FFD700]/70 uppercase">{timeLabel}</div>
        <div className="font-['Luckiest_Guy'] text-6xl md:text-8xl tracking-wider mt-1"
             style={{ color: "#FFD700", textShadow: "0 0 32px rgba(255,140,0,0.7), 6px 6px 0 #4a2308" }}
             data-testid="brand-title">LOXELIFE</div>
        <div className="font-['Cinzel'] italic text-sm md:text-base text-[#f4efe6]/80 mt-2 max-w-2xl mx-auto">
          A scholar's desk at the edge of the wild world — open the book, unfurl the atlas, or strike the bamboo.
        </div>
      </div>

      {/* Daily Quest Banner */}
      {quest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="relative z-10 mx-auto max-w-3xl mt-4 px-4">
          <div className="parchment parchment-edge rounded-md px-5 py-3 flex items-center gap-3 unroll"
               data-testid="daily-quest">
            <svg viewBox="0 0 24 24" width="32" height="32" className="shrink-0">
              <circle cx="12" cy="12" r="10" fill="#FFD700" opacity="0.4" />
              <path d="M12 5 L13.5 10 L19 10.5 L14.7 14 L16.2 19 L12 16 L7.8 19 L9.3 14 L5 10.5 L10.5 10 Z"
                    fill="#8C2703" />
            </svg>
            <div className="flex-1">
              <div className="font-['Bebas_Neue'] tracking-widest text-xs text-[#8C2703]">
                THE SAOLA'S DAILY PROPHECY {questDone ? "· COMPLETED" : ""}
              </div>
              <div className="font-['Cinzel'] italic text-[#2C241B] text-sm md:text-base leading-snug">
                "{quest.hint}"
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-[#FFD700] text-lg" style={{ textShadow: "0 0 8px #FF8C00" }}>{"★".repeat(quest.rarity)}</div>
              <div className="font-['Space_Mono'] text-[10px] uppercase text-[#5C5042]">
                {quest.region} biome
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-16 py-10 max-w-7xl mx-auto">
        {/* LOXEDEX BOOK */}
        <button onClick={() => { playChi(); setTimeout(() => navigate("/loxedex"), 220); }} data-testid="open-loxedex"
          className="group relative aspect-[3/4] parchment parchment-edge rounded-md overflow-hidden text-left transition-transform hover:-translate-y-2 hover:rotate-[-1deg]">
          <div className="absolute left-0 top-0 bottom-0 w-4" style={{ background: "linear-gradient(180deg,#4a3018,#1c0c04)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#8C7356]">VOL. I</div>
            <div className="font-['Pirata_One'] text-6xl text-[#2C241B] my-2" style={{ textShadow: "2px 2px 0 rgba(140,115,86,0.4)" }}>Loxedex</div>
            <div className="font-['Cinzel'] text-sm text-[#5C5042] italic">An ancient parchment of every creature on earth</div>
            <div className="mt-6 font-['Bebas_Neue'] tracking-widest text-[#8C7356] text-sm border border-[#8C7356] px-4 py-1">OPEN THE BOOK →</div>
          </div>
        </button>

        {/* WORLD MAP */}
        <button onClick={() => navigate("/map")} data-testid="open-map"
          className="group relative aspect-[3/4] rounded-md overflow-hidden text-left transition-transform hover:-translate-y-2 hover:rotate-[1deg]"
          style={{ background: "radial-gradient(circle at 50% 50%, #1a3a52 0%, #04101a 80%)", border: "2px solid #8C7356" }}>
          <div className="absolute inset-0 opacity-25" style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1604778202938-ed91e9e16ca4?auto=format&fit=crop&w=1600&q=80)",
            backgroundSize: "cover", mixBlendMode: "screen"
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(2px 2px at 20% 30%, #FFD700, transparent), radial-gradient(2px 2px at 70% 60%, #4ADE80, transparent), radial-gradient(2px 2px at 40% 80%, #F28D9F, transparent), radial-gradient(2px 2px at 85% 25%, #5EC4D9, transparent)",
            opacity: 0.7
          }} />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#FFD700]/70">VOL. II</div>
            <div className="font-['Pirata_One'] text-6xl text-[#FFD700] my-2" style={{ textShadow: "0 0 24px rgba(255,140,0,0.7)" }}>The World</div>
            <div className="font-['Cinzel'] text-sm text-[#f4efe6]/80 italic">Unroll the atlas of seven continents and eight biomes</div>
            <div className="mt-6 font-['Bebas_Neue'] tracking-widest text-[#FFD700] text-sm border border-[#FFD700] px-4 py-1">EXPLORE BIOMES →</div>
          </div>
        </button>

        {/* GAME BOX */}
        <button onClick={() => { playChi(); setTimeout(() => navigate("/games"), 220); }} data-testid="open-games"
          className="group relative aspect-[3/4] rounded-md overflow-hidden text-left transition-transform hover:-translate-y-2 hover:rotate-[-1deg]"
          style={{ background: "linear-gradient(180deg, #3d2510 0%, #1c0e06 100%)", border: "2px solid #8C7356" }}>
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 4px), repeating-linear-gradient(85deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 8px)"
          }} />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#FFD700]/70">VOL. III</div>
            <div className="font-['Pirata_One'] text-6xl text-[#FFD700] my-2" style={{ textShadow: "0 0 24px rgba(255,140,0,0.7)" }}>Trials</div>
            <div className="font-['Cinzel'] text-sm text-[#f4efe6]/80 italic">The carved wooden box of trials — singleplayer & multiplayer</div>
            <div className="mt-6 font-['Bebas_Neue'] tracking-widest text-[#FFD700] text-sm border border-[#FFD700] px-4 py-1">PLAY →</div>
          </div>
        </button>
      </div>

      <SaolaGuide context="user is on home/desk page" />
    </motion.div>
  );
};

export default Home;
