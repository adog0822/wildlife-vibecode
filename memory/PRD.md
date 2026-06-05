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

## Iteration 3 (2026-02-05 — Explore + Polish)
- ✅ **GeoGuessr-style biome exploration**: BiomeView replaced with a 4800px-wide horizontal scene; user drag-pans across; ~15-20 hidden glowing hotspots per biome; tap a hotspot to reveal animal with parchment card; minimap at bottom; idle wildlife flyers (birds, butterflies, fish) crossing the scene; parallax background layers; per-biome ambient soundscape resumes on entry, stops on exit
- ✅ **Eclipse spirit tile**: backend `arm_eclipse` flow; armed flag visible to all players (☽ badge); next challenge against that player is blocked + tile stays face-down forever
- ✅ **Mute toggle**: floating speaker icon top-left, persists choice in localStorage, stops/restarts ambient
- ✅ **Mobile Poker**: hand becomes horizontal-scroll on mobile, header text scales, harmony meter shrinks, board tiles horizontal-scroll
- ✅ **Daily Quest System**: "The Saola's Daily Prophecy" — seeded by date, picks an undiscovered 4-5★ animal, displays hint banner on Home, auto-marks complete when that animal is unlocked
- ✅ **Shareable Discovery Card**: html-to-image generates PNG of the unlocked animal page (4★+); web-share API for mobile, falls back to download

## Iteration 4 (2026-02-05 — Depth + Sound + Playability)
- ✅ **2D explorable biomes** (6400×2400 scenes) with drag-pan in both axes, scroll/WASD/buttons to "step forward/backward" (zoom 75–220%), pinch-zoom on touch, footstep SFX
- ✅ **Per-biome unique wildlife sprites**: savanna lions+grass, dunes scorpions+dust devils, canopy butterflies+monkeys+falling leaves, peaks eagles+yaks+snow, woods owls+deer+fireflies, outback kangaroos hopping+bird, wastes penguins+aurora+50 snowflakes, ocean fish+jellyfish+shark
- ✅ **Per-biome animated reveal styles**: walk-left (savanna), rise-from-sand (dunes), swing-down (canopy), fade-from-snow (peaks), step-from-trees (woods), hop-in (outback), waddle-in (wastes), swim-in (ocean)
- ✅ **Per-biome unique soundscapes**: brown-noise base + biome-specific filter + LFO pad + random event generator (crickets+roars for savanna, drops+monkey calls for canopy, whales+bubbles for ocean, owls+leaf rustles for woods, kookaburras+didgeridoo drone for outback, etc.) firing every 3-9s
- ✅ **Singleplayer**: `playDing` on correct (with Saola lantern flare), dramatic `playWrong` + red flash + shake + delayed game-over reveal; personal best tracked in localStorage; "Records" link to leaderboard
- ✅ **Scholar's Leaderboard page** at `/scholar/leaderboard` — top 10 trials with timestamps, personal best big display
- ✅ **Eclipse spirit tile** visual: chi-eclipse SVG ring renders on board tiles (dark center + gold ring pulse)
- ✅ **Poker lobby revamp**: big room code display, COPY CODE / COPY LINK with web-share fallback, "2-8 players" instructions, player pill list, "Need at least 2" guidance, Start only enabled with ≥2 players
- ✅ **Mobile-tuned hotspot tap radius**: 44px+ on mobile widths (<640px) per accessibility guidelines

## Iteration 5 (2026-02-05 — Biome Exploration Polish)
- ✅ **Pokémon-style WASD walk + on-screen D-pad** with smooth lerp/easing camera (0.12 EASE factor, 18px/frame walk speed) — feels like walking through the biome
- ✅ **Crisp sharp backdrops** at 3840px res, removed blur filters; mid-layer is sharp multiply blend for depth without losing focus
- ✅ **Silhouette-to-photo morph hotspots** — each hotspot shows the REAL Wikipedia animal photo as a black silhouette by default (CSS filter: brightness 0.05, saturate 0, contrast 2), morphs to full-color photo on hover via 0.45s tween
- ✅ **NatGeo SafariWildlife component** — biome-specific real animal photos cross the scene in loop (lions/zebras/giraffes on savanna, dolphins/whales swimming in ocean, kangaroos hopping in outback, penguins waddling in wastes, condors flying over peaks)
- ✅ **Clickable minimap** — click anywhere on the minimap to jump camera there
- ✅ **All hotspots reachable** — initial camera centered, full 8000×3000 scene navigable in all 4 directions
- ✅ Fixed `navigator.share` AbortError silently ignored on user-cancel (Animal Detail share + Poker copy-link)
- ✅ Poker: Always-visible Start button (disabled w/ player-count message), live join-pop animation + chi sound on join, ROLE banner (Warden vs Saboteur), HOW TO WIN cheat-sheet in lobby
