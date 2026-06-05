// Procedural sound effects via WebAudio API. No external assets.

let ctx = null;
const getCtx = () => {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === "suspended") { try { ctx.resume(); } catch {} }
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

// === Short SFX ===
export const playTileClack = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(280, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(70, ac.currentTime + 0.18);
  g.gain.setValueAtTime(0.45, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.32);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 0.35);
};

export const playChi = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  [880, 1320, 1760].forEach((f, i) => {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, ac.currentTime + i * 0.04);
    g.gain.linearRampToValueAtTime(0.07, ac.currentTime + i * 0.04 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5 + i * 0.04);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + i * 0.04); o.stop(ac.currentTime + 0.6 + i * 0.04);
  });
};

export const playDing = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  [1320, 1980, 2640].forEach((f, i) => {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, ac.currentTime + i*0.03);
    g.gain.linearRampToValueAtTime(0.10, ac.currentTime + i*0.03 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5 + i*0.03);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + i*0.03); o.stop(ac.currentTime + 0.7 + i*0.03);
  });
};

export const playWrong = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  // descending dissonant bass
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sawtooth"; o.frequency.setValueAtTime(220, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.9);
  const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 600;
  g.gain.setValueAtTime(0.5, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.1);
  o.connect(filt); filt.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 1.2);
  // metallic shatter
  const buf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt2 = ac.createBiquadFilter(); filt2.type = "bandpass"; filt2.frequency.value = 1200; filt2.Q.value = 2;
  const g2 = ac.createGain(); g2.gain.value = 0.35;
  src.connect(filt2); filt2.connect(g2); g2.connect(ac.destination);
  src.start();
};

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

export const playUnlock = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sawtooth"; o.frequency.value = 110;
  g.gain.setValueAtTime(0.5, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.6);
  const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 800;
  o.connect(filt); filt.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 1.7);
  setTimeout(playChi, 220);
};

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

// === Per-biome unique ambient soundscapes ===

const ambientNodes = { active: null };
let eventTimer = null;

const makeChirp = (ac, freq, dur=0.08, vol=0.08, type="sine") => {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + dur + 0.05);
};

const makeWindGust = (ac, vol=0.06, dur=2) => {
  const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) { last = (last + 0.02*(Math.random()*2-1))/1.02; data[i] = last*3; }
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 700;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.3);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + dur);
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
};

const makeDrop = (ac) => {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(900, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.15);
  g.gain.setValueAtTime(0.06, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 0.25);
};

const makeWhale = (ac) => {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(80, ac.currentTime);
  o.frequency.linearRampToValueAtTime(120, ac.currentTime + 2);
  o.frequency.linearRampToValueAtTime(70, ac.currentTime + 4);
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.09, ac.currentTime + 0.5);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + 4);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 4.1);
};

const makeOwl = (ac) => {
  const o = ac.createOscillator(); const g = ac.createGain();
  o.type = "sine"; o.frequency.value = 220;
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.1);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);
  o.connect(g); g.connect(ac.destination);
  o.start(); o.stop(ac.currentTime + 0.45);
  // second hoot
  setTimeout(() => {
    const o2 = ac.createOscillator(); const g2 = ac.createGain();
    o2.type = "sine"; o2.frequency.value = 200;
    g2.gain.setValueAtTime(0, ac.currentTime);
    g2.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.1);
    g2.gain.linearRampToValueAtTime(0, ac.currentTime + 0.5);
    o2.connect(g2); g2.connect(ac.destination);
    o2.start(); o2.stop(ac.currentTime + 0.55);
  }, 600);
};

const makeRoar = (ac) => {
  const buf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) { last = (last + 0.04*(Math.random()*2-1))/1.04; data[i] = last*4; }
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 350;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.3);
  g.gain.linearRampToValueAtTime(0, ac.currentTime + 1.3);
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
};

const BIOME_PROFILES = {
  savanna: { freq: 800, pad: 196, events: ["cricket","cricket","roar","wind","bird"] },
  dunes:   { freq: 500, pad: 220, events: ["wind","wind","wind","scratch"] },
  canopy:  { freq: 400, pad: 165, events: ["bird","bird","drop","drop","monkey"] },
  peaks:   { freq: 320, pad: 110, events: ["wind","wind","eagle","bell"] },
  woods:   { freq: 520, pad: 147, events: ["owl","leaf","leaf","bird","wind"] },
  outback: { freq: 740, pad: 175, events: ["cricket","kookaburra","wind","didgeridoo"] },
  wastes:  { freq: 260, pad: 98,  events: ["wind","wind","penguin","crack"] },
  ocean:   { freq: 220, pad: 82,  events: ["bubble","whale","whale","bubble","sonar"] },
};

const triggerEvent = (ac, kind) => {
  switch (kind) {
    case "cricket": for (let i=0;i<3;i++) setTimeout(()=>makeChirp(ac, 3200+Math.random()*400, 0.04, 0.04), i*180); return;
    case "roar": makeRoar(ac); return;
    case "wind": makeWindGust(ac, 0.07, 2.5); return;
    case "bird": makeChirp(ac, 1800+Math.random()*1200, 0.18, 0.06, "triangle");
                 setTimeout(()=>makeChirp(ac, 2200+Math.random()*800, 0.12, 0.05, "triangle"), 250); return;
    case "drop": makeDrop(ac); setTimeout(()=>makeDrop(ac), 400+Math.random()*400); return;
    case "monkey": for (let i=0;i<4;i++) setTimeout(()=>makeChirp(ac, 600+Math.random()*200, 0.1, 0.06, "sawtooth"), i*150); return;
    case "eagle": makeChirp(ac, 1500, 0.4, 0.08, "sawtooth"); return;
    case "bell": makeChirp(ac, 660, 1.5, 0.05, "sine"); return;
    case "owl": makeOwl(ac); return;
    case "leaf": for (let i=0;i<8;i++) setTimeout(()=>{
                   const buf = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
                   const data = buf.getChannelData(0);
                   for (let j=0;j<data.length;j++) data[j] = (Math.random()*2-1)*0.5;
                   const src = ac.createBufferSource(); src.buffer = buf;
                   const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 4000;
                   const g = ac.createGain(); g.gain.value = 0.04;
                   src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
                 }, i*60); return;
    case "kookaburra": for (let i=0;i<6;i++) setTimeout(()=>makeChirp(ac, 1200-i*40, 0.07, 0.07, "sawtooth"), i*100); return;
    case "didgeridoo": const o = ac.createOscillator(); const g = ac.createGain();
                       o.type = "sawtooth"; o.frequency.value = 70;
                       g.gain.setValueAtTime(0, ac.currentTime);
                       g.gain.linearRampToValueAtTime(0.1, ac.currentTime + 0.2);
                       g.gain.linearRampToValueAtTime(0, ac.currentTime + 2.5);
                       const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 200;
                       o.connect(f); f.connect(g); g.connect(ac.destination);
                       o.start(); o.stop(ac.currentTime + 2.6); return;
    case "penguin": for (let i=0;i<3;i++) setTimeout(()=>makeChirp(ac, 500-i*30, 0.15, 0.06, "square"), i*200); return;
    case "crack": const b = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
                  const d = b.getChannelData(0);
                  for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*(1-i/d.length);
                  const s = ac.createBufferSource(); s.buffer = b;
                  const gg = ac.createGain(); gg.gain.value = 0.2;
                  s.connect(gg); gg.connect(ac.destination); s.start(); return;
    case "bubble": for (let i=0;i<5;i++) setTimeout(()=>{
                     const oo = ac.createOscillator(); const gg2 = ac.createGain();
                     oo.type = "sine"; oo.frequency.setValueAtTime(400+Math.random()*200, ac.currentTime);
                     oo.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.1);
                     gg2.gain.setValueAtTime(0.05, ac.currentTime);
                     gg2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
                     oo.connect(gg2); gg2.connect(ac.destination); oo.start(); oo.stop(ac.currentTime + 0.2);
                   }, i*120); return;
    case "whale": makeWhale(ac); return;
    case "sonar": makeChirp(ac, 1200, 0.3, 0.06, "sine"); return;
    case "scratch": const sb = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
                    const sd = sb.getChannelData(0);
                    for (let i=0;i<sd.length;i++) sd[i] = (Math.random()*2-1)*0.3;
                    const ss = ac.createBufferSource(); ss.buffer = sb;
                    const sf = ac.createBiquadFilter(); sf.type = "highpass"; sf.frequency.value = 3000;
                    const sg = ac.createGain(); sg.gain.value = 0.05;
                    ss.connect(sf); sf.connect(sg); sg.connect(ac.destination); ss.start(); return;
    default: return;
  }
};

export const startAmbient = (biome) => {
  stopAmbient();
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const profile = BIOME_PROFILES[biome] || BIOME_PROFILES.savanna;

  // Brown noise base
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
  filt.type = "lowpass"; filt.frequency.value = profile.freq;
  const ng = ac.createGain(); ng.gain.value = 0.035;
  noise.connect(filt); filt.connect(ng); ng.connect(ac.destination);

  // Pad
  const pad = ac.createOscillator();
  pad.type = "sine"; pad.frequency.value = profile.pad;
  const pg = ac.createGain(); pg.gain.value = 0.0;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ac.createGain(); lfoGain.gain.value = 0.035;
  lfo.connect(lfoGain); lfoGain.connect(pg.gain);
  pad.connect(pg); pg.connect(ac.destination);

  noise.start(); pad.start(); lfo.start();
  ambientNodes.active = { noise, pad, lfo, ng, pg };

  // schedule random biome events every 3-9 seconds
  const tick = () => {
    if (!ambientNodes.active) return;
    const acx = getCtx(); if (!acx) return;
    const ev = profile.events[Math.floor(Math.random() * profile.events.length)];
    try { triggerEvent(acx, ev); } catch {}
    eventTimer = setTimeout(tick, 2500 + Math.random() * 6000);
  };
  eventTimer = setTimeout(tick, 1500 + Math.random() * 2500);
};

export const stopAmbient = () => {
  if (eventTimer) { clearTimeout(eventTimer); eventTimer = null; }
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

// footstep sound for walking forward
export const playFootstep = () => {
  if (isMuted()) return;
  const ac = getCtx(); if (!ac) return;
  const buf = ac.createBuffer(1, ac.sampleRate * 0.08, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length) * 0.5;
  const src = ac.createBufferSource(); src.buffer = buf;
  const filt = ac.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 600;
  const g = ac.createGain(); g.gain.value = 0.06;
  src.connect(filt); filt.connect(g); g.connect(ac.destination);
  src.start();
};
