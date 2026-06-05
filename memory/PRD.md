# LoxeLife — PRD

## Vision
LoxeLife is an immersive, cinematic wildlife discovery + tactical strategy app.
A "Kung Fu Panda × Madagascar" inspired ancient explorer's journal with:
- 200+ animal Pokedex-style "Loxedex"
- Interactive world atlas with 8 biomes
- Cinematic immersive biome scenes
- Single & multiplayer game modes
- A Saola AI guide (Claude Sonnet 4.5)

## User Persona
"The scholar at the desk" — a curious explorer-player who wants to discover the planet's biodiversity,
test their knowledge in trials, and bluff their way through cocktail-party multiplayer.

## Core Requirements (static)
- 200+ animals with real photos (Wikipedia Commons)
- 8 biomes (savanna, dunes, canopy, peaks, woods, outback, wastes, ocean)
- Rumor/discovery system: 3–5★ animals appear as charcoal sketches until clicked
- Singleplayer Scholar's Trial: 2-animal fact quiz
- Multiplayer Ecosystem Poker: WebSocket rooms, bluff/challenge mechanic
- Saola AI guide chat (LLM-powered)
- Local browser progress (no auth in v1)

## Architecture
- **Backend**: FastAPI + MongoDB + WebSockets, animals dataset in `animals_data.py`
- **LLM**: emergentintegrations → Claude Sonnet 4.5 via EMERGENT_LLM_KEY (streaming)
- **Frontend**: React 19 + react-router 7, Tailwind + custom CSS
- **Images**: Wikipedia REST `/page/summary/{title}` cached in localStorage
- **State**: localStorage for unlocked animals + player name + WS player_id

## Implemented (2026-02-05)
- ✅ Backend: 203 animals across 8 biomes, /api/animals, /api/animals/:id, /api/regions, /api/scholar/round, /api/poker/create, /api/saola/chat (streaming Claude), WS /api/ws/poker/:code
- ✅ Home "desk" with three Vol I/II/III entry cards + drifting embers + dynamic time label
- ✅ Loxedex parchment book with Volumen Mundi cartouche, corner ornaments, rarity filter, show-all toggle, discovery counter
- ✅ World Atlas: parchment map with painted continents, compass rose, "HIC SVNT DRACONES" sea-monster border, glowing biome nodes
- ✅ Immersive BiomeView for all 8 biomes: full-screen vivid backdrop + atmospheric particles + cinematic vignette + floating animal spirit cards
- ✅ Animal detail page with stats bars (Trophic, Stealth, Impact, Invasive, Survivability) + Field Notes
- ✅ Singleplayer Scholar's Trial: streak-based, two animals + fact
- ✅ Multiplayer Ecosystem Poker: lobby + WS game flow with face-down tile play, claim, 10s challenge window, resolve, harmony meter, saboteur assignment, Mimic spirit tile, multi-round, win conditions
- ✅ Saola guide overlay on every page with floating SVG character + streaming Claude chat panel

## Backlog (P1)
- Continent label refinement on S. America (slight overlap with biome nodes)
- 3D rotating globe instead of 2D atlas (deferred from v1)
- Sound effects: tile clack, parchment unroll, chi shimmer
- More spirit tiles (Oracle, Scavenger, Eclipse, Parasite) in multiplayer
- Camera-style page transitions (book-flip / map-unroll animation between screens)
- Saola animations: chin-strokes during bad plays, lantern flare for 5★ unlocks
- Singleplayer difficulty curve & lives
- Multiplayer: spectator-only host view, mobile player view split
- Animal search bar in Loxedex
- Discovery achievements/badges

## Backlog (P2)
- 3D wooden tile rendering with Three.js
- Day/night dynamic lighting tuned per biome
- Audio: ambient biome soundscapes (savanna crickets, rainforest rain, etc.)
- Shareable Loxedex completion cards
- Localization
