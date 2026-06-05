import React from "react";
import { useNavigate } from "react-router-dom";
import SaolaGuide from "../components/SaolaGuide";

const Games = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, #2a1808 0%, #0a0402 100%)" }} data-testid="games-page">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/")} className="btn-wood mb-6" data-testid="games-back">← Desk</button>
        <div className="text-center mb-10">
          <div className="font-['Pirata_One'] text-5xl md:text-6xl text-[#FFD700]" style={{ textShadow: "0 0 20px rgba(255,140,0,0.7)" }}>The Carved Box</div>
          <div className="font-['Cinzel'] italic text-[#f4efe6]/70 mt-1">Choose your trial. Choose your fate.</div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <button onClick={() => navigate("/singleplayer")} data-testid="goto-scholar" className="wood-tile wood-tile-3 p-8 text-left transition-transform hover:-translate-y-2">
            <div className="font-['Luckiest_Guy'] text-3xl text-[#FFD700]" style={{ textShadow: "2px 2px 0 #4a2308" }}>The Scholar's Trial</div>
            <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]/70 mt-1">SINGLEPLAYER · QUICK PLAY</div>
            <div className="font-['Cinzel'] text-[#f4efe6]/90 mt-4">Two animals appear. One fact rings true. Pick the right creature, or your journey ends.</div>
            <div className="mt-6 inline-block btn-chi">Begin Trial →</div>
          </button>
          <button onClick={() => navigate("/poker")} data-testid="goto-poker" className="wood-tile wood-tile-5 p-8 text-left transition-transform hover:-translate-y-2">
            <div className="font-['Luckiest_Guy'] text-3xl text-[#FFD700] glow-pulse" style={{ textShadow: "2px 2px 0 #4a2308" }}>Ecosystem Poker</div>
            <div className="font-['Bebas_Neue'] tracking-widest text-sm text-[#f4efe6]/70 mt-1">MULTIPLAYER · 2–8 PLAYERS</div>
            <div className="font-['Cinzel'] text-[#f4efe6]/90 mt-4">Bluff. Challenge. Saboteur lurks among the Wardens. Protect the biome — or watch it burn.</div>
            <div className="mt-6 inline-block btn-chi">Open Lobby →</div>
          </button>
        </div>
      </div>
      <SaolaGuide context="user is in the games box" />
    </div>
  );
};

export default Games;
