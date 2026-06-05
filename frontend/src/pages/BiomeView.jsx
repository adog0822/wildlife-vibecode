import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { fetchAnimals } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked, unlock } from "../lib/storage";
import { startAmbient, stopAmbient, playUnlock, playChi, playFootstep, playAnimalCall } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

// Hi-res Unsplash backdrops (sharp). AI-generated painterly bgs from backend override these when available.
const Q = "?auto=format&fit=crop&w=3840&q=90";
const FALLBACK_BG = {
  savanna: `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e${Q}`,
  dunes: `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${Q}`,
  canopy: `https://images.unsplash.com/photo-1518837695005-2083093ee35b${Q}`,
  peaks: `https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99${Q}`,
  woods: `https://images.unsplash.com/photo-1448375240586-882707db888b${Q}`,
  outback: `https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8${Q}`,
  wastes: `https://images.unsplash.com/photo-1457269449834-928af64c684d${Q}`,
  ocean: `https://images.unsplash.com/photo-1583212292454-1fe6229603b7${Q}`,
};
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const BIOMES = {
  savanna: {
    label: "Sun-Baked Savanna", tagline: "Walk through the golden grass. The grass hides golden eyes.",
    bg: `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e${Q}`,
    sky: "linear-gradient(180deg,#f4b95a 0%,#c46a1c 50%,#2c1408 100%)",
    accent: "#F2C047", accentDeep: "#D97736", ambient: "savanna", particle: "heat",
  },
  dunes: {
    label: "The Great Dunes", tagline: "Sand whispers. Walk the silent crests.",
    bg: `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${Q}`,
    sky: "linear-gradient(180deg,#f1a83a 0%,#c4691a 50%,#1a1438 100%)",
    accent: "#F29F05", accentDeep: "#8c4a02", ambient: "dunes", particle: "sand",
  },
  canopy: {
    label: "Emerald Canopy", tagline: "Push the vines aside. Listen for the rustle.",
    bg: `https://images.unsplash.com/photo-1518837695005-2083093ee35b${Q}`,
    sky: "linear-gradient(180deg,#2a4a30 0%,#0e2a14 60%,#04130a 100%)",
    accent: "#A3D977", accentDeep: "#1E5928", ambient: "canopy", particle: "mist",
  },
  peaks: {
    label: "Mystic Peaks", tagline: "Walk the ridge. The mountains are watching.",
    bg: `https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99${Q}`,
    sky: "linear-gradient(180deg,#b8d8e0 0%,#5a8088 60%,#1a2a3a 100%)",
    accent: "#E0F2F2", accentDeep: "#7BA6A6", ambient: "peaks", particle: "snow",
  },
  woods: {
    label: "Whispering Woods", tagline: "Something rustles in the auburn dark.",
    bg: `https://images.unsplash.com/photo-1448375240586-882707db888b${Q}`,
    sky: "linear-gradient(180deg,#2a1810 0%,#1a0e08 60%,#06030a 100%)",
    accent: "#A0531A", accentDeep: "#732002", ambient: "woods", particle: "spores",
  },
  outback: {
    label: "Crimson Outback", tagline: "Red earth hums beneath your feet.",
    bg: `https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8${Q}`,
    sky: "linear-gradient(180deg,#f1a464 0%,#8c2703 60%,#2a0c04 100%)",
    accent: "#D96941", accentDeep: "#8C2703", ambient: "outback", particle: "dust",
  },
  wastes: {
    label: "Frozen Wastes", tagline: "Auroras wash the ice. Step lightly.",
    bg: `https://images.unsplash.com/photo-1457269449834-928af64c684d${Q}`,
    sky: "linear-gradient(180deg,#233a4d 0%,#5b8c9d 30%,#cfe9f5 70%,#6688aa 100%)",
    accent: "#cfe9f5", accentDeep: "#5EC4D9", ambient: "wastes", particle: "snow",
  },
  ocean: {
    label: "The Deep Blue", tagline: "Bioluminescence drifts in the abyss.",
    bg: `https://images.unsplash.com/photo-1583212292454-1fe6229603b7${Q}`,
    sky: "linear-gradient(180deg,#0a3a5a 0%,#02101f 60%,#02060e 100%)",
    accent: "#F28D9F", accentDeep: "#023059", ambient: "ocean", particle: "bubbles",
  },
};

const hashCode = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h) + s.charCodeAt(i); return Math.abs(h); };
const SCENE_W = 8000, SCENE_H = 3000;

// Expanded NatGeo-style safari wildlife rosters per biome
const SafariWildlife = ({ biome, sceneW, sceneH, night }) => {
  const safari = {
    savanna: [
      { wiki: "Lion", top: 70 }, { wiki: "Plains zebra", top: 72 },
      { wiki: "Common warthog", top: 78 }, { wiki: "Masai giraffe", top: 55 },
      { wiki: "African bush elephant", top: 65 }, { wiki: "Cheetah", top: 74 },
      { wiki: "Meerkat", top: 80 }, { wiki: "Wildebeest", top: 72 },
      { wiki: "Spotted hyena", top: 76 }, { wiki: "African wild dog", top: 75 },
    ],
    dunes: [
      { wiki: "Fennec fox", top: 75 }, { wiki: "Dromedary", top: 70 },
      { wiki: "Arabian oryx", top: 72 }, { wiki: "Sand cat", top: 78 },
      { wiki: "Egyptian vulture", top: 25, kind: "fly" },
      { wiki: "Caracal", top: 76 },
    ],
    canopy: [
      { wiki: "Toucan", top: 25, kind: "fly" }, { wiki: "Mandrill", top: 70 },
      { wiki: "Scarlet macaw", top: 20, kind: "fly" }, { wiki: "Jaguar", top: 75 },
      { wiki: "Howler monkey", top: 35 }, { wiki: "Brown-throated sloth", top: 28 },
      { wiki: "Western lowland gorilla", top: 72 }, { wiki: "Capybara", top: 80 },
      { wiki: "Orangutan", top: 32 },
    ],
    peaks: [
      { wiki: "Andean condor", top: 18, kind: "fly" }, { wiki: "Domestic yak", top: 78 },
      { wiki: "Snow leopard", top: 70 }, { wiki: "Red panda", top: 35 },
      { wiki: "Markhor", top: 74 }, { wiki: "Pallas's cat", top: 80 },
      { wiki: "Llama", top: 76 },
    ],
    woods: [
      { wiki: "Red deer", top: 75 }, { wiki: "Red fox", top: 80 },
      { wiki: "Brown bear", top: 72 }, { wiki: "Eurasian wolf", top: 76 },
      { wiki: "Eurasian eagle-owl", top: 25, kind: "fly" },
      { wiki: "Eurasian wild boar", top: 78 }, { wiki: "Red squirrel", top: 60 },
      { wiki: "European hedgehog", top: 82 },
    ],
    outback: [
      { wiki: "Red kangaroo", top: 72, kind: "hop" }, { wiki: "Emu", top: 75 },
      { wiki: "Koala", top: 30 }, { wiki: "Tasmanian devil", top: 78 },
      { wiki: "Wedge-tailed eagle", top: 18, kind: "fly" },
      { wiki: "Wombat", top: 80 }, { wiki: "Laughing kookaburra", top: 22, kind: "fly" },
      { wiki: "Dingo", top: 76 },
    ],
    wastes: [
      { wiki: "Emperor penguin", top: 80, kind: "waddle" }, { wiki: "Adélie penguin", top: 82, kind: "waddle" },
      { wiki: "Polar bear", top: 75 }, { wiki: "Arctic fox", top: 78 },
      { wiki: "Reindeer", top: 72 }, { wiki: "Snowy owl", top: 22, kind: "fly" },
      { wiki: "Leopard seal", top: 85 },
    ],
    ocean: [
      { wiki: "Manta ray", top: 50, kind: "swim" }, { wiki: "Humpback whale", top: 55, kind: "swim" },
      { wiki: "Common dolphin", top: 35, kind: "swim" }, { wiki: "Blue whale", top: 60, kind: "swim" },
      { wiki: "Great white shark", top: 45, kind: "swim" }, { wiki: "Whale shark", top: 52, kind: "swim" },
      { wiki: "Orca", top: 40, kind: "swim" }, { wiki: "Leatherback sea turtle", top: 65, kind: "swim" },
    ],
  };
  const list = safari[biome] || [];
  const [imgs, setImgs] = useState({});
  useEffect(() => {
    list.forEach(async (s) => {
      const url = await getWikiImage(s.wiki);
      if (url) setImgs((c) => ({ ...c, [s.wiki]: url }));
    });
  }, [biome]); // eslint-disable-line

  return list.map((s, i) => {
    const delay = i * 4 + (i % 3);
    const duration = 28 + (i * 3);
    const yMove = s.kind === "hop" ? [0, -50, 0, -40, 0]
                 : s.kind === "fly" ? [0, -20, 10, -10, 0]
                 : s.kind === "swim" ? [0, 25, -15, 10, 0]
                 : s.kind === "waddle" ? [0, -4, 0, -4, 0]
                 : [0, -3, 0, -3, 0];
    return (
      <motion.div key={i} className="absolute pointer-events-none"
        style={{ top: `${s.top}%`,
                 filter: `drop-shadow(0 6px 12px rgba(0,0,0,0.6)) ${night ? "brightness(0.55) saturate(0.7) hue-rotate(20deg)" : ""}` }}
        initial={{ x: -200 }} animate={{ x: sceneW + 200, y: yMove }}
        transition={{ duration, repeat: Infinity, delay, ease: "linear",
                      y: { duration: s.kind === "hop" ? 1.0 : 4, repeat: Infinity }}}>
        {imgs[s.wiki] && (
          <img src={imgs[s.wiki]} alt=""
               className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full"
               style={{ filter: "saturate(0.95) brightness(0.9)" }} />
        )}
      </motion.div>
    );
  });
};

const Particles = ({ color }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 40 }).map((_, i) => (
      <span key={i} className="absolute rounded-full opacity-60"
        style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                 width: 3 + Math.random()*3, height: 3 + Math.random()*3,
                 background: color, boxShadow: `0 0 6px ${color}`,
                 animation: `float-y ${4 + Math.random()*6}s ease-in-out ${Math.random()*6}s infinite` }} />
    ))}
  </div>
);

const Star = ({ filled, color }) => <span className={filled ? "" : "opacity-30"} style={{ color }}>★</span>;

const BiomeView = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const biome = BIOMES[key] || BIOMES.savanna;
  const [animals, setAnimals] = useState([]);
  const [revealed, setRevealed] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [images, setImages] = useState({});
  const [aiBg, setAiBg] = useState(null);  // AI-painterly bg URL when available
  const [hoveredId, setHoveredId] = useState(null);
  const [showHint, setShowHint] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [night, setNight] = useState(() => {
    const h = new Date().getHours();
    return h < 6 || h >= 19;
  });
  const [photoMode, setPhotoMode] = useState(false);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const sceneRef = useRef(null);

  // CAMERA: target = where we want to be, actual tweens toward it each frame
  const targetRef = useRef({ x: 0, y: 0 });
  const camRef = useRef({ x: 0, y: 0 });
  const [camSnap, setCamSnap] = useState({ x: 0, y: 0 });
  const keysRef = useRef({});
  const dragRef = useRef({ active: false, sx: 0, sy: 0, sx0: 0, sy0: 0, moved: 0 });
  const rafLoopRef = useRef(null);
  const lastStepRef = useRef(0);

  // load
  useEffect(() => {
    fetchAnimals(key).then((d) => setAnimals(d.animals || []));
    startAmbient(biome.ambient);
    // Try to load AI-painterly background from backend
    fetch(`${BACKEND_URL}/api/biome_bg/${key}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.url) setAiBg(`${BACKEND_URL}${d.url}`); })
      .catch(() => {});
    try { setDiscovered(new Set(JSON.parse(localStorage.getItem(`biome.discovered.${key}`) || "[]"))); } catch {}
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 5500);
    return () => { stopAmbient(); clearTimeout(t); };
  }, [key]); // eslint-disable-line

  useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", r); return () => window.removeEventListener("resize", r);
  }, []);

  // Distribute hotspots well (8 cols, jittered)
  const hotspots = useMemo(() => {
    return animals.map((a, i) => {
      const cols = 8;
      const row = Math.floor(i / cols), col = i % cols;
      const totalRows = Math.ceil(animals.length / cols);
      const usableW = SCENE_W - 800, usableH = SCENE_H - 800;
      const baseX = 400 + (col / Math.max(cols-1, 1)) * usableW;
      const baseY = 400 + (row / Math.max(totalRows-1, 1)) * usableH;
      const jx = (hashCode(a.id + "x") % 280) - 140;
      const jy = (hashCode(a.id + "y") % 200) - 100;
      return { a, x: baseX + jx, y: baseY + jy };
    });
  }, [animals]);

  // Pre-fetch all images so silhouettes work
  useEffect(() => {
    animals.forEach(async (a) => {
      if (!images[a.id]) {
        const url = await getWikiImage(a.wiki);
        if (url) setImages((c) => ({ ...c, [a.id]: url }));
      }
    });
  }, [animals]); // eslint-disable-line

  // Initial camera position — center of scene
  useEffect(() => {
    const cx = -(SCENE_W * zoom - vp.w) / 2;
    const cy = -(SCENE_H * zoom - vp.h) / 2;
    targetRef.current = { x: cx, y: cy };
    camRef.current = { x: cx, y: cy };
    setCamSnap({ x: cx, y: cy });
  }, [vp.w, vp.h]); // eslint-disable-line

  const sceneW = SCENE_W * zoom, sceneH = SCENE_H * zoom;
  const minX = Math.min(0, -(sceneW - vp.w)), minY = Math.min(0, -(sceneH - vp.h));
  const clamp = (x, y) => ({ x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) });

  // RAF loop — keys + tween camera toward target
  useEffect(() => {
    const SPEED = 18; // px per frame when key held
    const EASE = 0.12; // camera lerp factor
    const loop = () => {
      // keys influence target
      const k = keysRef.current;
      const dx = (k.left ? SPEED : 0) + (k.right ? -SPEED : 0);
      const dy = (k.up ? SPEED : 0) + (k.down ? -SPEED : 0);
      if (dx || dy) {
        const t = targetRef.current;
        targetRef.current = clamp(t.x + dx, t.y + dy);
        const now = Date.now();
        if (now - lastStepRef.current > 360) { playFootstep(); lastStepRef.current = now; }
      }
      // lerp camera
      const c = camRef.current, t = targetRef.current;
      const ndx = (t.x - c.x) * EASE, ndy = (t.y - c.y) * EASE;
      if (Math.abs(ndx) > 0.1 || Math.abs(ndy) > 0.1) {
        camRef.current = { x: c.x + ndx, y: c.y + ndy };
        setCamSnap({ ...camRef.current });
      }
      rafLoopRef.current = requestAnimationFrame(loop);
    };
    rafLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafLoopRef.current);
  }, [zoom, vp.w, vp.h]); // eslint-disable-line

  // Keys
  useEffect(() => {
    const set = (k, v) => { keysRef.current[k] = v; };
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") set("left", true);
      else if (k === "arrowright" || k === "d") set("right", true);
      else if (k === "arrowup" || k === "w") set("up", true);
      else if (k === "arrowdown" || k === "s") set("down", true);
      else if (k === "+" || k === "=") setZoom(z => Math.min(2.5, z + 0.15));
      else if (k === "-" || k === "_") setZoom(z => Math.max(0.7, z - 0.15));
      else if (k === "p") setPhotoMode(p => !p);
      else if (k === "n") setNight(n => !n);
      else if (k === "escape") setPhotoMode(false);
      else return;
      setShowHint(false);
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") set("left", false);
      else if (k === "arrowright" || k === "d") set("right", false);
      else if (k === "arrowup" || k === "w") set("up", false);
      else if (k === "arrowdown" || k === "s") set("down", false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Directional button press (hold via mouse down/up)
  const dirHold = (dir, on) => () => { keysRef.current[dir] = on; setShowHint(false); };

  // Drag-pan still supported (sets target directly)
  const startDrag = (cx, cy) => { dragRef.current = { active: true, sx: cx, sy: cy, sx0: targetRef.current.x, sy0: targetRef.current.y, moved: 0 }; setShowHint(false); };
  const moveDrag = (cx, cy) => {
    if (!dragRef.current.active) return;
    const dx = cx - dragRef.current.sx, dy = cy - dragRef.current.sy;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.sqrt(dx*dx+dy*dy));
    targetRef.current = clamp(dragRef.current.sx0 + dx, dragRef.current.sy0 + dy);
  };
  const endDrag = () => { dragRef.current.active = false; };

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.min(2.5, Math.max(0.7, z - e.deltaY*0.0025))); }
    else { targetRef.current = clamp(targetRef.current.x - e.deltaX, targetRef.current.y - e.deltaY); }
  };

  const handleHotspot = async (h) => {
    if (dragRef.current.moved > 6) return;
    setRevealed(h);
    const next = new Set(discovered); next.add(h.a.id); setDiscovered(next);
    localStorage.setItem(`biome.discovered.${key}`, JSON.stringify([...next]));
    if (!isUnlocked(h.a.id) && h.a.rarity >= 3) unlock(h.a.id);
    if (h.a.rarity === 5) { playUnlock(); setSaolaMood("lanternFlare", 2400); }
    else if (h.a.rarity >= 3) { playUnlock(); setSaolaMood("wideEyes", 1500); }
    else { playChi(); }
  };
  const inspect = (a) => { setRevealed(null); navigate(`/animal/${a.id}`); };

  // Snap photo: capture viewport as PNG (Field Journal save + download)
  const snapPhoto = async () => {
    if (!sceneRef.current) return;
    try {
      const dataUrl = await toPng(sceneRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `loxelife-${key}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      try {
        const journal = JSON.parse(localStorage.getItem("field.journal") || "[]");
        journal.unshift({ biome: key, label: biome.label, at: Date.now() });
        localStorage.setItem("field.journal", JSON.stringify(journal.slice(0, 12)));
      } catch {}
      playUnlock();
      setSaolaMood("lanternFlare", 1500);
    } catch (e) { console.warn("photo:", e); }
  };

  // Pan to a hotspot when clicked from minimap
  const panToHotspot = (h) => {
    const target = clamp(-(h.x * zoom) + vp.w/2, -(h.y * zoom) + vp.h/2);
    targetRef.current = target;
  };

  const cam = camSnap;
  const hsBase = vp.w < 640 ? 56 : 44;
  const mmW = 220, mmH = 80;

  // Resolve background layers: prefer AI-painterly bg when available, fall back to Unsplash hero.
  const bgUrl = aiBg || biome.bg;
  const midUrl = biome.bg;

  return (
    <motion.div className="relative w-screen h-screen overflow-hidden select-none touch-none" data-testid={`biome-${key}`}
      initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
      style={{ background: biome.sky }}>

      {/* Header — hidden in photo mode */}
      {!photoMode && (
      <div className="absolute top-0 left-0 right-0 z-30 px-3 md:px-6 py-3 flex items-center justify-between gap-2"
           style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.78), transparent)" }}>
        <button onClick={() => navigate("/map")} className="btn-wood text-xs md:text-sm" data-testid="biome-back">← Atlas</button>
        <div className="text-center min-w-0 flex-1">
          <div className="font-['Luckiest_Guy'] text-xl md:text-4xl tracking-wider truncate"
               style={{ color: biome.accent, textShadow: `0 0 18px ${biome.accentDeep}, 2px 2px 0 rgba(0,0,0,0.8)` }}
               data-testid="biome-title">{biome.label}</div>
          <div className="font-['Cinzel'] italic text-[10px] md:text-sm text-[#f4efe6]/85 truncate">{biome.tagline}</div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setNight(n => !n)}
                  className="bg-black/60 border border-white/20 rounded-full w-9 h-9 flex items-center justify-center text-[#f4efe6] hover:bg-black/80 text-base"
                  title={night ? "Switch to day" : "Switch to night"}
                  data-testid="day-night-toggle">
            {night ? "☀" : "☾"}
          </button>
          <button onClick={() => setPhotoMode(true)}
                  className="bg-black/60 border border-white/20 rounded-full w-9 h-9 flex items-center justify-center text-[#f4efe6] hover:bg-black/80 text-sm"
                  title="Photo mode (P)"
                  data-testid="photo-mode-enter">📸</button>
          <button onClick={() => navigate(`/region/${key}`)} className="btn-chi text-xs md:text-sm" data-testid="open-region-loxedex">
            Loxedex
          </button>
        </div>
      </div>
      )}

      {/* Discovery counter */}
      {!photoMode && (
      <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/65 border border-white/20 rounded-full px-3 py-1 backdrop-blur-sm"
           data-testid="biome-discovery-counter">
        <div className="w-3 h-3 rounded-full glow-pulse" style={{ background: biome.accent, boxShadow: `0 0 12px ${biome.accent}` }} />
        <span className="font-['Bebas_Neue'] tracking-widest text-xs md:text-sm text-[#f4efe6]">
          {discovered.size} / {animals.length} discovered
        </span>
      </div>
      )}

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center px-6"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.95 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="font-['Pirata_One'] text-3xl md:text-5xl text-[#f4efe6]" style={{ textShadow: "0 0 22px rgba(0,0,0,0.95)" }}>
              WASD or arrows to walk
            </div>
            <div className="font-['Space_Mono'] text-xs text-[#f4efe6]/85 mt-2">Hover hotspots to reveal · click to capture · +/- to zoom</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCENE */}
      <div ref={sceneRef}
           onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
           onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
           onMouseUp={endDrag} onMouseLeave={endDrag}
           onTouchStart={(e) => e.touches.length === 1 && startDrag(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchMove={(e) => e.touches.length === 1 && moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
           onTouchEnd={endDrag}
           onWheel={onWheel}
           className="absolute inset-0 cursor-grab active:cursor-grabbing"
           style={{ touchAction: "none" }}>

        {/* Sky */}
        <div className="absolute inset-0" style={{ background: biome.sky }} />

        {/* Far background — slow parallax, sharp */}
        <div className="absolute inset-y-0 left-0"
             style={{
               width: sceneW * 1.4, height: sceneH * 1.1,
               backgroundImage: `url(${bgUrl})`,
               backgroundSize: "cover", backgroundPosition: "center",
               transform: `translate3d(${cam.x * 0.35}px, ${cam.y * 0.5}px, 0)`,
               willChange: "transform",
               filter: "saturate(1.15) contrast(1.05) brightness(0.92)",
             }} />

        {/* Mid photo overlay — adds real-world depth on top of painterly bg */}
        <div className="absolute inset-y-0 left-0"
             style={{
               width: sceneW * 1.15, height: sceneH * 1.05,
               backgroundImage: `url(${midUrl})`,
               backgroundSize: "cover", backgroundPosition: "40% 60%",
               transform: `translate3d(${cam.x * 0.6}px, ${cam.y * 0.65}px, 0) scale(1.1)`,
               willChange: "transform",
               opacity: aiBg ? 0.22 : 0.35,
               mixBlendMode: "multiply",
             }} />

        {/* Depth fog gradient */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `linear-gradient(180deg, ${biome.accentDeep}00 0%, ${biome.accentDeep}1a 70%, ${biome.accentDeep}4a 100%)` }} />

        {/* Day/Night global overlay */}
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
             style={{
               background: night
                 ? "radial-gradient(circle at 50% 20%, rgba(120,140,200,0.18) 0%, rgba(8,12,28,0.65) 100%)"
                 : "radial-gradient(circle at 50% 20%, rgba(255,230,180,0.10) 0%, transparent 70%)",
               mixBlendMode: night ? "multiply" : "screen",
             }} />
        {/* moonlight or sunlight tint over scene image */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: night ? "rgba(20,30,60,0.35)" : "rgba(255,200,140,0.05)",
                      mixBlendMode: "overlay" }} />

        {/* Foreground — NatGeo wildlife crossing + hotspots */}
        <div className="absolute inset-y-0 left-0"
             style={{ width: sceneW, height: sceneH, transform: `translate3d(${cam.x}px, ${cam.y}px, 0)`, willChange: "transform" }}>

          {/* Live NatGeo wildlife crossing through scene */}
          <SafariWildlife biome={key} sceneW={sceneW} sceneH={sceneH} night={night} />

          {/* Hotspots — silhouette-to-photo morph on hover */}
          {hotspots.map((h) => {
            const disc = discovered.has(h.a.id);
            const isHover = hoveredId === h.a.id;
            const isRev = revealed?.a.id === h.a.id;
            const halo = h.a.rarity >= 4 ? 170 : 130;
            const photoSize = halo * 0.65;
            const img = images[h.a.id];
            // silhouette = full black via CSS filter; on hover or discovered, reveal real color
            const showColor = isHover || disc || isRev;
            return (
              <motion.button key={h.a.id}
                onMouseEnter={() => { setHoveredId(h.a.id); playAnimalCall(h.a); }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleHotspot(h)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: h.x, top: h.y, width: halo, height: halo }}
                whileHover={{ scale: 1.08 }}
                data-testid={`hotspot-${h.a.id}`}>
                {/* Outer halo */}
                <div className="absolute inset-0 rounded-full"
                     style={{ background: `radial-gradient(circle, ${biome.accent}55 0%, ${biome.accent}15 35%, transparent 70%)` }} />
                <motion.div className="absolute inset-0 rounded-full"
                     style={{ background: `radial-gradient(circle, ${biome.accent}66 0%, transparent 55%)` }}
                     animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.25, 0.7] }}
                     transition={{ duration: 3, repeat: Infinity, delay: (hashCode(h.a.id) % 100) / 30 }} />

                {/* Real animal photo, morphs between silhouette and color */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden"
                     style={{ width: photoSize, height: photoSize, boxShadow: showColor ? `0 0 28px ${biome.accent}` : `0 0 18px ${biome.accentDeep}aa` }}>
                  {img ? (
                    <motion.img src={img} alt={h.a.name}
                      className="w-full h-full object-cover transition-all"
                      animate={{
                        filter: showColor
                          ? "brightness(1) saturate(1.1) contrast(1.05)"
                          : `brightness(0.05) saturate(0) contrast(2)`,
                      }}
                      transition={{ duration: 0.45 }}
                      style={{ background: biome.accentDeep }}
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: biome.accentDeep }} />
                  )}
                  {/* Color tint overlay when silhouette */}
                  {!showColor && (
                    <div className="absolute inset-0" style={{ background: `radial-gradient(circle, transparent 30%, ${biome.accentDeep}aa 100%)`, mixBlendMode: "multiply" }} />
                  )}
                </div>

                {/* 5★ ping ring */}
                {h.a.rarity === 5 && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: biome.accent, opacity: 0.25 }} />}

                {/* Label */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none">
                  <div className="text-xs" style={{ color: biome.accent, textShadow: "0 0 6px #000" }}>{"★".repeat(h.a.rarity)}</div>
                  {(disc || isHover) && (
                    <div className="font-['Pirata_One'] text-xs px-2 py-0.5 rounded bg-black/80 text-white whitespace-nowrap">
                      {h.a.name}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Particles + vignette */}
        <Particles color={biome.accent} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)" }} />
      </div>

      {/* D-PAD directional buttons — bottom-left, hidden in photo mode */}
      {!photoMode && (
      <div className="absolute bottom-24 left-3 z-30 grid grid-cols-3 gap-1" data-testid="dpad">
        <div />
        <button onMouseDown={dirHold("up", true)} onMouseUp={dirHold("up", false)} onMouseLeave={dirHold("up", false)}
                onTouchStart={dirHold("up", true)} onTouchEnd={dirHold("up", false)}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold backdrop-blur-sm" data-testid="dpad-up">↑</button>
        <div />
        <button onMouseDown={dirHold("left", true)} onMouseUp={dirHold("left", false)} onMouseLeave={dirHold("left", false)}
                onTouchStart={dirHold("left", true)} onTouchEnd={dirHold("left", false)}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold backdrop-blur-sm" data-testid="dpad-left">←</button>
        <div className="w-12 h-12 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[10px] text-[#f4efe6]/60 font-['Space_Mono']">WALK</div>
        <button onMouseDown={dirHold("right", true)} onMouseUp={dirHold("right", false)} onMouseLeave={dirHold("right", false)}
                onTouchStart={dirHold("right", true)} onTouchEnd={dirHold("right", false)}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold backdrop-blur-sm" data-testid="dpad-right">→</button>
        <div />
        <button onMouseDown={dirHold("down", true)} onMouseUp={dirHold("down", false)} onMouseLeave={dirHold("down", false)}
                onTouchStart={dirHold("down", true)} onTouchEnd={dirHold("down", false)}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold backdrop-blur-sm" data-testid="dpad-down">↓</button>
        <div />
      </div>
      )}

      {/* Zoom buttons — right, hidden in photo mode */}
      {!photoMode && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2" data-testid="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold text-2xl backdrop-blur-sm" data-testid="zoom-in">+</button>
        <div className="bg-black/70 border border-white/20 rounded w-12 px-1 py-1 text-center font-['Space_Mono'] text-[10px] text-[#FFD700]">{(zoom*100).toFixed(0)}%</div>
        <button onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                className="bg-black/70 border border-white/20 rounded w-12 h-12 text-[#f4efe6] hover:bg-black/90 font-bold text-2xl backdrop-blur-sm" data-testid="zoom-out">−</button>
      </div>
      )}

      {/* PHOTO MODE OVERLAY — frame + snap button */}
      {photoMode && (
        <>
          {/* Polaroid-style frame */}
          <div className="absolute inset-0 z-40 pointer-events-none"
               style={{ border: "30px solid #F4EFE6", boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)" }} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 font-['Bebas_Neue'] tracking-[0.4em] text-sm text-[#2C241B] bg-[#F4EFE6] px-4 py-1 rounded shadow">
            📸 PHOTO MODE · {biome.label}
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3">
            <button onClick={snapPhoto}
                    className="bg-[#F4EFE6] text-[#2C241B] px-6 py-3 rounded font-['Bebas_Neue'] tracking-widest hover:bg-white shadow-lg"
                    data-testid="snap-photo">CAPTURE</button>
            <button onClick={() => setPhotoMode(false)}
                    className="bg-black/70 text-[#f4efe6] border border-white/30 px-6 py-3 rounded font-['Bebas_Neue'] tracking-widest hover:bg-black/90"
                    data-testid="photo-mode-exit">EXIT (Esc)</button>
          </div>
        </>
      )}

      {/* Minimap — hidden in photo mode */}
      {!photoMode && (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/70 border border-white/20 rounded backdrop-blur-sm overflow-hidden cursor-pointer"
           style={{ width: mmW, height: mmH }} data-testid="biome-minimap"
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const fx = (e.clientX - rect.left) / mmW, fy = (e.clientY - rect.top) / mmH;
             targetRef.current = clamp(-(fx * SCENE_W * zoom) + vp.w/2, -(fy * SCENE_H * zoom) + vp.h/2);
           }}>
        {hotspots.map((h) => (
          <div key={h.a.id} className="absolute rounded-full"
               style={{
                 left: (h.x / SCENE_W) * mmW - 2,
                 top: (h.y / SCENE_H) * mmH - 2,
                 width: h.a.rarity >= 4 ? 6 : 4, height: h.a.rarity >= 4 ? 6 : 4,
                 background: discovered.has(h.a.id) ? biome.accent : `${biome.accent}50`,
                 boxShadow: discovered.has(h.a.id) ? `0 0 6px ${biome.accent}` : "none",
               }} />
        ))}
        <div className="absolute border-2 rounded-sm pointer-events-none"
             style={{
               left: (-cam.x / sceneW) * mmW,
               top: (-cam.y / sceneH) * mmH,
               width: Math.min(mmW, (vp.w / sceneW) * mmW),
               height: Math.min(mmH, (vp.h / sceneH) * mmH),
               borderColor: biome.accent, background: `${biome.accent}20`,
             }} />
      </div>
      )}

      {/* Discovery counter — only when not in photo mode */}
      {!photoMode && (
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-30 hidden" />
      )}

      {/* Revealed card */}
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
                {images[revealed.a.id] && (
                  <motion.img src={images[revealed.a.id]} alt={revealed.a.name}
                       className="w-full h-full object-cover"
                       initial={{ scale: 1.3, opacity: 0, filter: "blur(8px) sepia(1)" }}
                       animate={{ scale: 1, opacity: 1, filter: "blur(0px) sepia(0)" }}
                       transition={{ duration: 1.2 }} />
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
                <button onClick={() => setRevealed(null)} className="btn-wood flex-1" data-testid="reveal-close">Keep Walking</button>
                <button onClick={() => inspect(revealed.a)} className="btn-chi flex-1" data-testid="reveal-inspect">Full Page →</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!photoMode && <SaolaGuide context={`exploring the ${biome.label}`} />}
    </motion.div>
  );
};

export default BiomeView;
