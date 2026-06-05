import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchRegions } from "../lib/api";
import SaolaGuide from "../components/SaolaGuide";
import { playUnroll, playChi } from "../lib/sfx";

// Wikimedia public domain world map (equirectangular). Stable Special:FilePath URL.
const WORLD_MAP_PNG = "https://en.wikipedia.org/wiki/Special:FilePath/BlankMap-World.svg?width=2000";

// Convert lat/lng to equirectangular (viewBox 1000 x 500, lon -180..180, lat 90..-90)
const project = (lat, lon) => ({
  x: ((lon + 180) / 360) * 1000,
  y: ((90 - lat) / 180) * 500,
});

const REGIONS = [
  { key: "savanna", label: "Sun-Baked Savanna",  lat: -2,  lon: 34,  color: "#F2C047", desc: "Africa — lions roam the golden grass" },
  { key: "dunes",   label: "The Great Dunes",    lat: 23,  lon: 13,  color: "#F29F05", desc: "Sahara & Arabia — endless shifting sand" },
  { key: "canopy",  label: "Emerald Canopy",     lat: -4,  lon: -62, color: "#A3D977", desc: "Amazon · Congo · SE Asia rainforests" },
  { key: "canopy2", label: "Canopy · SE Asia",   lat: 1,   lon: 114, color: "#A3D977", desc: "Borneo, Sumatra — orangutans & tigers", targetKey: "canopy" },
  { key: "peaks",   label: "Mystic Peaks",       lat: 30,  lon: 84,  color: "#9DC4C4", desc: "Himalayas — snow leopards" },
  { key: "peaks2",  label: "Andean Peaks",       lat: -15, lon: -71, color: "#9DC4C4", desc: "Andes — condors above the clouds", targetKey: "peaks" },
  { key: "woods",   label: "Whispering Woods",   lat: 50,  lon: 25,  color: "#A0531A", desc: "European & East-Asian forests" },
  { key: "woods2",  label: "Woods · N. America", lat: 50,  lon: -100,color: "#A0531A", desc: "Wolves & bears of the boreal", targetKey: "woods" },
  { key: "outback", label: "Crimson Outback",    lat: -25, lon: 134, color: "#D96941", desc: "Australia & New Zealand" },
  { key: "wastes",  label: "Frozen Wastes",      lat: 78,  lon: 0,   color: "#cfe9f5", desc: "Arctic tundra" },
  { key: "wastes2", label: "Antarctic Ice",      lat: -80, lon: 0,   color: "#cfe9f5", desc: "Penguins on glacial shores", targetKey: "wastes" },
  { key: "ocean",   label: "The Deep Blue",      lat: 5,   lon: -150,color: "#F28D9F", desc: "The Pacific — whales & Galapagos" },
];

const WorldMap = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [hover, setHover] = useState(null);

  useEffect(() => {
    playUnroll();
    fetchRegions().then((d) => {
      const map = {};
      (d.regions || []).forEach((r) => { map[r.key] = r; });
      setStats(map);
    });
  }, []);

  return (
    <motion.div
      className="relative min-h-screen w-full" data-testid="world-map-page"
      style={{ background: "var(--color-desk)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
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

        <motion.div
          initial={{ scaleY: 0.05, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ transformOrigin: "top" }}
          className="relative w-full max-w-6xl mx-auto parchment parchment-edge rounded-md p-4 overflow-hidden">

          {/* Antique parchment ocean tint underneath */}
          <div className="relative w-full" style={{ aspectRatio: "2/1" }}>
            {/* longitude/latitude grid */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <g stroke="#8C7356" strokeOpacity="0.18" strokeWidth="0.4" fill="none">
                {Array.from({length: 13}).map((_, i) => (
                  <line key={`v${i}`} x1={i*1000/12} y1={0} x2={i*1000/12} y2={500} />
                ))}
                {Array.from({length: 7}).map((_, i) => (
                  <line key={`h${i}`} x1={0} y1={i*500/6} x2={1000} y2={i*500/6} />
                ))}
                {/* equator and prime meridian */}
                <line x1={0} y1={250} x2={1000} y2={250} stroke="#8C2703" strokeOpacity="0.35" strokeDasharray="6 4" />
                <line x1={500} y1={0} x2={500} y2={500} stroke="#8C2703" strokeOpacity="0.25" strokeDasharray="6 4" />
                {/* tropics */}
                <line x1={0} y1={185} x2={1000} y2={185} strokeDasharray="2 3" strokeOpacity="0.15" />
                <line x1={0} y1={315} x2={1000} y2={315} strokeDasharray="2 3" strokeOpacity="0.15" />
              </g>
            </svg>

            {/* Real world map image — Wikimedia Commons, tinted parchment */}
            <img
              src={WORLD_MAP_PNG}
              alt="World Atlas"
              className="absolute inset-0 w-full h-full select-none pointer-events-none"
              style={{
                filter: "sepia(0.95) saturate(1.5) contrast(1.15) brightness(0.75) hue-rotate(-10deg)",
                mixBlendMode: "multiply",
                objectFit: "fill",
              }}
              draggable={false}
            />

            {/* Continent name labels in light caps */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              {[
                { name: "NORTH AMERICA", lat: 45, lon: -100 },
                { name: "SOUTH AMERICA", lat: -15, lon: -60 },
                { name: "EUROPE", lat: 54, lon: 18 },
                { name: "AFRICA", lat: 5, lon: 22 },
                { name: "ASIA", lat: 45, lon: 95 },
                { name: "AUSTRALIA", lat: -27, lon: 134 },
                { name: "ANTARCTICA", lat: -82, lon: 30 },
              ].map((c, i) => {
                const p = project(c.lat, c.lon);
                return (
                  <text key={i} x={p.x} y={p.y} textAnchor="middle"
                        fill="#1a0e04" opacity="0.55" fontSize="11" letterSpacing="3"
                        fontFamily="'Space Mono', monospace" fontWeight="bold">
                    {c.name}
                  </text>
                );
              })}
              {/* Ocean labels */}
              {[
                { name: "PACIFIC OCEAN", lat: -15, lon: -150, fs: 9 },
                { name: "ATLANTIC OCEAN", lat: 0, lon: -30, fs: 9 },
                { name: "INDIAN OCEAN", lat: -20, lon: 80, fs: 9 },
              ].map((c, i) => {
                const p = project(c.lat, c.lon);
                return (
                  <text key={i} x={p.x} y={p.y} textAnchor="middle"
                        fill="#3a2010" opacity="0.45" fontSize={c.fs} letterSpacing="2"
                        fontFamily="'Cinzel', serif" fontStyle="italic">
                    {c.name}
                  </text>
                );
              })}
            </svg>

            {/* Biome glow nodes (interactive) */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id="halo2"><feGaussianBlur stdDeviation="3.5" /></filter>
              </defs>
              {REGIONS.map((r) => {
                const p = project(r.lat, r.lon);
                const target = r.targetKey || r.key;
                const s = stats[target] || { count: 0 };
                return (
                  <g key={r.key}
                     onClick={() => { playChi(); setTimeout(() => navigate(`/biome/${target}`), 200); }}
                     onMouseEnter={() => setHover(r)}
                     onMouseLeave={() => setHover(null)}
                     style={{ cursor: "pointer" }}
                     data-testid={`region-${r.key}`}>
                    <circle cx={p.x} cy={p.y} r="22" fill={r.color} opacity="0.28" filter="url(#halo2)" />
                    <circle cx={p.x} cy={p.y} r="12" fill={r.color} opacity="0.55" filter="url(#halo2)" />
                    <circle cx={p.x} cy={p.y} r="6"  fill={r.color} stroke="#3a2010" strokeWidth="1.2">
                      <animate attributeName="r" values="5;8;5" dur="2.6s" repeatCount="indefinite" />
                    </circle>
                    <text x={p.x} y={p.y + 22} textAnchor="middle"
                          style={{ font: "12px 'Pirata One', cursive", fill: "#2C241B", filter: "drop-shadow(0 1px 0 #F4EFE6)" }}>
                      {r.label}
                    </text>
                    <text x={p.x} y={p.y + 35} textAnchor="middle"
                          style={{ font: "8px 'Space Mono', monospace", fill: "#8C2703", letterSpacing: "1px" }}>
                      {s.count || 0} CREATURES
                    </text>
                  </g>
                );
              })}

              {/* Compass rose */}
              <g transform="translate(945, 55)">
                <circle r="22" fill="none" stroke="#3a2010" strokeWidth="0.8" opacity="0.6" />
                <circle r="16" fill="none" stroke="#3a2010" strokeWidth="0.4" opacity="0.6" />
                <path d="M0,-22 L3,0 L0,22 L-3,0 Z" fill="#3a2010" opacity="0.75" />
                <path d="M-22,0 L0,-3 L22,0 L0,3 Z" fill="#3a2010" opacity="0.5" />
                <text y="-26" textAnchor="middle" fontSize="8" fontFamily="'Space Mono'" fill="#3a2010" opacity="0.8">N</text>
                <text y="30"  textAnchor="middle" fontSize="8" fontFamily="'Space Mono'" fill="#3a2010" opacity="0.8">S</text>
              </g>

              {/* Sea monster ornament */}
              <g opacity="0.45" stroke="#3a2010" fill="none" strokeWidth="0.8">
                <path d="M70,440 q8,-8 16,0 q8,8 16,0 q8,-8 16,0 q8,8 16,0" />
                <text x="70" y="460" fontSize="7" fontFamily="'Cinzel', serif" fontStyle="italic" fill="#3a2010" letterSpacing="2">
                  HIC SVNT DRACONES
                </text>
              </g>

              {/* Title cartouche */}
              <g transform="translate(500, 22)">
                <rect x="-110" y="-14" width="220" height="26" fill="#F4EFE6" stroke="#3a2010" strokeWidth="1" rx="2" opacity="0.95" />
                <text textAnchor="middle" y="4" fontSize="13" fontFamily="'Pirata One'" fill="#2C241B" letterSpacing="3">
                  ORBIS · CREATURAE
                </text>
              </g>
            </svg>
          </div>
        </motion.div>

        {hover && (
          <div className="mt-4 max-w-2xl mx-auto parchment p-3 rounded-md unroll text-center">
            <div className="font-['Pirata_One'] text-2xl text-[#2C241B]">{hover.label}</div>
            <div className="font-['Cinzel'] text-sm text-[#5C5042] italic">{hover.desc}</div>
            <div className="mt-1 font-['Bebas_Neue'] tracking-widest text-xs text-[#8C7356]">CLICK TO ENTER →</div>
          </div>
        )}
      </div>

      <SaolaGuide context="user is on the World Atlas" />
    </motion.div>
  );
};

export default WorldMap;
