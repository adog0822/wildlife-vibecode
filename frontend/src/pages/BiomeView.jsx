import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAnimals } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked, unlock } from "../lib/storage";
import { startAmbient, stopAmbient, playUnlock, playChi, playFootstep } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import SaolaGuide from "../components/SaolaGuide";

// HIGH-RES Unsplash biome images (3840 wide) for max immersion
const Q = "?auto=format&fit=crop&w=3840&q=85";
const BIOMES = {
  savanna: {
    label: "Sun-Baked Savanna",
    tagline: "The grass hides golden eyes. Drag to roam, scroll to step forward.",
    bg: `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e${Q}`,
    sky: "linear-gradient(180deg, #f4b95a 0%, #c46a1c 40%, #5a2304 100%)",
    fg: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Acacia_silhouette.svg/640px-Acacia_silhouette.svg.png",
    overlay: "radial-gradient(circle at 50% 70%, rgba(255,180,80,0.10), transparent 60%), linear-gradient(180deg, rgba(217,119,54,0.05) 0%, rgba(20,8,2,0.50) 100%)",
    accent: "#F2C047", accentDeep: "#D97736",
    particle: "heat", ambient: "savanna",
  },
  dunes: {
    label: "The Great Dunes",
    tagline: "Sand whispers ancient secrets. Drag, scroll, dig deeper.",
    bg: `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${Q}`,
    sky: "linear-gradient(180deg, #f1a83a 0%, #c4691a 50%, #2c1b40 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 60% 50%, rgba(242,159,5,0.10), transparent 60%), linear-gradient(180deg, rgba(242,159,5,0.05) 0%, rgba(11,29,64,0.55) 100%)",
    accent: "#F29F05", accentDeep: "#8c4a02",
    particle: "sand", ambient: "dunes",
  },
  canopy: {
    label: "Emerald Canopy",
    tagline: "Mist hangs in the green cathedral. Push deeper into the vines.",
    bg: `https://images.unsplash.com/photo-1518837695005-2083093ee35b${Q}`,
    sky: "linear-gradient(180deg, #2a4a30 0%, #0e2a14 60%, #04130a 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 60%, rgba(74,222,128,0.10), transparent 60%), linear-gradient(180deg, rgba(30,89,40,0.20) 0%, rgba(4,16,8,0.55) 100%)",
    accent: "#A3D977", accentDeep: "#1E5928",
    particle: "mist", ambient: "canopy",
  },
  peaks: {
    label: "Mystic Peaks",
    tagline: "Wind sings through prayer flags. Step into the ridgeline.",
    bg: `https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99${Q}`,
    sky: "linear-gradient(180deg, #b8d8e0 0%, #5a8088 60%, #1a2a3a 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 30%, rgba(224,242,242,0.08), transparent 60%), linear-gradient(180deg, rgba(123,166,166,0.08) 0%, rgba(8,18,26,0.55) 100%)",
    accent: "#E0F2F2", accentDeep: "#7BA6A6",
    particle: "snow", ambient: "peaks",
  },
  woods: {
    label: "Whispering Woods",
    tagline: "Moss-laced silence. Something rustles in the auburn dark.",
    bg: `https://images.unsplash.com/photo-1448375240586-882707db888b${Q}`,
    sky: "linear-gradient(180deg, #2a1810 0%, #1a0e08 60%, #06030a 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 50%, rgba(115,32,2,0.12), transparent 60%), linear-gradient(180deg, rgba(38,64,39,0.22) 0%, rgba(6,3,10,0.70) 100%)",
    accent: "#A0531A", accentDeep: "#732002",
    particle: "spores", ambient: "woods",
  },
  outback: {
    label: "Crimson Outback",
    tagline: "Red earth hums. A kookaburra cackles at the dusk.",
    bg: `https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8${Q}`,
    sky: "linear-gradient(180deg, #f1a464 0%, #8c2703 60%, #2a0c04 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 50%, rgba(140,39,3,0.12), transparent 60%), linear-gradient(180deg, rgba(217,105,65,0.06) 0%, rgba(10,4,2,0.60) 100%)",
    accent: "#D96941", accentDeep: "#8C2703",
    particle: "dust", ambient: "outback",
  },
  wastes: {
    label: "Frozen Wastes",
    tagline: "Auroras wash the ice. Drag to hunt the silence.",
    bg: `https://images.unsplash.com/photo-1457269449834-928af64c684d${Q}`,
    sky: "linear-gradient(180deg, #233a4d 0%, #5b8c9d 30%, #cfe9f5 70%, #6688aa 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 30%, rgba(94,196,217,0.10), transparent 60%), linear-gradient(180deg, rgba(207,233,245,0.05) 0%, rgba(4,8,12,0.55) 100%)",
    accent: "#cfe9f5", accentDeep: "#5EC4D9",
    particle: "snow", ambient: "wastes",
  },
  ocean: {
    label: "The Deep Blue",
    tagline: "Bioluminescence drifts. Push deeper into the abyss.",
    bg: `https://images.unsplash.com/photo-1583212292454-1fe6229603b7${Q}`,
    sky: "linear-gradient(180deg, #0a3a5a 0%, #02101f 60%, #02060e 100%)",
    fg: null,
    overlay: "radial-gradient(circle at 50% 60%, rgba(2,48,89,0.30), transparent 60%), linear-gradient(180deg, rgba(242,141,159,0.04) 0%, rgba(2,6,14,0.75) 100%)",
    accent: "#F28D9F", accentDeep: "#023059",
    particle: "bubbles", ambient: "ocean",
  },
};

const hashCode = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h) + s.charCodeAt(i); return Math.abs(h); };

const SCENE_W = 9000;
const SCENE_H = 3200;

// Tiny SVG silhouette hints next to each hotspot — make wildlife visually discoverable
const AnimalSilhouette = ({ category, color, size = 60 }) => {
  // category derived from trophic / diet / habitat
  const props = { fill: color, opacity: 0.85 };
  switch (category) {
    case "big_cat":
      return <svg viewBox="0 0 100 60" width={size} height={size*0.6}><ellipse cx="60" cy="40" rx="32" ry="14" {...props}/><circle cx="85" cy="32" r="10" {...props}/><path d="M75 26 Q80 18 88 24" {...props}/><path d="M32 50 L28 60 M48 50 L48 60 M70 50 L72 60 M82 50 L84 60" stroke={color} strokeWidth="2.5" fill="none"/></svg>;
    case "bird":
      return <svg viewBox="0 0 100 60" width={size} height={size*0.6}><ellipse cx="50" cy="35" rx="20" ry="10" {...props}/><circle cx="75" cy="32" r="7" {...props}/><path d="M30 30 Q20 15 40 20 Q35 30 30 30 Z" {...props}/><path d="M20 35 L0 30 Q15 38 20 35 Z" {...props}/><path d="M48 45 L46 55 M55 45 L57 55" stroke={color} strokeWidth="2" fill="none"/></svg>;
    case "ape":
      return <svg viewBox="0 0 80 80" width={size*0.8} height={size*0.8}><circle cx="40" cy="30" r="20" {...props}/><circle cx="40" cy="55" r="22" {...props}/><circle cx="32" cy="28" r="3" fill="#fff"/><circle cx="48" cy="28" r="3" fill="#fff"/></svg>;
    case "fish":
      return <svg viewBox="0 0 100 50" width={size} height={size*0.5}><path d="M0 25 Q25 5 65 25 Q25 45 0 25 Z" {...props}/><path d="M65 25 L100 10 L92 25 L100 40 Z" {...props}/></svg>;
    case "whale":
      return <svg viewBox="0 0 120 50" width={size} height={size*0.4}><path d="M0 25 Q30 8 80 22 Q105 28 115 22 L115 30 Q100 38 75 28 Q35 38 0 30 Z" {...props}/></svg>;
    case "snake":
      return <svg viewBox="0 0 100 30" width={size} height={size*0.3}><path d="M0 20 Q15 5 30 20 Q45 35 60 20 Q75 5 90 20 L100 15" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/></svg>;
    case "reptile":
      return <svg viewBox="0 0 100 50" width={size} height={size*0.5}><ellipse cx="50" cy="30" rx="30" ry="12" {...props}/><circle cx="78" cy="22" r="6" {...props}/><path d="M22 38 L20 50 M40 38 L40 50 M60 38 L60 50 M76 38 L78 50" stroke={color} strokeWidth="2" fill="none"/></svg>;
    case "elephant":
      return <svg viewBox="0 0 100 80" width={size} height={size*0.8}><ellipse cx="55" cy="50" rx="30" ry="22" {...props}/><circle cx="80" cy="42" r="13" {...props}/><path d="M85 50 Q92 65 88 78" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M30 70 L28 80 M50 70 L50 80 M70 70 L72 80" stroke={color} strokeWidth="3" fill="none"/></svg>;
    case "bear":
      return <svg viewBox="0 0 100 80" width={size} height={size*0.8}><ellipse cx="55" cy="50" rx="32" ry="22" {...props}/><circle cx="80" cy="38" r="13" {...props}/><circle cx="75" cy="32" r="4" {...props}/><circle cx="85" cy="32" r="4" {...props}/><path d="M30 70 L30 78 M48 70 L48 78 M64 70 L64 78" stroke={color} strokeWidth="3" fill="none"/></svg>;
    case "deer":
      return <svg viewBox="0 0 100 80" width={size} height={size*0.8}><ellipse cx="50" cy="45" rx="22" ry="12" {...props}/><ellipse cx="78" cy="32" rx="6" ry="8" {...props}/><path d="M74 25 L70 12 M82 25 L86 12 M76 25 L70 18 M82 25 L88 18" stroke={color} strokeWidth="2" fill="none"/><path d="M35 56 L33 70 M48 56 L48 70 M60 56 L62 70 M70 56 L72 70" stroke={color} strokeWidth="2" fill="none"/></svg>;
    case "small":
    default:
      return <svg viewBox="0 0 60 40" width={size*0.6} height={size*0.4}><ellipse cx="32" cy="22" rx="18" ry="9" {...props}/><circle cx="48" cy="18" r="6" {...props}/><path d="M22 30 L20 38 M32 30 L32 38 M42 30 L44 38" stroke={color} strokeWidth="2" fill="none"/></svg>;
  }
};

const categorize = (a) => {
  const n = a.name.toLowerCase();
  if (n.includes("whale") || n.includes("dolphin")) return "whale";
  if (n.includes("shark") || n.includes("fish") || n.includes("squid") || n.includes("manta") || n.includes("ray")) return "fish";
  if (n.includes("eagle") || n.includes("owl") || n.includes("bird") || n.includes("vulture") || n.includes("falcon") || n.includes("hawk") || n.includes("toucan") || n.includes("macaw") || n.includes("penguin") || n.includes("kiwi") || n.includes("flam") || n.includes("ostrich") || n.includes("emu") || n.includes("cassowary") || n.includes("rhea") || n.includes("condor") || n.includes("crane") || n.includes("stork") || n.includes("kookaburra") || n.includes("kakapo") || n.includes("kea") || n.includes("hoatzin") || n.includes("petrel") || n.includes("albatross") || n.includes("booby") || n.includes("cormorant") || n.includes("monal") || n.includes("pheasant") || n.includes("peafowl") || n.includes("quetzal") || n.includes("lyrebird") || n.includes("hornbill") || n.includes("robin") || n.includes("capercaillie") || n.includes("paradise")) return "bird";
  if (n.includes("lion") || n.includes("tiger") || n.includes("leopard") || n.includes("cheetah") || n.includes("jaguar") || n.includes("puma") || n.includes("ocelot") || n.includes("caracal") || n.includes("lynx") || n.includes("bobcat") || n.includes("cougar") || n.includes("cat") || n.includes("panther") || n.includes("margay") || n.includes("serval") || n.includes("clouded")) return "big_cat";
  if (n.includes("snake") || n.includes("python") || n.includes("cobra") || n.includes("viper") || n.includes("anaconda") || n.includes("taipan") || n.includes("boa") || n.includes("rattlesnake") || n.includes("mamba")) return "snake";
  if (n.includes("crocodile") || n.includes("alligator") || n.includes("caiman") || n.includes("gharial") || n.includes("komodo") || n.includes("iguana") || n.includes("lizard") || n.includes("tortoise") || n.includes("turtle") || n.includes("tuatara") || n.includes("gecko") || n.includes("monitor")) return "reptile";
  if (n.includes("gorilla") || n.includes("chimp") || n.includes("orang") || n.includes("monkey") || n.includes("macaque") || n.includes("tamarin") || n.includes("mandrill") || n.includes("baboon") || n.includes("lemur") || n.includes("loris") || n.includes("howler") || n.includes("proboscis") || n.includes("binturong")) return "ape";
  if (n.includes("elephant") || n.includes("rhino") || n.includes("hippo") || n.includes("giraffe") || n.includes("tapir") || n.includes("buffalo") || n.includes("camel") || n.includes("yak") || n.includes("bison") || n.includes("oryx") || n.includes("moose") || n.includes("elk")) return "elephant";
  if (n.includes("bear") || n.includes("panda")) return "bear";
  if (n.includes("deer") || n.includes("gazelle") || n.includes("antelope") || n.includes("ibex") || n.includes("chamois") || n.includes("markhor") || n.includes("zebra") || n.includes("kangaroo") || n.includes("guanaco") || n.includes("llama") || n.includes("alpaca") || n.includes("vicuna") || n.includes("reindeer") || n.includes("wildebeest") || n.includes("warthog") || n.includes("saiga") || n.includes("pronghorn") || n.includes("bighorn") || n.includes("addax") || n.includes("tahr") || n.includes("saola") || n.includes("okapi") || n.includes("bongo")) return "deer";
  return "small";
};

const Particles = ({ kind, color }) => {
  const arr = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {arr.map((_, i) => (
        <span key={i} className="absolute rounded-full opacity-60"
          style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                   width: 3 + Math.random()*3, height: 3 + Math.random()*3,
                   background: color, boxShadow: `0 0 6px ${color}`,
                   animation: `float-y ${4 + Math.random()*6}s ease-in-out ${Math.random()*6}s infinite` }} />
      ))}
    </div>
  );
};

const Star = ({ filled, color }) => <span className={filled ? "" : "opacity-30"} style={{ color }}>★</span>;

const BiomeView = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const biome = BIOMES[key] || BIOMES.savanna;
  const [animals, setAnimals] = useState([]);
  const [revealed, setRevealed] = useState(null);
  const [discovered, setDiscovered] = useState(new Set());
  const [images, setImages] = useState({});
  const [showHint, setShowHint] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  // pan state: use ref for smooth rAF updates, mirror in state for layout
  const panRef = useRef({ x: -800, y: -400 });
  const [panSnap, setPanSnap] = useState({ x: -800, y: -400 });
  const dragRef = useRef({ active: false, sx: 0, sy: 0, sPan: { x: 0, y: 0 }, pinchDist: null, pinchZoom: 1 });
  const lastStepRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    fetchAnimals(key).then((d) => setAnimals(d.animals || []));
    startAmbient(biome.ambient);
    try { setDiscovered(new Set(JSON.parse(localStorage.getItem(`biome.discovered.${key}`) || "[]"))); } catch {}
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 5500);
    return () => { stopAmbient(); clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const sceneW = SCENE_W * zoom;
  const sceneH = SCENE_H * zoom;
  const minX = Math.min(0, -(sceneW - vp.w));
  const minY = Math.min(0, -(sceneH - vp.h));
  const clamp = (x, y) => ({ x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) });

  // distribute hotspots
  const hotspots = useMemo(() => {
    return animals.map((a, i) => {
      const cols = 8;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const totalRows = Math.ceil(animals.length / cols);
      const usableW = SCENE_W - 800;
      const usableH = SCENE_H - 800;
      const baseX = 400 + (col / Math.max(cols-1, 1)) * usableW;
      const baseY = 400 + (row / Math.max(totalRows-1, 1)) * usableH;
      const jx = (hashCode(a.id + "x") % 300) - 150;
      const jy = (hashCode(a.id + "y") % 240) - 120;
      return { a, x: baseX + jx, y: baseY + jy, cat: categorize(a) };
    });
  }, [animals]);

  // Smooth rAF-driven snap update
  const scheduleSnap = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setPanSnap({ ...panRef.current });
      rafRef.current = null;
    });
  };
  const setPan = (np) => { panRef.current = np; scheduleSnap(); };

  const startPan = (cx, cy) => {
    dragRef.current = { active: true, sx: cx, sy: cy, sPan: { ...panRef.current }, pinchDist: null, pinchZoom: zoom, moved: 0 };
    setShowHint(false);
  };
  const movePan = (cx, cy) => {
    if (!dragRef.current.active) return;
    const dx = cx - dragRef.current.sx, dy = cy - dragRef.current.sy;
    dragRef.current.moved = Math.max(dragRef.current.moved || 0, Math.sqrt(dx*dx+dy*dy));
    setPan(clamp(dragRef.current.sPan.x + dx, dragRef.current.sPan.y + dy));
    const now = Date.now();
    if (now - lastStepRef.current > 350) { playFootstep(); lastStepRef.current = now; }
  };
  const endPan = () => { dragRef.current.active = false; dragRef.current.pinchDist = null; };

  const onMouseDown = (e) => { e.preventDefault(); startPan(e.clientX, e.clientY); };
  const onMouseMove = (e) => movePan(e.clientX, e.clientY);
  const onMouseUp = endPan;

  const touchDist = (t) => { const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx*dx + dy*dy); };
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
      setZoom(Math.min(2.5, Math.max(0.7, dragRef.current.pinchZoom * (d / dragRef.current.pinchDist))));
    } else if (e.touches.length === 1) {
      movePan(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const onTouchEnd = endPan;

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(z => Math.min(2.5, Math.max(0.7, z - e.deltaY * 0.0025)));
    } else {
      // smooth pan with scroll
      setPan(clamp(panRef.current.x - e.deltaX, panRef.current.y - e.deltaY));
    }
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const STEP = 100;
      const p = panRef.current;
      if (["ArrowLeft","a","A"].includes(e.key)) { setPan(clamp(p.x + STEP, p.y)); playFootstep(); }
      else if (["ArrowRight","d","D"].includes(e.key)) { setPan(clamp(p.x - STEP, p.y)); playFootstep(); }
      else if (["ArrowUp","w","W"].includes(e.key)) { setPan(clamp(p.x, p.y + STEP)); playFootstep(); }
      else if (["ArrowDown","s","S"].includes(e.key)) { setPan(clamp(p.x, p.y - STEP)); playFootstep(); }
      else if (e.key === "+" || e.key === "=") setZoom(z => Math.min(2.5, z + 0.15));
      else if (e.key === "-" || e.key === "_") setZoom(z => Math.max(0.7, z - 0.15));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line

  const stepForward = () => { setZoom(z => Math.min(2.5, z + 0.2)); playFootstep(); };
  const stepBack = () => { setZoom(z => Math.max(0.7, z - 0.2)); playFootstep(); };

  const handleHotspot = async (h) => {
    if (dragRef.current.moved > 5) return; // ignore if was a drag
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

  // Minimap
  const mmW = 220, mmH = 80;
  const hsBase = vp.w < 640 ? 46 : 32;

  const pan = panSnap; // for layout
  return (
    <motion.div className="relative w-screen h-screen overflow-hidden select-none touch-none" data-testid={`biome-${key}`}
      initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
      style={{ background: biome.sky }}>

      {/* Header */}
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

      {/* Hint */}
      {showHint && (
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center px-6"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.92 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <div className="font-['Pirata_One'] text-2xl md:text-4xl text-[#f4efe6]"
               style={{ textShadow: "0 0 20px rgba(0,0,0,0.95)" }}>
            ↖ drag · scroll to roam ↗
          </div>
          <div className="font-['Space_Mono'] text-xs text-[#f4efe6]/80 mt-2">WASD / arrows · pinch or +/- to zoom</div>
        </motion.div>
      )}

      {/* SCENE viewport */}
      <div onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
           onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
           onWheel={onWheel}
           className="absolute inset-0 cursor-grab active:cursor-grabbing"
           style={{ touchAction: "none" }}>

        {/* Sky gradient (no parallax) */}
        <div className="absolute inset-0" style={{ background: biome.sky }} />

        {/* Far background (parallax 0.3) */}
        <div className="absolute inset-y-0 left-0"
             style={{
               width: sceneW * 1.5, height: sceneH,
               backgroundImage: `url(${biome.bg})`,
               backgroundSize: "cover", backgroundPosition: "center",
               transform: `translate3d(${pan.x * 0.3}px, ${pan.y * 0.5}px, 0)`,
               willChange: "transform",
               filter: "saturate(1.2) contrast(1.05) brightness(0.85)",
               opacity: 0.92,
             }} />

        {/* Mid layer — blurred copy for depth (parallax 0.65) */}
        <div className="absolute inset-y-0 left-0"
             style={{
               width: sceneW * 1.2, height: sceneH,
               backgroundImage: `url(${biome.bg})`,
               backgroundSize: "cover", backgroundPosition: "30% center",
               transform: `translate3d(${pan.x * 0.65}px, ${pan.y * 0.7}px, 0)`,
               willChange: "transform",
               opacity: 0.5,
               filter: "saturate(1.4) blur(2px) brightness(0.7)",
               mixBlendMode: "overlay",
             }} />

        {/* Atmospheric depth fog layer */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(180deg, ${biome.accentDeep}00 0%, ${biome.accentDeep}20 60%, ${biome.accentDeep}55 100%)`
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: biome.overlay }} />

        {/* Foreground layer (full speed) — hotspots */}
        <div className="absolute inset-y-0 left-0"
             style={{ width: sceneW, height: sceneH,
                      transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
                      willChange: "transform" }}>

          {/* hotspots — bigger glow + visible silhouette */}
          {hotspots.map((h) => {
            const disc = discovered.has(h.a.id);
            const isRevealing = revealed?.a.id === h.a.id;
            const haloSize = h.a.rarity >= 4 ? 160 : 120;
            return (
              <motion.button key={h.a.id}
                onClick={() => handleHotspot(h)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: h.x, top: h.y, width: haloSize, height: haloSize }}
                whileHover={{ scale: 1.1 }}
                data-testid={`hotspot-${h.a.id}`}>
                {/* expanding glow halo */}
                <div className="absolute inset-0 rounded-full"
                     style={{ background: `radial-gradient(circle, ${biome.accent}66 0%, ${biome.accent}22 30%, transparent 70%)` }} />
                <motion.div className="absolute inset-0 rounded-full"
                     style={{ background: `radial-gradient(circle, ${biome.accent}55 0%, transparent 60%)` }}
                     animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.3, 0.7] }}
                     transition={{ duration: 3, repeat: Infinity, delay: (hashCode(h.a.id) % 100) / 30 }} />

                {/* silhouette of the animal as a hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div style={{ filter: `drop-shadow(0 4px 12px ${biome.accent})` }}>
                    <AnimalSilhouette category={h.cat} color={disc ? biome.accent : `${biome.accentDeep}cc`} size={haloSize * 0.55} />
                  </div>
                </div>

                {/* rarity stars overlay */}
                {h.a.rarity === 5 && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: biome.accent, opacity: 0.25 }} />}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <div className="text-xs" style={{ color: biome.accent, textShadow: "0 0 6px #000" }}>{"★".repeat(h.a.rarity)}</div>
                  {disc && <div className="font-['Pirata_One'] text-xs px-2 py-0.5 rounded bg-black/70 text-white whitespace-nowrap">{h.a.name}</div>}
                </div>

                {/* Hover label */}
                {!disc && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-['Bebas_Neue'] tracking-widest pointer-events-none"
                       style={{ background: "rgba(0,0,0,0.85)", color: biome.accent }}>
                    TAP TO REVEAL
                  </div>
                )}

                {/* Burning-in image on reveal */}
                {isRevealing && images[h.a.id] && (
                  <motion.div className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-28 h-28 rounded-full overflow-hidden border-4 pointer-events-none"
                              style={{ borderColor: biome.accent, boxShadow: `0 0 30px ${biome.accent}` }}
                              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
                    <img src={images[h.a.id]} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Particles + vignette */}
        <Particles kind={biome.particle} color={biome.accent} />
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)" }} />
      </div>

      {/* On-screen +/- zoom buttons (right side) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2" data-testid="zoom-controls">
        <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                className="bg-black/60 border border-white/20 rounded w-10 h-10 text-[#f4efe6] hover:bg-black/80 font-bold text-xl backdrop-blur-sm" data-testid="zoom-in">+</button>
        <button onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                className="bg-black/60 border border-white/20 rounded w-10 h-10 text-[#f4efe6] hover:bg-black/80 font-bold text-xl backdrop-blur-sm" data-testid="zoom-out">−</button>
      </div>

      {/* Step forward/back controls */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-2" data-testid="step-controls">
        <button onClick={stepBack} className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Bebas_Neue'] tracking-widest text-xs text-[#f4efe6] hover:bg-black/80" data-testid="step-back">↓ STEP BACK</button>
        <div className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Space_Mono'] text-xs text-[#FFD700]">
          {(zoom*100).toFixed(0)}%
        </div>
        <button onClick={stepForward} className="bg-black/60 border border-white/20 rounded px-3 py-2 backdrop-blur-sm font-['Bebas_Neue'] tracking-widest text-xs text-[#f4efe6] hover:bg-black/80" data-testid="step-forward">↑ STEP FORWARD</button>
      </div>

      {/* Minimap */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/60 border border-white/20 rounded backdrop-blur-sm overflow-hidden"
           style={{ width: mmW, height: mmH }} data-testid="biome-minimap">
        {hotspots.map((h) => (
          <div key={h.a.id} className="absolute rounded-full"
               style={{
                 left: (h.x / SCENE_W) * mmW - 2,
                 top: (h.y / SCENE_H) * mmH - 2,
                 width: h.a.rarity >= 4 ? 5 : 3, height: h.a.rarity >= 4 ? 5 : 3,
                 background: discovered.has(h.a.id) ? biome.accent : `${biome.accent}50`,
                 boxShadow: discovered.has(h.a.id) ? `0 0 6px ${biome.accent}` : "none",
               }} />
        ))}
        <div className="absolute border-2 rounded-sm"
             style={{
               left: (-pan.x / sceneW) * mmW,
               top: (-pan.y / sceneH) * mmH,
               width: Math.min(mmW, (vp.w / sceneW) * mmW),
               height: Math.min(mmH, (vp.h / sceneH) * mmH),
               borderColor: biome.accent,
               background: `${biome.accent}20`,
             }} />
      </div>

      {/* Revealed card overlay */}
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
                       initial={{ scale: 1.3, opacity: 0, filter: "blur(8px) sepia(1)" }}
                       animate={{ scale: 1, opacity: 1, filter: "blur(0px) sepia(0)" }}
                       transition={{ duration: 1.2 }} />
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
