import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { fetchAnimal } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import { playUnlock } from "../lib/sfx";
import { setSaolaMood } from "../lib/saolaBus";
import { completeQuest } from "../lib/dailyQuest";
import SaolaGuide from "../components/SaolaGuide";

const Stat = ({ label, value, max = 10 }) => (
  <div className="flex items-center gap-2">
    <div className="w-32 font-['Space_Mono'] uppercase text-xs tracking-widest text-[#5C5042]">{label}</div>
    <div className="flex-1 h-3 bg-[#D4C4A8] rounded relative overflow-hidden">
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FFD700] to-[#FF8C00]" style={{ width: `${(value/max)*100}%` }} />
    </div>
    <div className="font-['Bebas_Neue'] text-lg text-[#2C241B] w-8 text-right">{value}</div>
  </div>
);

const AnimalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const isUnlock = params.get("unlock") === "1";
  const [animal, setAnimal] = useState(null);
  const [img, setImg] = useState(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => { fetchAnimal(id).then(setAnimal); }, [id]);
  useEffect(() => { if (animal) getWikiImage(animal.wiki).then(setImg); }, [animal]);

  useEffect(() => {
    if (animal && isUnlock) {
      if (animal.rarity === 5) { playUnlock(); setSaolaMood("lanternFlare", 2400); }
      // mark daily quest complete if this is the questal animal
      try {
        const q = JSON.parse(localStorage.getItem("loxedex.lastQuest") || "null");
        if (q && q.animal_id === id) completeQuest();
      } catch {}
    }
  }, [animal, isUnlock, id]);

  const shareCard = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `loxelife-${animal.id}.png`;
      link.href = dataUrl;
      link.click();
      // try web share
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `loxelife-${animal.id}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `I discovered the ${animal.name} on LoxeLife!`, text: "Can you find them all? 🌍🐾" });
        }
      } catch {}
    } finally {
      setSharing(false);
    }
  };

  if (!animal) return (
    <div className="min-h-screen flex items-center justify-center text-[#FFD700] font-['Pirata_One'] text-2xl">Loading…</div>
  );

  return (
    <motion.div className="min-h-screen" style={{ background: "var(--color-desk)" }} data-testid="animal-detail"
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="btn-wood" data-testid="animal-back">← Back</button>
          {animal.rarity >= 4 && (
            <button onClick={shareCard} disabled={sharing} className="btn-chi text-sm" data-testid="share-card">
              {sharing ? "Burning the page..." : "↗ Share Discovery Card"}
            </button>
          )}
        </div>

        {/* Shareable card content */}
        <div ref={cardRef} className={`parchment parchment-edge rounded-lg p-6 md:p-10 ${isUnlock ? "burn-in" : "unroll"}`}>
          <div className="text-center font-['Bebas_Neue'] tracking-[0.4em] text-xs text-[#8C7356] mb-1">
            LOXELIFE · OFFICIAL DISCOVERY
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="w-full aspect-square bg-[#1a120b] rounded overflow-hidden border-2 border-[#8C7356] relative">
                {img && <img src={img} alt={animal.name} className="w-full h-full object-cover" crossOrigin="anonymous" />}
                {animal.rarity === 5 && (
                  <div className="absolute inset-0 chi-glow rounded pointer-events-none" />
                )}
              </div>
              {animal.rarity === 5 && (
                <div className="mt-3 text-center font-['Shojumaru'] text-[#FFD700] text-xl text-chi glow-pulse">★ LEGENDARY DISCOVERY ★</div>
              )}
            </div>
            <div>
              <div className="font-['Pirata_One'] text-4xl md:text-5xl text-[#2C241B]" data-testid="animal-name">{animal.name}</div>
              <div className="font-['Cinzel'] italic text-[#5C5042] mb-2">{animal.subregion} · {animal.region}</div>
              <div className="text-[#FFD700] text-2xl mb-4">{"★".repeat(animal.rarity)}<span className="text-[#5C5042]">{"★".repeat(5-animal.rarity)}</span></div>
              <div className="font-['Cinzel'] text-lg text-[#2C241B] mb-4 italic">Superpower: <span className="font-bold">{animal.superpower}</span></div>
              <div className="space-y-2 mb-4">
                <Stat label="Trophic Level" value={animal.diet} />
                <Stat label="Stealth" value={animal.stealth} />
                <Stat label="Ecosystem Impact" value={animal.impact} />
                <Stat label="Invasive Potential" value={animal.invasive} />
                <Stat label="Survivability (50yr)" value={animal.survivability} />
              </div>
              <div className="font-['Bebas_Neue'] text-xl tracking-widest text-[#8C7356] mb-1">Field Notes</div>
              <ul className="font-['Cinzel'] text-[#2C241B] list-disc pl-5 space-y-1 text-base">
                {animal.facts.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-4 text-center font-['Cinzel'] italic text-[#5C5042] text-xs">loxelife.world · the scholar's atlas</div>
        </div>
      </div>
      <SaolaGuide context={`viewing ${animal.name}`} />
    </motion.div>
  );
};

export default AnimalDetail;
