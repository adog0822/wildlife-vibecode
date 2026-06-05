import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SID_KEY = "loxelife.session_id";

const getSessionId = () => {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
};

// Fire-and-forget tracker. Never blocks UI; failures are silent.
export const track = (event, meta = {}) => {
  const session_id = getSessionId();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  axios.post(`${API}/track`, { session_id, event, path, meta }, { timeout: 4000 }).catch(() => {});
};
