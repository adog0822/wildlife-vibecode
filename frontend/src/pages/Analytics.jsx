import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ADMIN_KEY_LS = "loxelife.admin_key";

const Stat = ({ label, value }) => (
  <div className="bg-[#1a0f04]/80 border border-[#8C7356]/50 rounded p-4">
    <div className="font-['Bebas_Neue'] tracking-widest text-xs text-[#FFD700]/70">{label}</div>
    <div className="font-['Luckiest_Guy'] text-3xl text-[#FFD700] mt-1" data-testid={`stat-${label.replace(/\s/g,"-").toLowerCase()}`}>{value}</div>
  </div>
);

const Analytics = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(localStorage.getItem(ADMIN_KEY_LS) || "");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (k) => {
    if (!k) return;
    setLoading(true); setErr("");
    try {
      const { data } = await axios.get(`${API}/analytics/summary`, { params: { key: k }, timeout: 8000 });
      setData(data);
      localStorage.setItem(ADMIN_KEY_LS, k);
    } catch (e) {
      setErr(e?.response?.status === 401 ? "Invalid admin key." : "Failed to load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(180deg,#06030a,#1a0f04)" }} data-testid="analytics-page">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button onClick={() => navigate("/")} className="btn-wood text-sm" data-testid="analytics-back">← Home</button>
          <h1 className="font-['Pirata_One'] text-3xl md:text-4xl text-[#FFD700]">LoxeLife Analytics</h1>
          <div className="w-16" />
        </div>

        {/* Key gate */}
        <div className="bg-[#1a0f04]/80 border border-[#8C7356]/50 rounded p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center">
          <label className="font-['Bebas_Neue'] tracking-widest text-xs text-[#FFD700]/80 shrink-0">ADMIN KEY</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="paste your ANALYTICS_KEY"
            className="flex-1 bg-[#06030a] border border-[#8C7356]/60 rounded px-3 py-1.5 text-[#f4efe6] font-['Space_Mono'] text-sm w-full"
            data-testid="admin-key-input"
          />
          <button onClick={() => load(key)} className="btn-chi text-sm" data-testid="admin-key-submit">
            {loading ? "Loading…" : "Unlock"}
          </button>
        </div>

        {err && <div className="text-red-400 font-['Space_Mono'] text-sm mb-4" data-testid="analytics-error">{err}</div>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Stat label="Total Events" value={data.total_events} />
              <Stat label="Unique Sessions" value={data.unique_sessions} />
              <Stat label="Active Today" value={data.active.today} />
              <Stat label="Active 7d" value={data.active.week} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#1a0f04]/80 border border-[#8C7356]/50 rounded p-4" data-testid="top-biomes-card">
                <div className="font-['Bebas_Neue'] tracking-widest text-xs text-[#FFD700]/70 mb-2">TOP BIOMES (entered)</div>
                {data.top_biomes.length === 0 ? (
                  <div className="font-['Space_Mono'] text-xs text-[#f4efe6]/50">No biome entries yet.</div>
                ) : data.top_biomes.map((b, i) => (
                  <div key={i} className="flex justify-between border-b border-[#8C7356]/20 py-1">
                    <span className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]">{i+1}. {b.key}</span>
                    <span className="font-['Luckiest_Guy'] text-[#FFD700]">{b.count}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a0f04]/80 border border-[#8C7356]/50 rounded p-4" data-testid="top-animals-card">
                <div className="font-['Bebas_Neue'] tracking-widest text-xs text-[#FFD700]/70 mb-2">TOP ANIMALS (viewed)</div>
                {data.top_animals.length === 0 ? (
                  <div className="font-['Space_Mono'] text-xs text-[#f4efe6]/50">No animal views yet.</div>
                ) : data.top_animals.map((b, i) => (
                  <div key={i} className="flex justify-between border-b border-[#8C7356]/20 py-1">
                    <span className="font-['Space_Mono'] text-xs text-[#f4efe6]">{i+1}. {b.key}</span>
                    <span className="font-['Luckiest_Guy'] text-[#FFD700]">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a0f04]/80 border border-[#8C7356]/50 rounded p-4" data-testid="events-by-type-card">
              <div className="font-['Bebas_Neue'] tracking-widest text-xs text-[#FFD700]/70 mb-2">EVENTS BY TYPE</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                {data.events_by_type.map((e, i) => (
                  <div key={i} className="flex justify-between border-b border-[#8C7356]/20 py-1 pr-2">
                    <span className="font-['Space_Mono'] text-xs text-[#f4efe6]">{e.event}</span>
                    <span className="font-['Luckiest_Guy'] text-sm text-[#FFD700]">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="font-['Space_Mono'] text-[10px] text-[#5C5042] mt-4 text-right">
              generated {new Date(data.generated_at).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
