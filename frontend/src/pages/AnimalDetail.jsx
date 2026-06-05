import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchAnimal } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
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

  useEffect(() => {
    fetchAnimal(id).then(setAnimal);
  }, [id]);

  useEffect(() => {
    if (animal) getWikiImage(animal.wiki).then(setImg);
  }, [animal]);

  if (!animal) return (
    <div className="min-h-screen flex items-center justify-center text-[#FFD700] font-['Pirata_One'] text-2xl">Loading…</div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--color-desk)" }} data-testid="animal-detail">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <button onClick={() => navigate(-1)} className="btn-wood mb-4" data-testid="animal-back">← Back</button>
        <div className={`parchment parchment-edge rounded-lg p-6 md:p-10 ${isUnlock ? "burn-in" : "unroll"}`}>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="w-full aspect-square bg-[#1a120b] rounded overflow-hidden border-2 border-[#8C7356]">
                {img && <img src={img} alt={animal.name} className="w-full h-full object-cover" />}
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
        </div>
      </div>
      <SaolaGuide context={`viewing ${animal.name}`} />
    </div>
  );
};

export default AnimalDetail;
