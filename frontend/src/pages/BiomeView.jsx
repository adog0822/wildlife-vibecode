import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAnimals } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked, unlock } from "../lib/storage";
import { startAmbient, stopAmbient, playUnlock, playChi, playFootstep } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

const BIOMES = {
  savanna: {
    label: "Sun-Baked Savanna",
    tagline: "Drag to roam. Push forward to step into the grass.",
    bg: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 70%, rgba(255,180,80,0.18), transparent 70%), linear-gradient(180deg, rgba(217,119,54,0.05) 0%, rgba(20,8,2,0.55) 100%)",
    accent: "#F2C047", accentDeep: "#D97736",
    particle: "heat", ambient: "savanna",
    wildlife: [
      { kind: "lion", count: 2 },
      { kind: "bird", count: 4 },
      { kind: "tallGrass", count: 14 },
    ],
    revealStyle: "walk-left",
  },
  dunes: {
    label: "The Great Dunes",
    tagline: "Sand whispers ancient secrets. Drag to scout, scroll to wade.",
    bg: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 60% 50%, rgba(242,159,5,0.2), transparent 70%), linear-gradient(180deg, rgba(242,159,5,0.05) 0%, rgba(11,29,64,0.7) 100%)",
    accent: "#F29F05", accentDeep: "#8c4a02",
    particle: "sand", ambient: "dunes",
    wildlife: [
      { kind: "scorpion", count: 2 },
      { kind: "bird", count: 2 },
      { kind: "dustDevil", count: 3 },
    ],
    revealStyle: "rise-from-sand",
  },
  canopy: {
    label: "Emerald Canopy",
    tagline: "Mist hangs in the green cathedral. Push deeper into the vines.",
    bg: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1500354960686-12270e96d660?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 60%, rgba(74,222,128,0.18), transparent 70%), linear-gradient(180deg, rgba(30,89,40,0.25) 0%, rgba(4,16,8,0.7) 100%)",
    accent: "#A3D977", accentDeep: "#1E5928",
    particle: "mist", ambient: "canopy",
    wildlife: [
      { kind: "butterfly", count: 8 },
      { kind: "monkey", count: 2 },
      { kind: "leaf", count: 12 },
    ],
    revealStyle: "swing-down",
  },
  peaks: {
    label: "Mystic Peaks",
    tagline: "Wind sings through prayer flags. Step into the ridgeline.",
    bg: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 30%, rgba(224,242,242,0.15), transparent 70%), linear-gradient(180deg, rgba(123,166,166,0.1) 0%, rgba(8,18,26,0.75) 100%)",
    accent: "#E0F2F2", accentDeep: "#7BA6A6",
    particle: "snow", ambient: "peaks",
    wildlife: [
      { kind: "eagle", count: 3 },
      { kind: "yak", count: 1 },
      { kind: "snowflake", count: 30 },
    ],
    revealStyle: "fade-from-snow",
  },
  woods: {
    label: "Whispering Woods",
    tagline: "Moss-laced silence. Something rustles in the auburn dark.",
    bg: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 50%, rgba(115,32,2,0.2), transparent 70%), linear-gradient(180deg, rgba(38,64,39,0.3) 0%, rgba(6,3,10,0.85) 100%)",
    accent: "#A0531A", accentDeep: "#732002",
    particle: "spores", ambient: "woods",
    wildlife: [
      { kind: "owl", count: 2 },
      { kind: "deer", count: 1 },
      { kind: "firefly", count: 18 },
    ],
    revealStyle: "step-from-trees",
  },
  outback: {
    label: "Crimson Outback",
    tagline: "Red earth hums. A kookaburra cackles at the dusk.",
    bg: "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1493497029755-f49c8e9ac619?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 50%, rgba(140,39,3,0.2), transparent 70%), linear-gradient(180deg, rgba(217,105,65,0.08) 0%, rgba(10,4,2,0.75) 100%)",
    accent: "#D96941", accentDeep: "#8C2703",
    particle: "dust", ambient: "outback",
    wildlife: [
      { kind: "kangaroo", count: 2 },
      { kind: "bird", count: 4 },
      { kind: "dustDevil", count: 2 },
    ],
    revealStyle: "hop-in",
  },
  wastes: {
    label: "Frozen Wastes",
    tagline: "Auroras wash the ice. Drag to hunt the silence.",
    bg: "https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 30%, rgba(94,196,217,0.2), transparent 70%), linear-gradient(180deg, rgba(207,233,245,0.08) 0%, rgba(4,8,12,0.75) 100%)",
    accent: "#cfe9f5", accentDeep: "#5EC4D9",
    particle: "snow", ambient: "wastes",
    wildlife: [
      { kind: "penguin", count: 3 },
      { kind: "snowflake", count: 50 },
      { kind: "aurora", count: 1 },
    ],
    revealStyle: "waddle-in",
  },
  ocean: {
    label: "The Deep Blue",
    tagline: "Bioluminescence drifts. Push deeper into the abyss.",
    bg: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=2400&q=80",
    mid: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2400&q=80",
    overlay: "radial-gradient(circle at 50% 60%, rgba(2,48,89,0.35), transparent 70%), linear-gradient(180deg, rgba(242,141,159,0.05) 0%, rgba(2,6,14,0.85) 100%)",
    accent: "#F28D9F", accentDeep: "#023059",
    particle: "bubbles", ambient: "ocean",
    wildlife: [
      { kind: "fish", count: 12 },
      { kind: "jellyfish", count: 3 },
      { kind: "shark", count: 1 },
    ],
    revealStyle: "swim-in",
  },
};

const hashCode = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h) + s.charCodeAt(i); return Math.abs(h); };

const SCENE_W = 6400;
const SCENE_H = 2400;

// === Per-biome wildlife sprites (SVG silhouettes) ===
const Wildlife = ({ kind, accent, accentDeep, idx }) => {
  const delay = (idx * 1.7) % 12;
  const duration = 18 + (idx * 3) % 18;
  if (kind === "lion") {
    const top = 70 + (idx*7) % 10;
    return (
      <motion.svg viewBox="0 0 100 50" width={120} height={60} className="absolute pointer-events-none"
        style={{ top: `${top}%` }}
        initial={{ x: -200 }} animate={{ x: SCENE_W + 200, y: [0, -2, 0, -2, 0] }}
        transition={{ duration: duration*2, repeat: Infinity, delay, ease: "linear", y: { duration: 1.2, repeat: Infinity }}}>
        <ellipse cx="60" cy="30" rx="28" ry="12" fill={accentDeep} opacity="0.85" />
        <circle cx="85" cy="22" r="10" fill={accentDeep} opacity="0.85" />
        <path d="M75 14 Q80 8 88 14 Q92 18 88 22" fill={accentDeep} opacity="0.85" />
        <path d="M35 30 L30 45 M45 30 L48 45 M70 32 L72 45 M82 32 L84 45" stroke={accentDeep} strokeWidth="2" />
      </motion.svg>
    );
  }
  if (kind === "tallGrass") {
    const left = (idx * 471) % SCENE_W;
    const top = 75 + (idx*3) % 15;
    return (
      <motion.svg viewBox="0 0 20 40" width="18" height="36" className="absolute pointer-events-none"
        style={{ left, top: `${top}%` }}
        animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 3 + (idx%3), repeat: Infinity }}>
        <path d="M10 40 L10 5" stroke={accentDeep} strokeWidth="1.5" />
        <path d="M10 40 L6 8" stroke={accentDeep} strokeWidth="1" />
        <path d="M10 40 L14 6" stroke={accentDeep} strokeWidth="1" />
      </motion.svg>
    );
  }
  if (kind === "bird") {
    const top = 5 + (idx * 6) % 20;
    return (
      <motion.svg viewBox="0 0 60 20" width="60" height="20" className="absolute pointer-events-none"
        style={{ top: `${top}%` }}
        initial={{ x: -100 }} animate={{ x: SCENE_W + 100 }}
        transition={{ duration: duration, repeat: Infinity, delay, ease: "linear" }}>
        <motion.path d="M0 10 Q15 0 30 10 Q45 0 60 10" stroke={accentDeep} strokeWidth="2" fill="none" strokeLinecap="round"
          animate={{ d: ["M0 10 Q15 0 30 10 Q45 0 60 10","M0 10 Q15 18 30 10 Q45 18 60 10","M0 10 Q15 0 30 10 Q45 0 60 10"] }}
          transition={{ duration: 0.6, repeat: Infinity }} />
      </motion.svg>
    );
  }
  if (kind === "butterfly") {
    const top = 25 + (idx * 5) % 40;
    return (
      <motion.div className="absolute pointer-events-none" style={{ top: `${top}%`, color: accent }}
        initial={{ x: -40 }} animate={{ x: SCENE_W + 40, y: [0, -40, 20, -25, 0] }}
        transition={{ duration: duration, repeat: Infinity, delay, ease: "linear", y: { duration: 5, repeat: Infinity }}}>
        <svg viewBox="0 0 30 20" width="22" height="18">
          <motion.ellipse cx="10" cy="10" rx="8" ry="6" fill="currentColor" opacity="0.85"
            animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
          <motion.ellipse cx="20" cy="10" rx="8" ry="6" fill="currentColor" opacity="0.85"
            animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
        </svg>
      </motion.div>
    );
  }
  if (kind === "fish") {
    const top = 20 + (idx * 7) % 60;
    return (
      <motion.div className="absolute pointer-events-none" style={{ top: `${top}%`, color: accent }}
        initial={{ x: -60 }} animate={{ x: SCENE_W + 60, y: [0, 25, -15, 10, 0] }}
        transition={{ duration: duration, repeat: Infinity, delay, ease: "linear", y: { duration: 7, repeat: Infinity }}}>
        <svg viewBox="0 0 40 20" width="36" height="18">
          <path d="M0 10 Q10 2 25 10 Q10 18 0 10 Z" fill="currentColor" opacity="0.75" />
          <path d="M25 10 L40 4 L37 10 L40 16 Z" fill="currentColor" opacity="0.75" />
          <circle cx="8" cy="8" r="1.5" fill="#1a0e04" />
        </svg>
      </motion.div>
    );
  }
  if (kind === "jellyfish") {
    const left = (idx * 1233) % SCENE_W;
    return (
      <motion.div className="absolute pointer-events-none" style={{ left, top: "30%", color: accent }}
        animate={{ y: [0, SCENE_H * 0.5, 0] }} transition={{ duration: 40, repeat: Infinity, delay }}>
        <svg viewBox="0 0 50 70" width="50" height="70">
          <ellipse cx="25" cy="20" rx="20" ry="14" fill="currentColor" opacity="0.5" />
          <motion.g animate={{ scaleY: [1, 0.8, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ transformOrigin: "25px 20px" }}>
            <path d="M10 30 Q12 50 15 70 M20 30 Q21 55 22 70 M30 30 Q29 55 28 70 M40 30 Q38 50 35 70"
                  stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
          </motion.g>
        </svg>
      </motion.div>
    );
  }
  if (kind === "shark") {
    const top = 50 + (idx*10) % 20;
    return (
      <motion.svg viewBox="0 0 120 40" width="180" height="60" className="absolute pointer-events-none"
        style={{ top: `${top}%` }}
        initial={{ x: -200 }} animate={{ x: SCENE_W + 200 }} transition={{ duration: duration*1.5, repeat: Infinity, delay, ease: "linear" }}>
        <path d="M0 20 Q30 5 80 20 Q100 25 115 20 L115 25 Q90 30 75 22 Q40 35 0 25 Z" fill={accentDeep} opacity="0.7" />
        <path d="M50 5 L55 20 L60 5 Z" fill={accentDeep} opacity="0.7" />
      </motion.svg>
    );
  }
  if (kind === "snowflake") {
    const left = (idx * 311) % SCENE_W;
    const dur = 12 + (idx % 8);
    return (
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ left, top: "-2%", width: 3 + (idx%3), height: 3 + (idx%3), background: accent, boxShadow: `0 0 4px ${accent}` }}
        animate={{ y: SCENE_H + 50, x: [0, 20, -20, 10, 0] }}
        transition={{ duration: dur, repeat: Infinity, delay: delay/3, ease: "linear", x: { duration: 4, repeat: Infinity }}} />
    );
  }
  if (kind === "firefly") {
    const left = (idx * 727) % SCENE_W;
    const top = 30 + (idx*11) % 60;
    return (
      <motion.div className="absolute rounded-full pointer-events-none"
        style={{ left, top: `${top}%`, width: 4, height: 4, background: "#F2C047", boxShadow: "0 0 10px #FFD700" }}
        animate={{ x: [0, 60, -40, 30, 0], y: [0, -30, 20, -10, 0], opacity: [0, 1, 0.4, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: delay/2 }} />
    );
  }
  if (kind === "scorpion" || kind === "monkey" || kind === "owl" || kind === "deer" || kind === "kangaroo" || kind === "penguin" || kind === "yak" || kind === "eagle") {
    // small ground-level critters using minimal silhouette
    const top = kind === "owl" || kind === "eagle" ? 15 + (idx*8)%20 : 80;
    return (
      <motion.svg viewBox="0 0 60 30" width={kind==="yak"?80:50} height={kind==="yak"?40:30} className="absolute pointer-events-none"
        style={{ top: `${top}%` }}
        initial={{ x: -100 }} animate={{ x: SCENE_W + 100, y: kind==="kangaroo"?[0,-20,0,-20,0]:[0,-2,0,-2,0] }}
        transition={{ duration: duration*1.4, repeat: Infinity, delay, ease: "linear", y: { duration: kind==="kangaroo"?1.2:1.5, repeat: Infinity }}}>
        <ellipse cx="30" cy="18" rx="18" ry="8" fill={accentDeep} opacity="0.85" />
        <circle cx="48" cy="13" r="6" fill={accentDeep} opacity="0.85" />
        <path d="M20 26 L18 30 M30 26 L30 30 M40 26 L42 30" stroke={accentDeep} strokeWidth="1.5" />
      </motion.svg>
    );
  }
  if (kind === "leaf") {
    const left = (idx * 829) % SCENE_W;
    const dur = 9 + (idx % 6);
    return (
      <motion.svg viewBox="0 0 16 16" width="14" height="14" className="absolute pointer-events-none"
        style={{ left, top: "0%", color: accentDeep }}
        animate={{ y: SCENE_H, x: [0, 30, -30, 20, 0], rotate: [0, 360] }}
        transition={{ duration: dur, repeat: Infinity, delay: delay/2, ease: "linear" }}>
        <path d="M8 0 Q14 8 8 16 Q2 8 8 0 Z" fill="currentColor" opacity="0.6" />
      </motion.svg>
    );
  }
  if (kind === "dustDevil") {
    const left = (idx * 1117) % SCENE_W;
    return (
      <motion.div className="absolute pointer-events-none rounded-full"
        style={{ left, top: "60%", width: 30, height: 80, background: `radial-gradient(circle, ${accent}40, transparent)` }}
        animate={{ x: [0, 100, 200, 100, 0], rotate: [0, 720] }} transition={{ duration: 12, repeat: Infinity, delay }} />
    );
  }
  if (kind === "aurora") {
    return (
      <motion.div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(94,196,217,0.18) 30%, rgba(163,217,119,0.15) 60%, transparent 100%)" }}
        animate={{ opacity: [0.5, 1, 0.6, 1, 0.5] }} transition={{ duration: 9, repeat: Infinity }} />
    );
  }
  return null;
};

const Particles = ({ kind, color }) => {
  const arr = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {arr.map((_, i) => (
        <span key={i} className="absolute rounded-full opacity-60"
          style={{
            left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
            width: 3 + Math.random()*3, height: 3 + Math.random()*3,
            background: color, boxShadow: `0 0 6px ${color}`,
            animation: `float-y ${4 + Math.random()*6}s ease-in-out ${Math.random()*6}s infinite`
          }} />
      ))}
    </div>
  );
};

const Star = ({ filled, color }) => <span className={filled ? "" : "opacity-30"} style={{ color }}>★</span>;

// Reveal animation per biome style
const revealVariants = {
  "walk-left": {
    initial: { x: -200, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 1.4, ease: "easeOut" } },
  },
  "rise-from-sand": {
    initial: { y: 200, opacity: 0, scale: 0.6 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
  },
  "swing-down": {
    initial: { y: -200, rotate: -20, opacity: 0 },
    animate: { y: 0, rotate: 0, opacity: 1, transition: { duration: 1.2, type: "spring", bounce: 0.4 } },
  },
  "fade-from-snow": {
    initial: { opacity: 0, filter: "blur(20px)", scale: 1.2 },
    animate: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 1.4 } },
  },
  "step-from-trees": {
    initial: { x: -100, opacity: 0, filter: "brightness(0.3)" },
    animate: { x: 0, opacity: 1, filter: "brightness(1)", transition: { duration: 1.3 } },
  },
  "hop-in": {
    initial: { y: -150, opacity: 0 },
    animate: { y: [-150, 0, -60, 0], opacity: 1, transition: { duration: 1.3 } },
  },
  "waddle-in": {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1, rotate: [0, -5, 5, -5, 0], transition: { duration: 1.4 } },
  },
  "swim-in": {
    initial: { x: 200, opacity: 0, rotate: -10 },
    animate: { x: 0, opacity: 1, rotate: 0, transition: { duration: 1.4, ease: "easeOut" } },
  },
};

const BiomeView = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const biome = BIOMES[key] || BIOMES.savanna;
  const [animals, setAnimals] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: -300 });
  const [zoom, setZoom] = useState(1.0);
  const [revealed, setRevealed] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [images, setImages] = useState({});
  const [showHint, setShowHint] = useState(true);
  const dragRef = useRef({ active: false, sx: 0, sy: 0, sPan: { x: 0, y: 0 }, pinchDist: null, pinchZoom: 1 });
  const lastStepRef = useRef(0);

  useEffect(() => {
    fetchAnimals(key).then((d) => setAnimals(d.animals || []));
    startAmbient(biome.ambient);
    try { setDiscovered(new Set(JSON.parse(localStorage.getItem(`biome.discovered.${key}`) || "[]"))); } catch {}
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 5500);
    return () => { stopAmbient(); clearTimeout(t); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  // viewport extents at current zoom
  const sceneW = SCENE_W * zoom;
  const sceneH = SCENE_H * zoom;
  const maxX = 0, minX = -(sceneW - vp.w);
  const maxY = 0, minY = -(sceneH - vp.h);

  const clamp = (x, y) => ({
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  });

  // Deterministic hotspot positions in 2D
  const hotspots = useMemo(() => {
    return animals.map((a, i) => {
      const cols = 6;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const totalRows = Math.ceil(animals.length / cols);
      const usableW = SCENE_W - 600;
      const usableH = SCENE_H - 600;
      const baseX = 300 + (col / Math.max(cols-1, 1)) * usableW;
      const baseY = 300 + (row / Math.max(totalRows-1, 1)) * usableH;
      const jx = (hashCode(a.id + "x") % 240) - 120;
      const jy = (hashCode(a.id + "y") % 200) - 100;
      return { a, x: baseX + jx, y: baseY + jy };
    });
  }, [animals]);

  // Pan + pinch handlers
  const startPan = (cx, cy) => {
    dragRef.current = { active: true, sx: cx, sy: cy, sPan: { ...pan }, pinchDist: null, pinchZoom: zoom };
    setShowHint(false);
  };
  const movePan = (cx, cy) => {
    if (!dragRef.current.active) return;
    const np = clamp(dragRef.current.sPan.x + (cx - dragRef.current.sx), dragRef.current.sPan.y + (cy - dragRef.current.sy));
    setPan(np);
    // footstep ticks (every ~200ms while moving)
    const now = Date.now();
    if (now - lastStepRef.current > 380) { playFootstep(); lastStepRef.current = now; }
  };
  const endPan = () => { dragRef.current.active = false; dragRef.current.pinchDist = null; };

  const onMouseDown = (e) => startPan(e.clientX, e.clientY);
  const onMouseMove = (e) => movePan(e.clientX, e.clientY);
  const onMouseUp = endPan;

  const touchDist = (t) => {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  };
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      dragRef.current = { ...dragRef.current, active: false, pinchDist: touchDist(e.touches), pinchZoom: zoom };
    } else if (e.touches.length === 1) {
      startPan(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && dragRef.current.pinchDist) {
      const d = touchDist(e.touches);
      const newZoom = Math.min(2.2, Math.max(0.75, dragRef.current.pinchZoom * (d / dragRef.current.pinchDist)));
      setZoom(newZoom);
    } else if (e.touches.length === 1) {
      movePan(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = endPan;

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const nz = Math.min(2.2, Math.max(0.75, zoom - e.deltaY * 0.002));
      setZoom(nz);
    } else if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      // scroll = forward/backward into the scene
      const nz = Math.min(2.2, Math.max(0.75, zoom + (e.deltaY > 0 ? -0.05 : 0.05)));
      setZoom(nz);
    } else {
      const np = clamp(pan.x - e.deltaX, pan.y);
      setPan(np);
    }
  };

  // Keyboard nav: WASD or arrows
  useEffect(() => {
    const onKey = (e) => {
      const STEP = 80;
      if (["ArrowLeft","a","A"].includes(e.key)) setPan(p => clamp(p.x + STEP, p.y));
      else if (["ArrowRight","d","D"].includes(e.key)) setPan(p => clamp(p.x - STEP, p.y));
      else if (["ArrowUp","w","W"].includes(e.key)) setZoom(z => Math.min(2.2, z + 0.08));
      else if (["ArrowDown","s","S"].includes(e.key)) setZoom(z => Math.max(0.75, z - 0.08));
      else return;
      playFootstep();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, pan]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepForward = () => { setZoom(z => Math.min(2.2, z + 0.15)); playFootstep(); };
  const stepBack = () => { setZoom(z => Math.max(0.75, z - 0.15)); playFootstep(); };

  const handleHotspot = async (h) => {
    if (dragRef.current.active) return;
    if (!images[h.a.id]) {
      const url = await getWikiImage(h.a.wiki);
      setImages((c) => ({ ...c, [h.a.id]: url }));
    }
    setRevealed(h);
    const next = new Set(discovered); next.add(h.a.id); setDiscovered(next);
    localStorage.setItem(`biome.discovered.${key}`, JSON.stringify([...next]));
    if (!isUnlocked(h.a.id) && h.a.rarity >= 3) unlock(h.a.id);
    if (h.a.rarity === 5) { playUnlock(); setSaolaMood("lanternFlare", 2400); }
    else if (h.a.rarity >= 3) { playUnlock(); setSaolaMood("wideEyes", 1500); }
    else { playChi(); }
  };

  const inspect = (a) => { setRevealed(null); navigate(`/animal/${a.id}`); };

  // Minimap calc
  const mmW = 200, mmH = 80;

  // Hotspot size based on tap-zone — bigger on mobile
  const hsBase = vp.w < 640 ? 44 : 28;

  return (
    <motion.div className="relative w-screen h-screen overflow-hidden select-none touch-none" data-testid={`biome-${key}`}
      initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-3 md:px-6 py-3 flex items-center justify-between gap-2"
           style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75), transparent)" }}>
        <button onClick={() => navigate("/map")} className="btn-wood text-xs md:text-sm" data-testid="biome-back">← Atlas</button>
        <div className="text-center min-w-0 flex-1">
          <div className="font-['Luckiest_Guy'] text-xl md:text-4xl tracking-wider truncate"
               style={{ color: biome.accent, textShadow: `0 0 18px ${biome.accentDeep}, 2px 2px 0 rgba(0,0,0,0.8)` }}
               data-testid="biome-title">{biome.label}</div>
          <div className="font-['Cinzel'] italic text-[10px] md:text-sm text-[#f4efe6]/85 truncate">{biome.tagline}</div>
        </div>
        <button onClick={() => navigate(`/region/${key}`)} className="btn-chi text-xs md:text-sm shrink-0" data-testid="open-region-loxedex">
          Loxedex
        </button>
      </div>

      {/* Discovery counter */}
      <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 border border-white/20 rounded-full px-3 py-1 backdrop-blur-sm"
           data-testid="biome-discovery-counter">
        <div className="w-3 h-3 rounded-full glow-pulse" style={{ background: biome.accent, boxShadow: `0 0 12px ${biome.accent}` }} />
        <span className="font-['Bebas_Neue'] tracking-widest text-xs md:text-sm text-[#f4efe6]">
          {discovered.size} / {animals.length} discovered
        </span>
      </div>

      {/* Drag hint */}
      {showHint && (
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="font-['Pirata_One'] text-2xl md:text-4xl text-[#f4efe6]"
               style={{ textShadow: "0 0 20px rgba(0,0,0,0.9)" }}>
            ↖ drag to roam · scroll to step forward ↗
          </div>
          <div className="font-['Space_Mono'] text-xs text-[#f4efe6]/70 mt-2">WASD / arrows · pinch to zoom</div>
        </motion.div>
      )}

      {/* Scene viewport */}
      <div onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
           onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
           onWheel={onWheel}
           className="absolute inset-0 cursor-grab active:cursor-grabbing"
           style={{ touchAction: "none" }}>

        {/* Background — slow parallax (0.5x speed) */}
        <div className="absolute inset-y-0 left-0 bg-cover bg-center"
             style={{
               width: sceneW * 1.2, height: sceneH * 1.2,
               backgroundImage: `url(${biome.bg})`,
               backgroundSize: "cover",
               transform: `translate(${pan.x * 0.4}px, ${pan.y * 0.4}px) scale(1)`,
               transformOrigin: "0 0",
               filter: "saturate(1.15) contrast(1.05)",
             }} />

        {/* Mid layer (0.7x parallax) */}
        <div className="absolute inset-y-0 left-0 opacity-45"
             style={{
               width: sceneW, height: sceneH,
               backgroundImage: `url(${biome.mid})`,
               backgroundSize: "cover",
               backgroundPosition: "center",
               transform: `translate(${pan.x * 0.7}px, ${pan.y * 0.7}px)`,
               transformOrigin: "0 0",
               mixBlendMode: "overlay",
             }} />

        {/* Foreground — full speed (hotspots + wildlife) */}
        <div className="absolute inset-y-0 left-0"
             style={{
               width: sceneW, height: sceneH,
               transform: `translate(${pan.x}px, ${pan.y}px)`,
               transformOrigin: "0 0",
             }}>

          {/* idle biome wildlife */}
          {biome.wildlife.map((w, i) =>
            Array.from({ length: w.count }).map((_, j) => (
              <Wildlife key={`${i}-${j}`} kind={w.kind} idx={i*10 + j} accent={biome.accent} accentDeep={biome.accentDeep} />
            ))
          )}

          {/* hotspots */}
          {hotspots.map((h) => {
            const disc = discovered.has(h.a.id);
            const isRevealed = revealed?.a.id === h.a.id;
            const size = h.a.rarity >= 4 ? hsBase + 10 : hsBase;
            return (
              <button key={h.a.id}
                onClick={() => handleHotspot(h)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: h.x, top: h.y, width: size+24, height: size+24 }}
                data-testid={`hotspot-${h.a.id}`}>
                <div className="absolute inset-0 rounded-full glow-pulse"
                     style={{ background: `radial-gradient(circle, ${biome.accent}80 0%, transparent 70%)`, opacity: disc ? 1 : 0.6 }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30 backdrop-blur-sm group-hover:scale-125 group-active:scale-90 transition-transform"
                     style={{ width: size, height: size,
                              background: disc ? `radial-gradient(circle, ${biome.accent}, ${biome.accentDeep})` : `radial-gradient(circle, ${biome.accent}80, ${biome.accentDeep}40)`,
                              boxShadow: `0 0 ${size}px ${biome.accent}` }}>
                  {h.a.rarity === 5 && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: biome.accent, opacity: 0.4 }} />}
                  {disc && (
                    <div className="absolute inset-1 rounded-full bg-white/90 flex items-center justify-center text-[10px] font-bold text-black">
                      {"★".repeat(h.a.rarity).slice(0,3)}
                    </div>
                  )}
                </div>
                {/* In-scene animated reveal preview when this hotspot was just revealed */}
                {isRevealed && images[h.a.id] && (
                  <motion.div
                    className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden border-4 pointer-events-none"
                    style={{ borderColor: biome.accent, boxShadow: `0 0 30px ${biome.accent}` }}
                    variants={revealVariants[biome.revealStyle] || revealVariants["walk-left"]}
                    initial="initial" animate="animate">
                    <img src={images[h.a.id]} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        {/* Particles + vignette */}
        <Particles kind={biome.particle} color={biome.accent} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.7) 100%)" }} />

        {/* subtle camera bob */}
        <motion.div className="absolute inset-0 pointer-events-none"
                    animate={{ y: [0, -2, 0, -1.5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }} />
      </div>

      {/* Step forward/back buttons */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-2" data-testid="step-controls">
        <button onClick={stepBack} className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Bebas_Neue'] tracking-widest text-xs text-[#f4efe6] hover:bg-black/80" data-testid="step-back">↓ STEP BACK</button>
        <div className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Space_Mono'] text-xs text-[#FFD700]">
          {(zoom*100).toFixed(0)}%
        </div>
        <button onClick={stepForward} className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Bebas_Neue'] tracking-widest text-xs text-[#f4efe6] hover:bg-black/80" data-testid="step-forward">↑ STEP FORWARD</button>
      </div>

      {/* 2D Minimap */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/60 border border-white/20 rounded backdrop-blur-sm overflow-hidden"
           style={{ width: mmW, height: mmH }} data-testid="biome-minimap">
        {hotspots.map((h) => (
          <div key={h.a.id}
               className="absolute rounded-full"
               style={{
                 left: (h.x / SCENE_W) * mmW - 2,
                 top: (h.y / SCENE_H) * mmH - 2,
                 width: h.a.rarity >= 4 ? 5 : 3, height: h.a.rarity >= 4 ? 5 : 3,
                 background: discovered.has(h.a.id) ? biome.accent : `${biome.accent}50`,
                 boxShadow: discovered.has(h.a.id) ? `0 0 6px ${biome.accent}` : "none",
               }} />
        ))}
        {/* viewport rect */}
        <div className="absolute border-2 rounded-sm"
             style={{
               left: (-pan.x / sceneW) * mmW,
               top: (-pan.y / sceneH) * mmH,
               width: (vp.w / sceneW) * mmW,
               height: (vp.h / sceneH) * mmH,
               borderColor: biome.accent,
               background: `${biome.accent}20`,
             }} />
      </div>

      {/* Revealed animal card overlay */}
      <AnimatePresence>
        {revealed && (
          <motion.div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                      onClick={() => setRevealed(null)}>
            <motion.div className="parchment parchment-edge rounded-lg p-5 md:p-6 max-w-md mx-4 burn-in"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.7 }}
                        data-testid="revealed-card">
              <div className="w-full aspect-square bg-black/20 rounded overflow-hidden border-2 border-[#8C7356] mb-3 relative">
                {images[revealed.a.id] ? (
                  <motion.img src={images[revealed.a.id]} alt={revealed.a.name}
                       className="w-full h-full object-cover"
                       variants={revealVariants[biome.revealStyle] || revealVariants["walk-left"]}
                       initial="initial" animate="animate" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#5C5042]">…</div>
                )}
                {revealed.a.rarity === 5 && <div className="absolute inset-0 chi-glow rounded pointer-events-none" />}
              </div>
              <div className="font-['Pirata_One'] text-3xl text-[#2C241B] text-center">{revealed.a.name}</div>
              <div className="text-center mb-2" style={{ color: biome.accentDeep }}>
                {[1,2,3,4,5].map(i => <Star key={i} filled={i <= revealed.a.rarity} color={biome.accentDeep} />)}
              </div>
              <div className="font-['Cinzel'] italic text-[#5C5042] text-center text-sm mb-3">
                Superpower: <b>{revealed.a.superpower}</b>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRevealed(null)} className="btn-wood flex-1" data-testid="reveal-close">Keep Roaming</button>
                <button onClick={() => inspect(revealed.a)} className="btn-chi flex-1" data-testid="reveal-inspect">Full Page →</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SaolaGuide context={`exploring the ${biome.label}`} />
    </motion.div>
  );
};

export default BiomeView;
