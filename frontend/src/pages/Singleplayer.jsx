import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchScholarRound } from "../lib/api";
import { getWikiImage } from "../lib/wikiImage";
import SaolaGuide from "../components/SaolaGuide";

const Singleplayer = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [images, setImages] = useState({});
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const loadRound = async () => {
    setPicked(null);
    const r = await fetchScholarRound();
    setRound(r);
    const imgs = {};
    await Promise.all(r.options.map(async (o) => { imgs[o.id] = await getWikiImage(o.wiki); }));
    setImages(imgs);
  };

  useEffect(() => { loadRound(); }, []);

  const handlePick = (id) => {
    if (picked) return;
    setPicked(id);
    const correct = id === round.correct_id;
    if (correct) {
      setScore((s) => s + 1);
      setTimeout(loadRound, 1400);
    } else {
      setGameOver(true);
    }
  };

  const reset = () => { setScore(0); setGameOver(false); loadRound(); };

  if (!round) return <div className="min-h-screen flex items-center justify-center text-[#FFD700] font-['Pirata_One'] text-2xl">Summoning a trial…</div>;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#2a1808,#06030a)" }} data-testid="singleplayer-page">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/games")} className="btn-wood" data-testid="sp-back">← Box</button>
          <div className="font-['Pirata_One'] text-3xl md:text-4xl text-[#FFD700]">Scholar's Trial</div>
          <div className="font-['Bebas_Neue'] text-2xl tracking-widest text-[#FFD700]" data-testid="sp-score">Streak: {score}</div>
        </div>

        <div className="parchment parchment-edge rounded-md p-6 md:p-10 unroll">
          <div className="text-center font-['Cinzel'] italic text-lg md:text-2xl text-[#2C241B] mb-6" data-testid="sp-fact">"{round.fact}"</div>
          <div className="text-center font-['Bebas_Neue'] tracking-widest text-[#5C5042] mb-6">Which creature is this true of?</div>
          <div className="grid grid-cols-2 gap-6">
            {round.options.map((o) => {
              const ok = picked && o.id === round.correct_id;
              const bad = picked && o.id === picked && picked !== round.correct_id;
              return (
                <button
                  key={o.id}
                  data-testid={`sp-option-${o.id}`}
                  onClick={() => handlePick(o.id)}
                  className={`wood-tile wood-tile-3 p-3 transition-all ${ok ? "chi-glow scale-105" : ""} ${bad ? "opacity-50" : ""}`}
                >
                  <div className="w-full aspect-square bg-black/30 rounded overflow-hidden mb-2">
                    {images[o.id] && <img src={images[o.id]} alt={o.name} className="w-full h-full object-cover pyrography" />}
                  </div>
                  <div className="font-['Pirata_One'] text-xl text-[#f4efe6] text-center">{o.name}</div>
                  <div className="text-center text-[#FFD700] text-sm">{"★".repeat(o.rarity)}</div>
                </button>
              );
            })}
          </div>

          {gameOver && (
            <div className="mt-6 text-center burn-in">
              <div className="font-['Luckiest_Guy'] text-4xl text-[#FF8C00]" style={{ textShadow: "2px 2px 0 #4a2308" }}>The Trial Ends</div>
              <div className="font-['Cinzel'] text-[#2C241B] mb-4">Your final streak: <b>{score}</b></div>
              <button onClick={reset} className="btn-chi" data-testid="sp-restart">Try Again</button>
            </div>
          )}
        </div>
      </div>
      <SaolaGuide context={`playing scholar's trial, streak ${score}`} />
    </div>
  );
};

export default Singleplayer;
