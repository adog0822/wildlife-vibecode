// Daily quest — picks one undiscovered 5★ (then 4★) animal seeded by today's date.
import { ANIMALS_HINTS } from "./animalHints";

const today = () => new Date().toISOString().slice(0, 10);
const hash = (s) => { let h = 0; for (let i=0;i<s.length;i++) h = ((h<<5)-h)+s.charCodeAt(i); return Math.abs(h); };

export const getDailyQuest = (allAnimals, unlockedIds) => {
  if (!allAnimals?.length) return null;
  const unlocked = new Set(unlockedIds);
  const candidates = allAnimals.filter(a => a.rarity >= 4 && !unlocked.has(a.id));
  const pool = candidates.length ? candidates : allAnimals.filter(a => a.rarity >= 3 && !unlocked.has(a.id));
  if (!pool.length) return null;
  const seed = hash(today());
  const a = pool[seed % pool.length];
  return {
    date: today(),
    animal_id: a.id,
    name: a.name,
    rarity: a.rarity,
    region: a.region,
    hint: ANIMALS_HINTS[a.id] || `A ${a.rarity}★ creature dwelling in the ${a.region} biome…`,
  };
};

export const isQuestComplete = () => {
  return localStorage.getItem(`quest.done.${today()}`) === "1";
};

export const completeQuest = () => {
  localStorage.setItem(`quest.done.${today()}`, "1");
};
