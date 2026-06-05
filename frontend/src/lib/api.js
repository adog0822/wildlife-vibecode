import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

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
