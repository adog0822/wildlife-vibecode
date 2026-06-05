import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAnimals } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked, unlock } from "../lib/storage";
import { startAmbient, stopAmbient, playUnlock, playChi } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

// Painterly + atmospheric configs per biome
const BIOMES = {
  savanna: {
    label: "Sun-Baked Savanna",
    tagline: "Drag across the plain. The grass hides golden eyes.",
    layers: [
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 70%, rgba(255,180,80,0.18), transparent 70%), linear-gradient(180deg, rgba(217,119,54,0.05) 0%, rgba(20,8,2,0.55) 100%)",
    accent: "#F2C047", accentDeep: "#D97736",
    particle: "heat", ambient: "savanna",
    flyers: { kind: "bird", count: 4, color: "#1a0e04" },
  },
  dunes: {
    label: "The Great Dunes",
    tagline: "Sand whispers ancient secrets. Drag to scout the mirage.",
    layers: [
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 60% 50%, rgba(242,159,5,0.2), transparent 70%), linear-gradient(180deg, rgba(242,159,5,0.05) 0%, rgba(11,29,64,0.7) 100%)",
    accent: "#F29F05", accentDeep: "#8c4a02",
    particle: "sand", ambient: "dunes",
    flyers: { kind: "bird", count: 3, color: "#3a2010" },
  },
  canopy: {
    label: "Emerald Canopy",
    tagline: "Mist hangs in the green cathedral. Push the leaves aside.",
    layers: [
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1500354960686-12270e96d660?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 60%, rgba(74,222,128,0.18), transparent 70%), linear-gradient(180deg, rgba(30,89,40,0.25) 0%, rgba(4,16,8,0.7) 100%)",
    accent: "#A3D977", accentDeep: "#1E5928",
    particle: "mist", ambient: "canopy",
    flyers: { kind: "butterfly", count: 6, color: "#F2C047" },
  },
  peaks: {
    label: "Mystic Peaks",
    tagline: "Wind sings through prayer flags. Drag across the ridge.",
    layers: [
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 30%, rgba(224,242,242,0.15), transparent 70%), linear-gradient(180deg, rgba(123,166,166,0.1) 0%, rgba(8,18,26,0.75) 100%)",
    accent: "#E0F2F2", accentDeep: "#7BA6A6",
    particle: "snow", ambient: "peaks",
    flyers: { kind: "bird", count: 3, color: "#1a0e04" },
  },
  woods: {
    label: "Whispering Woods",
    tagline: "Moss-laced silence. Something rustles in the auburn dark.",
    layers: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 50%, rgba(115,32,2,0.2), transparent 70%), linear-gradient(180deg, rgba(38,64,39,0.3) 0%, rgba(6,3,10,0.85) 100%)",
    accent: "#A0531A", accentDeep: "#732002",
    particle: "spores", ambient: "woods",
    flyers: { kind: "bird", count: 4, color: "#1a0e04" },
  },
  outback: {
    label: "Crimson Outback",
    tagline: "Red earth hums. A kookaburra cackles at the dusk.",
    layers: [
      "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1493497029755-f49c8e9ac619?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 50%, rgba(140,39,3,0.2), transparent 70%), linear-gradient(180deg, rgba(217,105,65,0.08) 0%, rgba(10,4,2,0.75) 100%)",
    accent: "#D96941", accentDeep: "#8C2703",
    particle: "dust", ambient: "outback",
    flyers: { kind: "bird", count: 3, color: "#3a2010" },
  },
  wastes: {
    label: "Frozen Wastes",
    tagline: "Auroras wash the ice. Drag to hunt the silence.",
    layers: [
      "https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 30%, rgba(94,196,217,0.2), transparent 70%), linear-gradient(180deg, rgba(207,233,245,0.08) 0%, rgba(4,8,12,0.75) 100%)",
    accent: "#cfe9f5", accentDeep: "#5EC4D9",
    particle: "snow", ambient: "wastes",
    flyers: { kind: "bird", count: 2, color: "#3a2010" },
  },
  ocean: {
    label: "The Deep Blue",
    tagline: "Bioluminescence drifts. Drag across the abyss.",
    layers: [
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=2400&q=80",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80",
    ],
    overlay: "radial-gradient(circle at 50% 60%, rgba(2,48,89,0.35), transparent 70%), linear-gradient(180deg, rgba(242,141,159,0.05) 0%, rgba(2,6,14,0.85) 100%)",
    accent: "#F28D9F", accentDeep: "#023059",
    particle: "bubbles", ambient: "ocean",
    flyers: { kind: "fish", count: 5, color: "#F28D9F" },
  },
};

// hash helpers
const hashCode = (s) => {
  let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h) + s.charCodeAt(i);
  return Math.abs(h);
};

const SCENE_WIDTH = 4800;

const Flyer = ({ kind, color, delay, top }) => {
  if (kind === "bird") {
    return (
      <motion.svg
        viewBox="0 0 60 20" width="60" height="20"
        className="absolute pointer-events-none drop-shadow-md"
        style={{ top: `${top}%` }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: SCENE_WIDTH + 100, opacity: [0,1,1,0] }}
        transition={{ duration: 28, repeat: Infinity, delay, ease: "linear" }}>
        <motion.path d="M0 10 Q15 0 30 10 Q45 0 60 10"
          stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
          animate={{ d: ["M0 10 Q15 0 30 10 Q45 0 60 10","M0 10 Q15 18 30 10 Q45 18 60 10","M0 10 Q15 0 30 10 Q45 0 60 10"] }}
          transition={{ duration: 0.6, repeat: Infinity }} />
      </motion.svg>
    );
  }
  if (kind === "butterfly") {
    return (
      <motion.div className="absolute pointer-events-none" style={{ top: `${top}%`, color }}
        initial={{ x: -50 }} animate={{ x: SCENE_WIDTH + 50, y: [0, -30, 10, -20, 0] }}
        transition={{ duration: 35, repeat: Infinity, delay, ease: "linear", y: { duration: 4, repeat: Infinity }}}>
        <svg viewBox="0 0 30 20" width="22" height="18">
          <motion.ellipse cx="10" cy="10" rx="8" ry="6" fill="currentColor" opacity="0.8"
            animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
          <motion.ellipse cx="20" cy="10" rx="8" ry="6" fill="currentColor" opacity="0.8"
            animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
        </svg>
      </motion.div>
    );
  }
  if (kind === "fish") {
    return (
      <motion.div className="absolute pointer-events-none" style={{ top: `${top}%`, color }}
        initial={{ x: -60 }} animate={{ x: SCENE_WIDTH + 60, y: [0, 15, -10, 5, 0] }}
        transition={{ duration: 32, repeat: Infinity, delay, ease: "linear", y: { duration: 6, repeat: Infinity }}}>
        <svg viewBox="0 0 40 20" width="36" height="18">
          <path d="M0 10 Q10 2 25 10 Q10 18 0 10 Z" fill="currentColor" opacity="0.7" />
          <path d="M25 10 L40 4 L37 10 L40 16 Z" fill="currentColor" opacity="0.7" />
          <circle cx="8" cy="8" r="1.5" fill="#1a0e04" />
        </svg>
      </motion.div>
    );
  }
  return null;
};

const Particles = ({ kind, color }) => {
  const arr = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {arr.map((_, i) => {
        const left = Math.random() * 100, top = Math.random() * 100;
        const delay = Math.random() * 6;
        const size = kind === "snow" || kind === "spores" ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
        return (
          <span key={i} className="absolute rounded-full opacity-60"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size,
                     background: color, boxShadow: `0 0 ${size*2}px ${color}`,
                     animation: `float-y ${4 + Math.random()*6}s ease-in-out ${delay}s infinite` }} />
        );
      })}
    </div>
  );
};

const Star = ({ filled, color }) => <span className={filled ? "" : "opacity-30"} style={{ color }}>★</span>;

const BiomeView = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const biome = BIOMES[key] || BIOMES.savanna;
  const [animals, setAnimals] = useState([]);
  const [tx, setTx] = useState(0);
  const [revealed, setRevealed] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [images, setImages] = useState({});
  const [showHint, setShowHint] = useState(true);
  const dragRef = useRef({ active: false, sx: 0, stx: 0 });
  const viewportRef = useRef(null);

  useEffect(() => {
    fetchAnimals(key).then((d) => setAnimals(d.animals || []));
    startAmbient(biome.ambient);
    // restore discovered set from localStorage for this biome
    try {
      const stored = JSON.parse(localStorage.getItem(`biome.discovered.${key}`) || "[]");
      setDiscovered(new Set(stored));
    } catch {}
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => { stopAmbient(); clearTimeout(t); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // viewport width
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const r = () => setVw(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  const maxTx = -(SCENE_WIDTH - vw);

  // Deterministic hotspot positions per animal
  const hotspots = useMemo(() => {
    if (!animals.length) return [];
    return animals.map((a, i) => {
      const margin = 280;
      const usable = SCENE_WIDTH - margin * 2;
      const base = margin + (i / Math.max(animals.length - 1, 1)) * usable;
      const jitterX = (hashCode(a.id + "x") % 160) - 80;
      const jitterY = hashCode(a.id + "y") % 100;
      const y = 38 + (jitterY / 100) * 38; // 38..76 %
      const layer = hashCode(a.id) % 3;
      return { a, x: Math.max(margin, Math.min(SCENE_WIDTH - margin, base + jitterX)), y, layer };
    });
  }, [animals]);

  // Drag / pan
  const startPan = (cx) => { dragRef.current = { active: true, sx: cx, stx: tx }; setShowHint(false); };
  const movePan = (cx) => {
    if (!dragRef.current.active) return;
    let nt = dragRef.current.stx + (cx - dragRef.current.sx);
    nt = Math.min(0, Math.max(maxTx, nt));
    setTx(nt);
  };
  const endPan = () => { dragRef.current.active = false; };
  const onMouseDown = (e) => startPan(e.clientX);
  const onMouseMove = (e) => movePan(e.clientX);
  const onMouseUp = endPan;
  const onTouchStart = (e) => startPan(e.touches[0].clientX);
  const onTouchMove = (e) => movePan(e.touches[0].clientX);
  const onTouchEnd = endPan;
  const onWheel = (e) => {
    let nt = tx - e.deltaX - e.deltaY;
    nt = Math.min(0, Math.max(maxTx, nt));
    setTx(nt);
  };

  const handleHotspot = async (h) => {
    if (dragRef.current.active) return; // ignore clicks during drag
    if (!images[h.a.id]) {
      const url = await getWikiImage(h.a.wiki);
      setImages((c) => ({ ...c, [h.a.id]: url }));
    }
    setRevealed(h);
    const next = new Set(discovered); next.add(h.a.id); setDiscovered(next);
    localStorage.setItem(`biome.discovered.${key}`, JSON.stringify([...next]));
    if (!isUnlocked(h.a.id) && h.a.rarity >= 3) unlock(h.a.id);
    if (h.a.rarity === 5) { playUnlock(); setSaolaMood("lanternFlare", 2200); }
    else if (h.a.rarity >= 3) { playUnlock(); setSaolaMood("wideEyes", 1500); }
    else { playChi(); }
  };

  const inspect = (a) => {
    setRevealed(null);
    navigate(`/animal/${a.id}`);
  };

  // Minimap markers
  const minimapPos = (x) => (x / SCENE_WIDTH) * 100;
  const viewportPos = (-tx / SCENE_WIDTH) * 100;
  const viewportW = (vw / SCENE_WIDTH) * 100;

  return (
    <motion.div className="relative w-screen h-screen overflow-hidden select-none" data-testid={`biome-${key}`}
      initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between"
           style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent)" }}>
        <button onClick={() => navigate("/map")} className="btn-wood" data-testid="biome-back">← Atlas</button>
        <div className="text-center">
          <div className="font-['Luckiest_Guy'] text-2xl md:text-4xl tracking-wider"
               style={{ color: biome.accent, textShadow: `0 0 18px ${biome.accentDeep}, 2px 2px 0 rgba(0,0,0,0.8)` }}
               data-testid="biome-title">{biome.label}</div>
          <div className="font-['Cinzel'] italic text-xs md:text-sm text-[#f4efe6]/85">{biome.tagline}</div>
        </div>
        <button onClick={() => navigate(`/region/${key}`)} className="btn-chi text-xs md:text-sm" data-testid="open-region-loxedex">
          Loxedex
        </button>
      </div>

      {/* Discovery counter */}
      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/60 border border-white/20 rounded-full px-4 py-1 backdrop-blur-sm"
           data-testid="biome-discovery-counter">
        <div className="w-3 h-3 rounded-full glow-pulse" style={{ background: biome.accent, boxShadow: `0 0 12px ${biome.accent}` }} />
        <span className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]">
          {discovered.size} / {animals.length} discovered
        </span>
      </div>

      {/* Drag hint */}
      {showHint && (
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}>
          <div className="font-['Pirata_One'] text-2xl md:text-4xl text-[#f4efe6] text-center"
               style={{ textShadow: "0 0 20px rgba(0,0,0,0.9)" }}>
            ← drag to explore →
          </div>
        </motion.div>
      )}

      {/* The scrolling scene */}
      <div ref={viewportRef}
           onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
           onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
           onWheel={onWheel}
           className="absolute inset-0 cursor-grab active:cursor-grabbing"
           style={{ touchAction: "pan-y" }}>

        {/* Background layer (slow parallax) */}
        <div className="absolute inset-y-0 left-0 bg-cover bg-center"
             style={{
               width: SCENE_WIDTH,
               backgroundImage: `url(${biome.layers[0]})`,
               backgroundSize: "cover",
               transform: `translateX(${tx * 0.5}px)`,
               filter: "saturate(1.15) contrast(1.05)",
             }} />

        {/* Mid layer (medium parallax) */}
        <div className="absolute inset-y-0 left-0 opacity-50"
             style={{
               width: SCENE_WIDTH,
               backgroundImage: `url(${biome.layers[1]})`,
               backgroundSize: "cover",
               backgroundPosition: "center",
               transform: `translateX(${tx * 0.75}px)`,
               mixBlendMode: "overlay",
             }} />

        {/* Atmospheric overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: biome.overlay }} />

        {/* Foreground hotspots (fast parallax = full speed) */}
        <div className="absolute inset-y-0 left-0"
             style={{ width: SCENE_WIDTH, transform: `translateX(${tx}px)` }}>

          {/* idle flyers */}
          {Array.from({ length: biome.flyers.count }).map((_, i) => (
            <Flyer key={i} kind={biome.flyers.kind} color={biome.flyers.color}
                   delay={i * (28 / biome.flyers.count)}
                   top={biome.flyers.kind === "fish" ? 40 + (i*8)%40 : 8 + (i*7)%25} />
          ))}

          {/* hotspots */}
          {hotspots.map((h) => {
            const disc = discovered.has(h.a.id);
            const size = h.a.rarity >= 4 ? 32 : 22;
            return (
              <button key={h.a.id}
                onClick={() => handleHotspot(h)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: h.x, top: `${h.y}%` }}
                data-testid={`hotspot-${h.a.id}`}>
                {/* glow halo */}
                <div className="absolute -inset-4 rounded-full glow-pulse"
                     style={{
                       background: `radial-gradient(circle, ${biome.accent}80 0%, transparent 70%)`,
                       opacity: disc ? 1 : 0.6,
                     }} />
                {/* pulse core */}
                <div className="relative rounded-full border-2 border-white/30 backdrop-blur-sm group-hover:scale-125 transition-transform"
                     style={{
                       width: size, height: size,
                       background: disc
                         ? `radial-gradient(circle, ${biome.accent}, ${biome.accentDeep})`
                         : `radial-gradient(circle, ${biome.accent}80, ${biome.accentDeep}40)`,
                       boxShadow: `0 0 ${size}px ${biome.accent}`,
                     }}>
                  {h.a.rarity === 5 && (
                    <div className="absolute inset-0 rounded-full animate-ping"
                         style={{ background: biome.accent, opacity: 0.4 }} />
                  )}
                  {disc && (
                    <div className="absolute inset-1 rounded-full bg-white/90 flex items-center justify-center text-[8px] font-bold text-black">
                      {"★".repeat(h.a.rarity).slice(0,3)}
                    </div>
                  )}
                </div>
                {/* hint text on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-['Bebas_Neue'] tracking-widest"
                     style={{ background: "rgba(0,0,0,0.8)", color: biome.accent }}>
                  {disc ? h.a.name : "TAP TO REVEAL"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Particles */}
        <Particles kind={biome.particle} color={biome.accent} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.7) 100%)" }} />
      </div>

      {/* Minimap */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[80vw] max-w-2xl bg-black/60 border border-white/20 rounded-full px-2 py-2 backdrop-blur-sm"
           data-testid="biome-minimap">
        <div className="relative h-2 bg-white/10 rounded-full">
          {hotspots.map((h) => (
            <div key={h.a.id}
                 className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full"
                 style={{
                   left: `${minimapPos(h.x)}%`,
                   width: h.a.rarity >= 4 ? 8 : 5, height: h.a.rarity >= 4 ? 8 : 5,
                   background: discovered.has(h.a.id) ? biome.accent : `${biome.accent}50`,
                   boxShadow: discovered.has(h.a.id) ? `0 0 8px ${biome.accent}` : "none",
                 }} />
          ))}
          {/* viewport indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 h-3 border-2 rounded-sm"
               style={{
                 left: `${viewportPos}%`, width: `${viewportW}%`,
                 borderColor: biome.accent,
                 background: `${biome.accent}20`,
               }} />
        </div>
      </div>

      {/* Revealed animal card overlay */}
      {revealed && (
        <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    onClick={() => setRevealed(null)}>
          <motion.div className="parchment parchment-edge rounded-lg p-6 max-w-md mx-4 burn-in"
                      onClick={(e) => e.stopPropagation()}
                      initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.7 }}
                      data-testid="revealed-card">
            <div className="w-full aspect-square bg-black/20 rounded overflow-hidden border-2 border-[#8C7356] mb-3 relative">
              {images[revealed.a.id] ? (
                <img src={images[revealed.a.id]} alt={revealed.a.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#5C5042]">…</div>
              )}
              {revealed.a.rarity === 5 && (
                <div className="absolute inset-0 chi-glow rounded pointer-events-none" />
              )}
            </div>
            <div className="font-['Pirata_One'] text-3xl text-[#2C241B] text-center">{revealed.a.name}</div>
            <div className="text-center mb-2" style={{ color: biome.accentDeep }}>
              {[1,2,3,4,5].map(i => <Star key={i} filled={i <= revealed.a.rarity} color={biome.accentDeep} />)}
            </div>
            <div className="font-['Cinzel'] italic text-[#5C5042] text-center text-sm mb-3">
              Superpower: <b>{revealed.a.superpower}</b>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRevealed(null)} className="btn-wood flex-1" data-testid="reveal-close">Keep Exploring</button>
              <button onClick={() => inspect(revealed.a)} className="btn-chi flex-1" data-testid="reveal-inspect">Full Page →</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <SaolaGuide context={`exploring the ${biome.label}`} />
    </motion.div>
  );
};

export default BiomeView;
