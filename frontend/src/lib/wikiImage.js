// Fetches an image URL for a given Wikipedia page title via REST summary API.
// Caches results in localStorage to avoid re-fetching.
const CACHE_KEY = "wiki.image.cache.v1";

const loadCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch { return {}; }
};
const saveCache = (c) => localStorage.setItem(CACHE_KEY, JSON.stringify(c));

const pending = new Map();

export const getWikiImage = async (title) => {
  if (!title) return null;
  const cache = loadCache();
  if (cache[title]) return cache[title];
  if (pending.has(title)) return pending.get(title);

  const p = (async () => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const img = data.thumbnail?.source || data.originalimage?.source || null;
      if (img) {
        const c = loadCache();
        c[title] = img;
        saveCache(c);
      }
      return img;
    } catch {
      return null;
    }
  })();
  pending.set(title, p);
  return p;
};
