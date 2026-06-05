import React, { useEffect, useState, useRef } from "react";
import { saolaStream } from "../lib/api";
import { onSaolaMood } from "../lib/saolaBus";
import { track } from "../lib/track";

const SAOLA_TIPS = [
  "Welcome, scholar. I am the Saola. Tap me to chat.",
  "Click the map to wander. The book to study. The box to play.",
  "5-star animals shake the parchment when discovered.",
];

const SaolaGuide = ({ context = "" }) => {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("default");
  const [chat, setChat] = useState([{ role: "saola", text: SAOLA_TIPS[0] }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const sessionRef = useRef(localStorage.getItem("saola.session") || crypto.randomUUID());
  const scrollRef = useRef(null);

  useEffect(() => { localStorage.setItem("saola.session", sessionRef.current); }, []);
  useEffect(() => { scrollRef.current?.scrollTo(0, 99999); }, [chat, streaming]);
  useEffect(() => onSaolaMood(setMood), []);

  const send = async () => {
    const msg = input.trim();
    if (!msg || streaming) return;
    track("saola_chat", { len: msg.length });
    setChat((c) => [...c, { role: "user", text: msg }, { role: "saola", text: "" }]);
    setInput("");
    setStreaming(true);
    try {
      let acc = "";
      for await (const chunk of saolaStream(sessionRef.current, `${context ? `[Context: ${context}] ` : ""}${msg}`)) {
        acc += chunk;
        setChat((c) => {
          const next = [...c];
          next[next.length - 1] = { role: "saola", text: acc };
          return next;
        });
      }
    } finally {
      setStreaming(false);
    }
  };

  // mood-driven visuals
  const eyeR = mood === "wideEyes" ? 8 : 5.5;
  const lanternOpacity = mood === "lanternFlare" ? 0.95 : 0.55;
  const lanternR = mood === "lanternFlare" ? 44 : 28;
  const armRot = mood === "chinStroke" ? -25 : 0;
  const armVisible = mood === "chinStroke";

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none" data-testid="saola-guide">
      {open && (
        <div className="mb-3 w-[320px] md:w-[380px] parchment parchment-edge rounded-lg p-4 unroll" data-testid="saola-chat-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="font-['Pirata_One'] text-2xl text-[#2C241B]">The Saola Speaks</div>
            <button onClick={() => setOpen(false)} className="text-[#5C5042] text-lg" data-testid="saola-close">×</button>
          </div>
          <div ref={scrollRef} className="max-h-64 overflow-y-auto pr-1 space-y-2 mb-2">
            {chat.map((m, i) => (
              <div key={i} className={`text-sm leading-relaxed ${m.role === "user" ? "text-[#5C5042] italic" : "text-[#2C241B]"}`}>
                <span className="font-['Bebas_Neue'] tracking-widest text-xs opacity-70 mr-1">{m.role === "user" ? "YOU:" : "SAOLA:"}</span>
                {m.text}{streaming && i === chat.length-1 ? "▌" : ""}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              data-testid="saola-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask the Saola anything..."
              className="flex-1 px-3 py-2 bg-[#F4EFE6] border border-[#8C7356] rounded text-[#2C241B] text-sm font-['Space_Mono']"
            />
            <button data-testid="saola-send" onClick={send} disabled={streaming} className="btn-wood text-sm py-2">
              {streaming ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
      <button
        data-testid="saola-toggle"
        onClick={() => setOpen((o) => !o)}
        className="relative w-24 h-24 md:w-28 md:h-28 float-y cursor-pointer"
        aria-label="Saola Guide"
        title={mood !== "default" ? `Saola: ${mood}` : "Saola"}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_8px_24px_rgba(255,140,0,0.5)]">
          {/* lantern glow with mood */}
          <circle cx="160" cy="135" r={lanternR} fill="#FFD700" opacity={lanternOpacity}
                  className={mood === "lanternFlare" ? "" : "glow-pulse"}>
            {mood === "lanternFlare" && (
              <animate attributeName="r" values="28;55;28" dur="0.6s" repeatCount="3" />
            )}
          </circle>
          {/* head */}
          <ellipse cx="100" cy="95" rx="45" ry="50" fill="#3a2418" stroke="#1a0f08" strokeWidth="2" />
          {/* white face stripes */}
          <path d="M75 70 L70 130" stroke="#f4efe6" strokeWidth="6" strokeLinecap="round" />
          <path d="M125 70 L130 130" stroke="#f4efe6" strokeWidth="6" strokeLinecap="round" />
          {/* eyes */}
          <ellipse cx="85" cy="95" rx={eyeR} ry={eyeR + 1} fill="#1a0f08">
            {mood === "wideEyes" && <animate attributeName="ry" values="6;10;6" dur="0.4s" repeatCount="3" />}
          </ellipse>
          <ellipse cx="115" cy="95" rx={eyeR} ry={eyeR + 1} fill="#1a0f08">
            {mood === "wideEyes" && <animate attributeName="ry" values="6;10;6" dur="0.4s" repeatCount="3" />}
          </ellipse>
          <circle cx="86" cy="93" r="1.5" fill="#FFD700" />
          <circle cx="116" cy="93" r="1.5" fill="#FFD700" />
          {/* nose */}
          <ellipse cx="100" cy="120" rx="6" ry="4" fill="#1a0f08" />
          {/* horns */}
          <path d="M78 55 Q70 30 65 15" stroke="#1a0f08" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M122 55 Q130 30 135 15" stroke="#1a0f08" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* hand stroking chin (only when chinStroke) */}
          {armVisible && (
            <g transform={`translate(95, 138) rotate(${armRot})`}>
              <path d="M0 0 Q15 -5 25 -18" stroke="#3a2418" strokeWidth="6" fill="none" strokeLinecap="round" />
              <circle cx="25" cy="-18" r="6" fill="#3a2418" />
              <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" />
            </g>
          )}
          {/* bamboo staff */}
          <line x1="155" y1="50" x2="170" y2="180" stroke="#6e4c2c" strokeWidth="4" strokeLinecap="round" />
          <line x1="158" y1="80" x2="167" y2="80" stroke="#4a3018" strokeWidth="2" />
          <line x1="160" y1="120" x2="169" y2="120" stroke="#4a3018" strokeWidth="2" />
          {/* lantern */}
          <rect x="148" y="120" width="24" height="30" rx="3" fill="#FFD700" stroke="#8C7356" strokeWidth="2" />
          <rect x="153" y="128" width="14" height="18" fill="#FF8C00" opacity="0.8" />
        </svg>
        {/* mood label puff */}
        {mood !== "default" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#1a0d00] text-[10px] font-['Bebas_Neue'] tracking-widest px-2 py-0.5 rounded shadow-md whitespace-nowrap">
            {mood === "chinStroke" ? "HMMMM…" : mood === "lanternFlare" ? "OH MY!" : "!!!"}
          </div>
        )}
      </button>
    </div>
  );
};

export default SaolaGuide;
