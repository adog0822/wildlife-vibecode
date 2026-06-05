import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";

import Home from "@/pages/Home";
import WorldMap from "@/pages/WorldMap";
import BiomeView from "@/pages/BiomeView";
import Loxedex from "@/pages/Loxedex";
import AnimalDetail from "@/pages/AnimalDetail";
import Games from "@/pages/Games";
import Singleplayer from "@/pages/Singleplayer";
import PokerLobby, { PokerGame } from "@/pages/Poker";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/biome/:key" element={<BiomeView />} />
          <Route path="/loxedex" element={<Loxedex />} />
          <Route path="/region/:region" element={<Loxedex />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/games" element={<Games />} />
          <Route path="/singleplayer" element={<Singleplayer />} />
          <Route path="/poker" element={<PokerLobby />} />
          <Route path="/poker/:code" element={<PokerGame />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
