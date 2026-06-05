import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// ============== GLOBAL 5xx AUTO-RETRY + WAKE-UP BANNER ==============
// Preview pods hibernate when idle. First request after wakeup may 502 while the
// backend boots. We silently retry once, then twice more with longer delays,
// while broadcasting a "waking" event so a banner can reassure the visitor.
const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const wakeBus = { listeners: new Set() };
export const onWakeStateChange = (cb) => {
  wakeBus.listeners.add(cb);
  return () => wakeBus.listeners.delete(cb);
};
const broadcast = (state) => wakeBus.listeners.forEach((cb) => { try { cb(state); } catch {} });

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const cfg = err?.config;
    const status = err?.response?.status;
    const isOurApi = cfg?.url && cfg.url.startsWith(API);
    const retriable = !status || status === 502 || status === 503 || status === 504;
    if (!cfg || !isOurApi || !retriable) return Promise.reject(err);

    cfg.__retryCount = (cfg.__retryCount || 0) + 1;
    if (cfg.__retryCount > 3) {
      broadcast({ status: "failed" });
      return Promise.reject(err);
    }
    broadcast({ status: "waking", attempt: cfg.__retryCount });
    await SLEEP(cfg.__retryCount * 1500); // 1.5s, 3s, 4.5s
    try {
      const out = await axios(cfg);
      broadcast({ status: "ok" });
      return out;
    } catch (e) {
      throw e;
    }
  }
);

export const fetchAnimals = async (region) => {
  const { data } = await axios.get(`${API}/animals`, { params: region ? { region } : {} });
  return data;
};

export const fetchAnimal = async (id) => {
  const { data } = await axios.get(`${API}/animals/${id}`);
  return data;
};

export const fetchRegions = async () => {
  const { data } = await axios.get(`${API}/regions`);
  return data;
};

export const fetchScholarRound = async () => {
  const { data } = await axios.get(`${API}/scholar/round`);
  return data;
};

export const fetchLeaderboard = async (limit = 10) => {
  const { data } = await axios.get(`${API}/leaderboard`, { params: { limit } });
  return data;
};

export const submitLeaderboard = async ({ name, score, biome }) => {
  const { data } = await axios.post(`${API}/leaderboard`, { name, score, biome });
  return data;
};

export const createPokerRoom = async () => {
  const { data } = await axios.post(`${API}/poker/create`);
  return data;
};

// Saola chat — streaming via fetch (since axios in browser can't stream nicely)
export const saolaStream = async function* (sessionId, message) {
  const res = await fetch(`${API}/saola/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
};

// WebSocket URL helper
export const wsURL = (code) => {
  const url = new URL(BACKEND_URL);
  const proto = url.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${url.host}/api/ws/poker/${code}`;
};
