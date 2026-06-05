const KEY_UNLOCKED = "loxedex.unlocked";
const KEY_PLAYER = "loxedex.player";

export const getUnlocked = () => {
  try { return JSON.parse(localStorage.getItem(KEY_UNLOCKED) || "[]"); }
  catch { return []; }
};

export const isUnlocked = (id) => getUnlocked().includes(id);

export const unlock = (id) => {
  const cur = new Set(getUnlocked());
  if (cur.has(id)) return false;
  cur.add(id);
  localStorage.setItem(KEY_UNLOCKED, JSON.stringify([...cur]));
  return true;
};

export const getPlayerName = () => localStorage.getItem(KEY_PLAYER) || "";
export const setPlayerName = (n) => localStorage.setItem(KEY_PLAYER, n);
