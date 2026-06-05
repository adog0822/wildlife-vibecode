import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";

import Home from "@/pages/Home";
import WorldMap from "@/pages/WorldMap";
import BiomeView from "@/pages/BiomeView";
import Loxedex from "@/pages/Loxedex";
import AnimalDetail from "@/pages/AnimalDetail";
import Games from "@/pages/Games";
import Singleplayer from "@/pages/Singleplayer";
import PokerLobby, { PokerGame } from "@/pages/Poker";
import ScholarLeaderboard from "@/pages/ScholarLeaderboard";
import Analytics from "@/pages/Analytics";
import MuteToggle from "@/components/MuteToggle";
import { track } from "@/lib/track";

// Fires a page_view on every route change. Mounted inside BrowserRouter.
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    track("page_view");
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <RouteTracker />
        <MuteToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/biome/:key" element={<BiomeView />} />
          <Route path="/loxedex" element={<Loxedex />} />
          <Route path="/region/:region" element={<Loxedex />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/games" element={<Games />} />
          <Route path="/singleplayer" element={<Singleplayer />} />
          <Route path="/scholar/leaderboard" element={<ScholarLeaderboard />} />
          <Route path="/poker" element={<PokerLobby />} />
          <Route path="/poker/:code" element={<PokerGame />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
