import React, { useEffect, useState } from "react";
import { getWikiImage } from "../lib/wikiImage";
import { isUnlocked } from "../lib/storage";

const Star = ({ filled }) => (
  <span className={filled ? "text-[#FFD700]" : "text-[#5C5042]"}>★</span>
);

const AnimalCard = ({ animal, onClick, forceUnlock = false, compact = false }) => {
  const [img, setImg] = useState(null);
  const unlocked = forceUnlock || isUnlocked(animal.id) || animal.rarity <= 2;

  useEffect(() => {
    getWikiImage(animal.wiki).then(setImg);
  }, [animal.wiki]);

  const tone = `wood-tile wood-tile-${animal.rarity}`;
  const isSpirit = animal.is_spirit;

  return (
    <button
      data-testid={`animal-card-${animal.id}`}
      onClick={onClick}
      className={`${isSpirit ? "spirit-tile" : tone} relative p-2 text-left transition-transform hover:-translate-y-1 ${animal.rarity === 5 ? "chi-glow" : ""}`}
      style={{ width: compact ? 120 : 160, minHeight: compact ? 150 : 200 }}
    >
      <div className="w-full bg-black/30 rounded overflow-hidden mb-2" style={{ aspectRatio: "1/1" }}>
        {img ? (
          <img
            src={img}
            alt={animal.name}
            className={`w-full h-full object-cover ${unlocked ? "" : "charcoal"} ${animal.rarity >= 4 ? "" : "pyrography"}`}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#f4efe6]/50 text-xs">loading…</div>
        )}
      </div>
      <div className={`font-['Pirata_One'] text-base leading-tight ${isSpirit ? "text-[#2c241b]" : "text-[#f4efe6]"}`}>
        {unlocked ? animal.name : "???"}
      </div>
      <div className="text-xs">
        {[1,2,3,4,5].map((i) => <Star key={i} filled={i <= animal.rarity} />)}
      </div>
    </button>
  );
};

export default AnimalCard;
