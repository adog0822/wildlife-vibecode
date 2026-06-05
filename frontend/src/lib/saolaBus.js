// Saola "mood" event bus — pages can broadcast moods (chinStroke, lanternFlare, wideEyes)
// and SaolaGuide listens.
const listeners = new Set();
let currentMood = "default";

export const setSaolaMood = (mood, durationMs = 1800) => {
  currentMood = mood;
  listeners.forEach((cb) => cb(mood));
  if (mood !== "default") {
    setTimeout(() => {
      currentMood = "default";
      listeners.forEach((cb) => cb("default"));
    }, durationMs);
  }
};

export const onSaolaMood = (cb) => {
  listeners.add(cb);
  cb(currentMood);
  return () => listeners.delete(cb);
};
