import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRegions } from "../lib/api";
import SaolaGuide from "../components/SaolaGuide";

// Biome glow nodes — positioned over the continents (viewBox 1000x520)
const REGIONS = [
  { key: "savanna", label: "Sun-Baked Savanna",  x: 540, y: 335, color: "#F2C047", desc: "Africa — lions roam the golden grass" },
  { key: "dunes",   label: "The Great Dunes",    x: 540, y: 240, color: "#F29F05", desc: "Sahara & Arabia — endless shifting sand" },
  { key: "canopy",  label: "Emerald Canopy",     x: 295, y: 350, color: "#A3D977", desc: "Amazon · Congo · SE Asia rainforests" },
  { key: "canopy2", label: "Canopy · SE Asia",   x: 800, y: 285, color: "#A3D977", desc: "Borneo, Sumatra — orangutans & tigers", targetKey: "canopy" },
  { key: "peaks",   label: "Mystic Peaks",       x: 700, y: 220, color: "#9DC4C4", desc: "Himalayas — snow leopards & yaks" },
  { key: "peaks2",  label: "Andean Peaks",       x: 290, y: 390, color: "#9DC4C4", desc: "Andes — condors above the clouds", targetKey: "peaks" },
  { key: "woods",   label: "Whispering Woods",   x: 540, y: 165, color: "#A0531A", desc: "European & East-Asian forests" },
  { key: "woods2",  label: "Woods · N. America", x: 195, y: 175, color: "#A0531A", desc: "Wolves & bears of the boreal", targetKey: "woods" },
  { key: "outback", label: "Crimson Outback",    x: 845, y: 400, color: "#D96941", desc: "Australia & New Zealand" },
  { key: "wastes",  label: "Frozen Wastes",      x: 480, y: 60,  color: "#cfe9f5", desc: "Arctic tundra" },
  { key: "wastes2", label: "Antarctic Ice",      x: 500, y: 485, color: "#cfe9f5", desc: "Penguins on glacial shores", targetKey: "wastes" },
  { key: "ocean",   label: "The Deep Blue",      x: 120, y: 300, color: "#F28D9F", desc: "Whales & the Galapagos" },
];

// Simplified but recognizable continents — viewBox 1000 x 520
// Each: name (optional label), label position (lx, ly), path d
const CONTINENTS = [
  { name: "N. AMERICA", lx: 195, ly: 130, d: "M115,100 Q150,75 195,80 Q235,75 270,95 Q300,110 305,140 Q318,160 295,185 Q300,215 270,240 Q245,260 215,255 Q190,265 175,245 Q155,250 140,225 Q115,200 110,170 Q100,140 115,100 Z" },
  { d: "M250,260 Q265,270 275,290 Q280,310 268,320 Q258,310 252,290 Z" },
  { name: "S. AMERICA", lx: 295, ly: 440, d: "M278,318 Q310,310 325,340 Q335,375 320,410 Q302,440 280,442 Q262,425 263,395 Q260,355 278,318 Z" },
  { name: "GRNLD", lx: 410, ly: 105, d: "M385,80 Q420,70 430,100 Q425,130 400,140 Q385,125 385,100 Z" },
  { name: "EUROPE", lx: 525, ly: 110, d: "M475,95 Q520,80 565,90 Q595,105 590,140 Q580,170 540,175 Q495,170 478,150 Q468,125 475,95 Z" },
  { name: "AFRICA", lx: 555, ly: 405, d: "M490,185 Q545,175 585,195 Q615,225 620,290 Q615,345 590,390 Q565,420 535,420 Q500,405 482,365 Q470,310 478,255 Q472,215 490,185 Z" },
  { name: "ASIA", lx: 780, ly: 130, d: "M595,75 Q700,55 810,75 Q880,95 905,150 Q920,210 875,250 Q810,275 740,265 Q670,255 620,225 Q590,180 590,130 Z" },
  { d: "M680,245 Q700,255 710,285 Q700,305 685,295 Q670,275 680,245 Z" },
  { d: "M605,215 Q625,225 625,255 Q610,260 600,245 Z" },
  { d: "M755,290 Q790,285 815,300 Q808,318 770,318 Q745,310 755,290 Z" },
  { d: "M880,180 Q895,175 895,200 Q885,210 875,200 Z" },
  { name: "AUSTRALIA", lx: 870, ly: 410, d: "M810,375 Q870,360 935,375 Q955,405 935,435 Q885,455 835,450 Q810,430 810,375 Z" },
  { d: "M950,455 Q965,455 968,475 Q955,485 945,475 Z" },
  { name: "ANTARCTICA", lx: 500, ly: 498, d: "M40,485 Q300,470 600,475 Q860,470 960,485 Q960,505 600,505 Q300,505 40,505 Z" },
  { d: "M625,365 Q638,365 640,390 Q628,395 622,380 Z" },
  { d: "M460,110 Q472,108 475,125 Q468,135 458,128 Z" },
  { d: "M430,90 Q442,90 442,103 Q433,108 428,98 Z" },
];

const WorldMap = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [hover, setHover] = useState(null);

  useEffect(() => {
    fetchRegions().then((d) => {
      const map = {};
      (d.regions || []).forEach((r) => { map[r.key] = r; });
      setStats(map);
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full" data-testid="world-map-page"
         style={{ background: "var(--color-desk)" }}>
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1619976553860-b7ffbe9a093b?auto=format&fit=crop&w=2000&q=80)",
        backgroundSize: "cover", mixBlendMode: "soft-light"
      }} />

      <div className="relative z-10 px-6 md:px-12 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} data-testid="back-home" className="btn-wood">← Desk</button>
          <div className="text-center">
            <div className="font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#FFD700]/70">TABULA MUNDI · A.D. MMXXVI</div>
            <div className="font-['Luckiest_Guy'] text-3xl md:text-5xl tracking-wider text-[#FFD700]"
                 style={{ textShadow: "0 0 22px rgba(255,140,0,0.7)" }}>THE WORLD ATLAS</div>
          </div>
          <div className="w-24" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto parchment parchment-edge rounded-md p-4">
          <svg viewBox="0 0 1000 520" className="w-full h-auto" style={{ aspectRatio: "1000/520" }}>
            <defs>
              <pattern id="paper-grain" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#F4EFE6" />
                <circle cx="2" cy="2" r="0.5" fill="#8C7356" opacity="0.15" />
                <circle cx="4" cy="4" r="0.3" fill="#8C7356" opacity="0.2" />
              </pattern>
              <linearGradient id="ocean-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dbcca8" />
                <stop offset="100%" stopColor="#c7b388" />
              </linearGradient>
              <linearGradient id="land-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a07a48" />
                <stop offset="100%" stopColor="#6a4a22" />
              </linearGradient>
              <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="5" />
                <feDisplacementMap in="SourceGraphic" scale="0.8" />
              </filter>
              <filter id="halo"><feGaussianBlur stdDeviation="3.5" /></filter>
            </defs>

            {/* parchment ocean */}
            <rect x="0" y="0" width="1000" height="520" fill="url(#ocean-grad)" />
            <rect x="0" y="0" width="1000" height="520" fill="url(#paper-grain)" opacity="0.4" />

            {/* faint latitude/longitude grid */}
            <g stroke="#8C7356" strokeOpacity="0.18" strokeWidth="0.6" fill="none">
              {Array.from({length: 11}).map((_, i) => (
                <line key={`v${i}`} x1={i*100} y1={0} x2={i*100} y2={520} />
              ))}
              {Array.from({length: 6}).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i*100} x2={1000} y2={i*100} />
              ))}
              {/* equator emphasized */}
              <line x1={0} y1={300} x2={1000} y2={300} stroke="#8C7356" strokeOpacity="0.4" strokeDasharray="4 4" />
            </g>

            {/* continents */}
            {CONTINENTS.map((c, i) => (
              <g key={i}>
                <path d={c.d} fill="url(#land-grad)" stroke="#3a2010" strokeWidth="1.5"
                      filter="url(#rough)" />
                {c.name && (
                  <text fill="#1a0e04" fontSize="11" fontFamily="'Space Mono', monospace"
                        opacity="0.65" letterSpacing="3" textAnchor="middle"
                        x={c.lx} y={c.ly} fontWeight="bold">
                    {c.name}
                  </text>
                )}
              </g>
            ))}

            {/* Compass rose */}
            <g transform="translate(940, 70)">
              <circle r="28" fill="none" stroke="#3a2010" strokeWidth="1" opacity="0.5" />
              <circle r="22" fill="none" stroke="#3a2010" strokeWidth="0.5" opacity="0.5" />
              <path d="M0,-28 L4,0 L0,28 L-4,0 Z" fill="#3a2010" opacity="0.7" />
              <path d="M-28,0 L0,-4 L28,0 L0,4 Z" fill="#3a2010" opacity="0.5" />
              <text y="-32" textAnchor="middle" fontSize="9" fontFamily="'Space Mono'" fill="#3a2010" opacity="0.8">N</text>
              <text y="38" textAnchor="middle" fontSize="9" fontFamily="'Space Mono'" fill="#3a2010" opacity="0.8">S</text>
            </g>

            {/* sea monsters ornament */}
            <g opacity="0.4" stroke="#3a2010" fill="none" strokeWidth="1">
              <path d="M80,420 q10,-10 20,0 q10,10 20,0 q10,-10 20,0" />
              <text x="80" y="445" fontSize="8" fontFamily="'Space Mono'" fill="#3a2010">HIC SVNT DRACONES</text>
            </g>

            {/* biome glow nodes */}
            {REGIONS.map((r) => {
              const target = r.targetKey || r.key;
              const s = stats[target] || { count: 0 };
              const isHover = hover?.key === r.key;
              return (
                <g key={r.key}
                   onClick={() => navigate(`/biome/${target}`)}
                   onMouseEnter={() => setHover(r)}
                   onMouseLeave={() => setHover(null)}
                   style={{ cursor: "pointer" }}
                   data-testid={`region-${r.key}`}>
                  <circle cx={r.x} cy={r.y} r="26" fill={r.color} opacity={isHover ? "0.35" : "0.22"} filter="url(#halo)" />
                  <circle cx={r.x} cy={r.y} r="14" fill={r.color} opacity="0.55" filter="url(#halo)" />
                  <circle cx={r.x} cy={r.y} r="7"  fill={r.color} stroke="#3a2010" strokeWidth="1.2">
                    <animate attributeName="r" values="6;9;6" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                  <text x={r.x} y={r.y + 34} textAnchor="middle"
                        style={{ font: "13px 'Pirata One', cursive", fill: "#2C241B", filter: "drop-shadow(0 1px 0 #F4EFE6)" }}>
                    {r.label}
                  </text>
                  <text x={r.x} y={r.y + 48} textAnchor="middle"
                        style={{ font: "9px 'Space Mono', monospace", fill: "#8C2703", letterSpacing: "1px" }}>
                    {s.count || 0} CREATURES
                  </text>
                </g>
              );
            })}

            {/* title cartouche */}
            <g transform="translate(500, 30)">
              <rect x="-110" y="-18" width="220" height="32" fill="#F4EFE6" stroke="#3a2010" strokeWidth="1.5" rx="3" />
              <text textAnchor="middle" y="4" fontSize="14" fontFamily="'Pirata One'" fill="#2C241B" letterSpacing="3">
                ORBIS · CREATURAE
              </text>
            </g>
          </svg>
        </div>

        {hover && (
          <div className="mt-4 max-w-2xl mx-auto parchment p-3 rounded-md unroll text-center">
            <div className="font-['Pirata_One'] text-2xl text-[#2C241B]">{hover.label}</div>
            <div className="font-['Cinzel'] text-sm text-[#5C5042] italic">{hover.desc}</div>
            <div className="mt-1 font-['Bebas_Neue'] tracking-widest text-xs text-[#8C7356]">CLICK TO ENTER →</div>
          </div>
        )}
      </div>

      <SaolaGuide context="user is on the World Atlas" />
    </div>
  );
};

export default WorldMap;
