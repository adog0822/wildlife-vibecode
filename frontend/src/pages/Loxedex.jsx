import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAnimals } from "../lib/api";
import AnimalCard from "../components/AnimalCard";
import SaolaGuide from "../components/SaolaGuide";
import { unlock as unlockId, getUnlocked } from "../lib/storage";
import { playUnlock, playUnroll, playChi } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";

const REGION_LABELS = {
  savanna: "Sun-Baked Savanna", dunes: "The Great Dunes", canopy: "Emerald Canopy",
  peaks: "Mystic Peaks", woods: "Whispering Woods", outback: "Crimson Outback",
  wastes: "Frozen Wastes", ocean: "The Deep Blue",
};

const Loxedex = () => {
  const navigate = useNavigate();
  const { region } = useParams();
  const [animals, setAnimals] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const [unlocked, setUnlocked] = useState(getUnlocked());

  useEffect(() => {
    playUnroll();
    fetchAnimals(region).then((d) => setAnimals(d.animals || []));
  }, [region]);

  const filtered = animals.filter((a) => filter === "all" || a.rarity === parseInt(filter));

  const handleClick = (a) => {
    if (a.rarity <= 2 || unlocked.includes(a.id)) {
      playChi();
      navigate(`/animal/${a.id}`);
    } else {
      unlockId(a.id);
      setUnlocked(getUnlocked());
      if (a.rarity === 5) { playUnlock(); setSaolaMood("lanternFlare", 2200); }
      else { playChi(); setSaolaMood("wideEyes", 1400); }
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 700);
      setTimeout(() => navigate(`/animal/${a.id}?unlock=1`), 500);
    }
  };

  const Ornament = () => (
    <svg viewBox="0 0 200 12" className="w-full h-4 my-2 opacity-80" preserveAspectRatio="none">
      <path d="M0 6 L80 6 M120 6 L200 6" stroke="#8C7356" strokeWidth="0.8" />
      <circle cx="100" cy="6" r="3" fill="#8C7356" />
      <circle cx="100" cy="6" r="1.5" fill="#FFD700" />
      <path d="M85 6 L95 2 M85 6 L95 10 M115 6 L105 2 M115 6 L105 10" stroke="#8C7356" strokeWidth="0.8" fill="none" />
    </svg>
  );

  return (
    <motion.div className="min-h-screen w-full" data-testid="loxedex-page" style={{ background: "var(--color-desk)", perspective: "1500px" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1619976553860-b7ffbe9a093b?auto=format&fit=crop&w=2000&q=80)",
        backgroundSize: "cover", mixBlendMode: "soft-light"
      }} />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="btn-wood" data-testid="loxedex-back">← Back</button>
          <button onClick={() => setShowAll((s) => !s)} className="btn-chi text-sm" data-testid="toggle-show-all">
            {showAll ? "Hide undiscovered" : "Show all"}
          </button>
        </div>

        <motion.div
          initial={{ rotateX: -85, opacity: 0, y: -40 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          className="parchment parchment-edge rounded-md p-6 md:p-12 relative">
          {/* corner ornaments */}
          {[
            { c: "top-3 left-3", r: 0 }, { c: "top-3 right-3", r: 90 },
            { c: "bottom-3 right-3", r: 180 }, { c: "bottom-3 left-3", r: 270 }
          ].map((o, i) => (
            <svg key={i} viewBox="0 0 40 40" className={`absolute ${o.c} w-10 h-10 opacity-50`} style={{ transform: `rotate(${o.r}deg)` }}>
              <path d="M2 2 L20 2 M2 2 L2 20 M5 5 Q15 5 15 15" stroke="#8C7356" strokeWidth="1.2" fill="none" />
              <circle cx="5" cy="5" r="2" fill="#8C7356" />
            </svg>
          ))}

          <div className="text-center">
            <div className="font-['Bebas_Neue'] tracking-[0.5em] text-xs text-[#8C7356]">VOLUMEN MUNDI</div>
            <div className="font-['Pirata_One'] text-5xl md:text-7xl text-[#2C241B] leading-none"
                 style={{ textShadow: "2px 2px 0 rgba(140,115,86,0.3)" }}>
              The Loxedex
            </div>
            {region && (
              <div className="font-['Cinzel'] italic text-[#5C5042] mt-1">
                Volume of the {REGION_LABELS[region] || region}
              </div>
            )}
            <Ornament />
          </div>

          {/* filters */}
          <div className="flex items-center gap-2 my-4 flex-wrap justify-center">
            <span className="font-['Space_Mono'] text-xs uppercase tracking-widest text-[#5C5042]">Rarity:</span>
            {["all",1,2,3,4,5].map((r) => (
              <button key={r} onClick={() => setFilter(r)} data-testid={`filter-rarity-${r}`}
                className={`px-3 py-1 text-xs border-2 rounded-sm transition-all ${
                  filter===r
                    ? "bg-[#2C241B] text-[#FFD700] border-[#2C241B]"
                    : "border-[#8C7356] text-[#5C5042] hover:bg-[#D4C4A8]/40"}`}>
                {r === "all" ? "ALL" : "★".repeat(r)}
              </button>
            ))}
            <span className="ml-3 font-['Bebas_Neue'] tracking-widest text-sm text-[#2C241B]" data-testid="loxedex-count">
              {unlocked.length} / {animals.length} <span className="text-[#5C5042]">discovered</span>
            </span>
          </div>

          <Ornament />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6 mt-4">
            {filtered.map((a) => (
              (showAll || unlocked.includes(a.id) || a.rarity <= 2) ? (
                <AnimalCard key={a.id} animal={a} onClick={() => handleClick(a)} forceUnlock={showAll} />
              ) : (
                <AnimalCard key={a.id} animal={a} onClick={() => handleClick(a)} />
              )
            ))}
          </div>

          <Ornament />
          <div className="text-center font-['Cinzel'] italic text-[#5C5042] text-sm mt-2">
            "Every creature carries a piece of the world's secret."
          </div>
        </motion.div>
      </div>
      <SaolaGuide context="user is browsing the Loxedex" />
    </motion.div>
  );
};

export default Loxedex;
