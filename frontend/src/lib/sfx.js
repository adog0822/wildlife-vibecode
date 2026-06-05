// Procedural sound effects via WebAudio API. No external assets.

let ctx = null;
const getCtx = () => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    try { ctx.resume(); } catch {}
  }
  return ctx;
};

const isMuted = () => localStorage.getItem("sfx.muted") === "1";
export const toggleMute = () => {
  const next = !isMuted();
  localStorage.setItem("sfx.muted", next ? "1" : "0");
  if (next) stopAmbient();
  return next;
};
export const isAudioMuted = isMuted;

// Short woody knock — tile clack
export const playTileClack = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(280, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(70, ac.currentTime + 0.18);
  g.gain.setValueAtTime(0.45, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.32);
  o.connect(g); g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 0.35);
};

// Crisp chi shimmer — used for hover, page turn etc.
export const playChi = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  [880, 1320, 1760].forEach((f, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, ac.currentTime + i * 0.04);
    g.gain.linearRampToValueAtTime(0.07, ac.currentTime + i * 0.04 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5 + i * 0.04);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + i * 0.04);
    o.stop(ac.currentTime + 0.6 + i * 0.04);
  });
};

// Parchment unroll — filtered noise sweep
export const playUnroll = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = "lowpass";
  filt.frequency.setValueAtTime(400, ac.currentTime);
  filt.frequency.linearRampToValueAtTime(2800, ac.currentTime + 0.4);
  const g = ac.createGain(); g.gain.value = 0.12;
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
};

// Big 5★ unlock — gong + chi
export const playUnlock = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  // gong
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sawtooth";
  o.frequency.value = 110;
  g.gain.setValueAtTime(0.5, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.6);
  const filt = ac.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 800;
  o.connect(filt); filt.connect(g); g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 1.7);
  // chi sparkle
  setTimeout(playChi, 220);
};

// Splinter — failed bluff
export const playSplinter = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 1500; filt.Q.value = 1;
  const g = ac.createGain(); g.gain.value = 0.4;
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
};

// Ambient biome — brown/pink noise filtered, plus optional pads
const ambientNodes = { active: null };
const BIOME_FREQ = { savanna: 800, dunes: 600, canopy: 380, peaks: 320, woods: 520, outback: 740, wastes: 260, ocean: 220 };
const BIOME_PAD = { savanna: 196, dunes: 220, canopy: 165, peaks: 110, woods: 147, outback: 175, wastes: 98, ocean: 82 };

export const startAmbient = (biome) => {
  stopAmbient();
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;

  // brown noise buffer (2s loop)
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  const filt = ac.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = BIOME_FREQ[biome] || 500;
  const ng = ac.createGain(); ng.gain.value = 0.045;
  noise.connect(filt); filt.connect(ng); ng.connect(ac.destination);

  // slow swelling pad
  const pad = ac.createOscillator();
  pad.type = "sine";
  pad.frequency.value = BIOME_PAD[biome] || 130;
  const pg = ac.createGain(); pg.gain.value = 0.0;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ac.createGain(); lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain); lfoGain.connect(pg.gain);
  pad.connect(pg); pg.connect(ac.destination);

  noise.start(); pad.start(); lfo.start();
  ambientNodes.active = { noise, pad, lfo, ng, pg };
};

export const stopAmbient = () => {
  if (!ambientNodes.active) return;
  const { noise, pad, lfo, ng, pg } = ambientNodes.active;
  try { ng.gain.setValueAtTime(ng.gain.value, getCtx().currentTime); ng.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.4); } catch {}
  try { pg.gain.setValueAtTime(pg.gain.value, getCtx().currentTime); pg.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.4); } catch {}
  setTimeout(() => {
    try { noise.stop(); } catch {}
    try { pad.stop(); } catch {}
    try { lfo.stop(); } catch {}
  }, 450);
  ambientNodes.active = null;
};
