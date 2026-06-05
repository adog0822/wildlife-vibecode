import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAnimals } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked, unlock } from "../lib/storage";
import { startAmbient, stopAmbient, playUnlock, playChi } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

// Rich painterly scene per biome — vivid Unsplash imagery + atmospheric overlays
const BIOMES = {
  savanna: {
    label: "Sun-Baked Savanna",
    tagline: "The sun bleeds gold across the acacia. A lion's roar rolls over the plain.",
    bg: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 30% 40%, rgba(255,170,80,0.35), transparent 60%), linear-gradient(180deg, rgba(217,119,54,0.15) 0%, rgba(20,8,2,0.7) 100%)",
    accent: "#F2C047", accentDeep: "#D97736",
    particles: "heat",
  },
  dunes: {
    label: "The Great Dunes",
    tagline: "Shimmering heat carves mirages from the wind. Sand whispers ancient secrets.",
    bg: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 60% 40%, rgba(242,159,5,0.35), transparent 60%), linear-gradient(180deg, rgba(242,159,5,0.18) 0%, rgba(11,29,64,0.85) 100%)",
    accent: "#F29F05", accentDeep: "#8c4a02",
    particles: "sand",
  },
  canopy: {
    label: "Emerald Canopy",
    tagline: "Mist hangs in the green cathedral. A jaguar's eye gleams in the leaves.",
    bg: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 60%, rgba(74,222,128,0.25), transparent 60%), linear-gradient(180deg, rgba(30,89,40,0.4) 0%, rgba(4,16,8,0.85) 100%)",
    accent: "#A3D977", accentDeep: "#1E5928",
    particles: "mist",
  },
  peaks: {
    label: "Mystic Peaks",
    tagline: "Wind sings through prayer flags. The snow leopard becomes the mountain.",
    bg: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 30%, rgba(224,242,242,0.25), transparent 60%), linear-gradient(180deg, rgba(123,166,166,0.2) 0%, rgba(8,18,26,0.9) 100%)",
    accent: "#E0F2F2", accentDeep: "#7BA6A6",
    particles: "snow",
  },
  woods: {
    label: "Whispering Woods",
    tagline: "Moss-laced silence. A wolf's breath fogs the twilight.",
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 50%, rgba(115,32,2,0.35), transparent 60%), linear-gradient(180deg, rgba(38,64,39,0.4) 0%, rgba(6,3,10,0.92) 100%)",
    accent: "#A0531A", accentDeep: "#732002",
    particles: "spores",
  },
  outback: {
    label: "Crimson Outback",
    tagline: "Red earth hums under a cracked sky. A kookaburra cackles at the dusk.",
    bg: "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 50%, rgba(140,39,3,0.35), transparent 60%), linear-gradient(180deg, rgba(217,105,65,0.18) 0%, rgba(10,4,2,0.9) 100%)",
    accent: "#D96941", accentDeep: "#8C2703",
    particles: "dust",
  },
  wastes: {
    label: "Frozen Wastes",
    tagline: "Auroras wash the ice. Penguins gather in a holy huddle.",
    bg: "https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 30%, rgba(94,196,217,0.3), transparent 60%), linear-gradient(180deg, rgba(207,233,245,0.15) 0%, rgba(4,8,12,0.9) 100%)",
    accent: "#cfe9f5", accentDeep: "#5EC4D9",
    particles: "snow",
  },
  ocean: {
    label: "The Deep Blue",
    tagline: "Bioluminescence drifts in the dark. A blue whale's heartbeat shakes the abyss.",
    bg: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=2000&q=80",
    overlay: "radial-gradient(circle at 50% 60%, rgba(2,48,89,0.45), transparent 60%), linear-gradient(180deg, rgba(242,141,159,0.12) 0%, rgba(2,6,14,0.95) 100%)",
    accent: "#F28D9F", accentDeep: "#023059",
    particles: "bubbles",
  },
};

const Particles = ({ kind, color }) => {
  // CSS particles overlay
  const arr = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {arr.map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 6;
        const size = kind === "snow" || kind === "spores" ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
        return (
          <span key={i}
            className="absolute rounded-full opacity-70"
            style={{
              left: `${left}%`, top: `${top}%`,
              width: size, height: size,
              background: color,
              boxShadow: `0 0 ${size*2}px ${color}`,
              animation: `float-y ${4 + Math.random()*6}s ease-in-out ${delay}s infinite`,
            }} />
        );
      })}
    </div>
  );
};

const Star = ({ filled }) => <span className={filled ? "text-[#FFD700]" : "text-[#5C5042]"}>★</span>;

const BiomeView = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const biome = BIOMES[key] || BIOMES.savanna;
  const [animals, setAnimals] = useState([]);
  const [images, setImages] = useState({});

  useEffect(() => {
    fetchAnimals(key).then((d) => setAnimals(d.animals || []));
  }, [key]);

  useEffect(() => {
    animals.forEach(async (a) => {
      if (!images[a.id]) {
        const url = await getWikiImage(a.wiki);
        if (url) setImages((c) => ({ ...c, [a.id]: url }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animals]);

  const handlePick = (a) => {
    if (a.rarity >= 3 && !isUnlocked(a.id)) {
      unlock(a.id);
      if (a.rarity === 5) {
        playUnlock();
        setSaolaMood("lanternFlare", 2200);
      } else {
        playChi();
      }
      document.body.classList.add("shake");
      setTimeout(() => document.body.classList.remove("shake"), 700);
      setTimeout(() => navigate(`/animal/${a.id}?unlock=1`), 500);
    } else {
      playChi();
      navigate(`/animal/${a.id}`);
    }
  };

  return (
    <motion.div
      className="relative min-h-screen w-full overflow-hidden" data-testid={`biome-${key}`}
      initial={{ opacity: 0, scale: 1.15 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
      {/* Hero painted backdrop */}
      <motion.div className="absolute inset-0 bg-cover bg-center"
           initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "easeOut" }}
           style={{ backgroundImage: `url(${biome.bg})`, filter: "saturate(1.2) contrast(1.05)" }} />
      <div className="absolute inset-0" style={{ background: biome.overlay }} />
      <Particles kind={biome.particles} color={biome.accent} />

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />

      <div className="relative z-10 px-6 md:px-12 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/map")} className="btn-wood" data-testid="biome-back">← Atlas</button>
          <button onClick={() => navigate(`/region/${key}`)} className="btn-chi text-sm" data-testid="open-region-loxedex">
            Open Loxedex Region
          </button>
        </div>

        {/* Biome hero */}
        <div className="text-center mt-4 md:mt-10 mb-8">
          <div className="font-['Luckiest_Guy'] text-5xl md:text-7xl tracking-wider"
               style={{ color: biome.accent, textShadow: `0 0 28px ${biome.accentDeep}, 4px 4px 0 rgba(0,0,0,0.8)` }}
               data-testid="biome-title">
            {biome.label}
          </div>
          <div className="font-['Cinzel'] italic text-base md:text-xl text-[#f4efe6]/90 mt-3 max-w-3xl mx-auto px-4">
            {biome.tagline}
          </div>
          <div className="font-['Space_Mono'] text-xs tracking-widest text-[#FFD700] mt-2">
            {animals.length} creatures dwell here
          </div>
        </div>

        {/* Animal spirit nodes — floating glowing cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-7xl mx-auto" data-testid="biome-animals">
          {animals.slice(0, 30).map((a, i) => {
            const unlocked = a.rarity <= 2 || isUnlocked(a.id);
            return (
              <button
                key={a.id}
                onClick={() => handlePick(a)}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-transform hover:-translate-y-2 float-y"
                style={{
                  borderColor: a.rarity >= 4 ? biome.accent : "rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.4)",
                  animationDelay: `${(i % 8) * 0.3}s`,
                  boxShadow: a.rarity === 5 ? `0 0 30px ${biome.accent}` : "0 8px 20px rgba(0,0,0,0.6)",
                }}
                data-testid={`biome-animal-${a.id}`}
              >
                {images[a.id] ? (
                  <img src={images[a.id]} alt={a.name}
                       className={`absolute inset-0 w-full h-full object-cover ${unlocked ? "" : "charcoal"}`} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#f4efe6]/40 text-xs">…</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                {a.rarity >= 4 && unlocked && (
                  <div className="absolute inset-0 glow-pulse pointer-events-none"
                       style={{ boxShadow: `inset 0 0 30px ${biome.accent}`, mixBlendMode: "screen" }} />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                  <div className="font-['Pirata_One'] text-base text-[#f4efe6] leading-tight">
                    {unlocked ? a.name : "???"}
                  </div>
                  <div className="text-xs">
                    {[1,2,3,4,5].map(k => <Star key={k} filled={k <= a.rarity} />)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {animals.length > 30 && (
          <div className="text-center mt-6">
            <button onClick={() => navigate(`/region/${key}`)} className="btn-chi" data-testid="see-all-region">
              See All {animals.length} in the Loxedex →
            </button>
          </div>
        )}
      </div>

      <SaolaGuide context={`exploring the ${biome.label}`} />
    </motion.div>
  );
};

export default BiomeView;
