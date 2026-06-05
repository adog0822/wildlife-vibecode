import React, { useEffect, useState } from "react";
import { onWakeStateChange } from "../lib/api";

// Shows a non-intrusive banner when the backend is waking up (cold boot / transient 5xx).
// Hides itself silently when requests succeed.
const WakeBanner = () => {
  const [state, setState] = useState(null); // { status: "waking"|"failed"|"ok", attempt }

  useEffect(() => onWakeStateChange((s) => {
    setState(s);
    if (s.status === "ok") {
      setTimeout(() => setState(null), 1200);
    }
  }), []);

  if (!state || state.status === "ok") return null;

  const isFail = state.status === "failed";
  return (
    <div
      data-testid="wake-banner"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded font-['Bebas_Neue'] tracking-widest text-xs shadow-lg"
      style={{
        background: isFail ? "rgba(120,10,10,0.92)" : "rgba(26,15,4,0.92)",
        color: isFail ? "#ffb3b3" : "#FFD700",
        border: `1px solid ${isFail ? "#ff6363" : "#8C7356"}`,
      }}
    >
      {isFail ? (
        <span>⚠ Sanctuary unreachable — please <button onClick={() => window.location.reload()} className="underline ml-1">refresh</button></span>
      ) : (
        <span>⟁ Waking the sanctuary… (attempt {state.attempt}/3)</span>
      )}
    </div>
  );
};

export default WakeBanner;
