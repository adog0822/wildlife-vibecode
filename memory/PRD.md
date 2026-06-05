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

## Iteration 6 (2026-02-05 — Final Polish: Day/Night + Photo Mode + Animal Calls + Expanded Wildlife)
- ✅ **Day/Night toggle** in biome header (☀/☾ button) — applies blue moonlight overlay or warm sun tint, dims wildlife silhouettes at night with hue-rotate. Press N or click toggle.
- ✅ **Photo Mode** (📸 button or P key) — hides ALL UI overlay (header, D-pad, zoom, minimap, Saola, counter), wraps viewport in white polaroid frame, shows CAPTURE + EXIT (ESC) buttons. CAPTURE uses html-to-image to save PNG to disk + Field Journal (last 12 photos in localStorage).
- ✅ **Animal call SFX on hover** — `playAnimalCall(animal)` triggers species-appropriate call: whale moans for cetaceans, lion roar for big cats, owl hoots for owls, kookaburra laugh for kookaburra, monkey howls for primates, frog croaks, elephant trumpet, eagle screech, bird chirps as default
- ✅ **Expanded NatGeo wildlife rosters** — 7-10 unique cropped animal photos cross each biome scene (was 2-4): Savanna now has lions/zebras/warthogs/giraffes/elephants/cheetahs/meerkats/wildebeest/hyenas/wild dogs; Ocean has dolphins/whales/manta rays/blue whales/great whites/whale sharks/orcas/leatherback turtles
- ✅ Fixed `snapPhoto` reference scoping bug

## Deferred to Future
- AI-generated painterly biome backgrounds via Gemini Nano Banana (requires backend image-gen pipeline + storage)
- Public multiplayer Sanctuary leaderboard (Mongo collection + endpoint)


## Iteration 7 (2026-02-05 — AI Painterly Backgrounds Wired In)
- ✅ **AI-generated painterly biome backgrounds** via Gemini Nano Banana (backend pipeline + static cache at `/app/backend/static/biome_bg/{biome}.png`)
- ✅ Fixed React crash `bgUrl is not defined` in `BiomeView.jsx` — resolved layered backgrounds (AI painterly as far layer, Unsplash photo as mid multiply-blend overlay)
- ✅ Smoke-tested `/biome/savanna` — renders cleanly with AI background, hotspots, D-pad, minimap, header

## Iteration 8 (2026-02-05 — Saola Chat Verified + Cinematic Biome Atmosphere)
- ✅ **Saola Chat (Claude Sonnet 4.5)** end-to-end pipeline verified — `/api/saola/chat` SSE stream → `saolaStream` reader → `SaolaGuide.jsx` panel. Currently blocked **only by Universal Key budget exhaustion** (0.57 / 0.4); user must top up. In-character fallback message added so the experience stays magical when budget is low.
- ✅ **Cinematic atmosphere layering in BiomeView** (no LLM cost, pure CSS):
  - Distant accent halo (radial screen-blend)
  - Stronger color grading (saturation 1.45, contrast 1.18) with hue-rotate at night
  - Soft-light biome accent wash (warmth/coolness without crushing the painterly art)
  - Volumetric god rays — two animated diagonal beams sway 9s/13s
  - Slow-drifting haze band at the horizon (40s linear loop)
  - Stronger fog gradient bottom + radial vignette (95% / 80% ellipse)
  - SVG fractal-noise film grain overlay (12% opacity, overlay blend)
- ✅ Mid Unsplash overlay opacity dropped to 0.14 (from 0.22) when AI bg present — lets painterly art shine through
- ✅ Smoke-tested savanna (golden hour) + ocean (deep blue painterly) — both render with cinematic depth

## Iteration 9 (2026-02-05 — Universal Key Topped Up + Poker Post-Lobby Polish)
- ✅ **Saola Chat LIVE** — user topped up Universal Key. Verified via curl + frontend (testing agent iter1): real Claude Sonnet 4.5 streamed in-character responses ("*taps bamboo staff thoughtfully* The savanna is a golden-grass stage…").
- ✅ **Ecosystem Poker post-lobby polish (light)**:
  - `RESULT_META` mapping → readable result chips (TRUTHFUL / EXPOSED LIE / PASSED · TRUE / PASSED · LIE / PARASITE DRAIN / ORACLE SIGHT) with themed colors + icons
  - Board tiles now animate in with framer-motion `rotateY/scale` flip + colored box-shadow halo matching result type (e.g., red glow on EXPOSED LIE, gold on ORACLE SIGHT)
  - New "⟁ YOUR TURN — pick a tile & slide it face-down ⟁" pulse banner shows for the active player during `playing` state
- ✅ Testing agent verified backend + frontend 100% pass. Backend pytest at `/app/backend/tests/test_saola_chat.py`.

## Iteration 10 (2026-02-05 — Madagascar × NatGeo Biome Rebuild + Global Leaderboard)
- ✅ **All 8 biome backgrounds REGENERATED** with a brand-new prompt: "mid-to-far landscape, NO foreground objects, bold cel-shaded illustration with thick black ink outlines, deep saturated palette, Madagascar movie style × National Geographic cinematic lighting, lower-third empty". Updated system_message to match. Result: bold ink-outlined cel-shaded art with empty lower-third (no more dominating painted trees/branches crowding the view).
- ✅ **Per-biome SVG foreground silhouette parallax layer** (`FG_SVG_STR` in BiomeView.jsx) — tiled 1600px-wide cel-shaded silhouettes anchored at viewport bottom, parallax 1.0× (vs bg 0.35×) for true diorama depth. Each biome gets unique shapes:
  - savanna: rolling hills + grass tufts
  - dunes: layered dune ridges
  - canopy: jungle treeline + ferns
  - peaks: jet-black mountain silhouettes
  - woods: birch trunks + leaf litter
  - outback: red ground + spinifex
  - wastes: ice ridges + crystals
  - ocean: sand floor + coral/kelp
- ✅ **Scholar's Trial Global Leaderboard** — Mongo-backed `db.leaderboard` collection, auto-seeded on first GET with 10 mythic scholars (Charles D./Jane G./David A./Sir Lonesome/Audubon/Tashi/Captain Calypso/Saola Apprentice/Field Cadet/Curious Scholar).
  - `GET /api/leaderboard?limit=N` returns top-N sorted by score desc
  - `POST /api/leaderboard` records a new submission and returns the new top-10
  - Frontend `/scholar/leaderboard` page shows the "SANCTUARY HALL OF SCHOLARS" parchment card above personal records, with medals (🥇🥈🥉) and biome tags
  - Singleplayer auto-submits the player's streak on game-over
- ✅ Testing agent iter2: 100% backend (10/10 pytest pass), 100% frontend. Found+fixed ObjectId serialization bug in POST /api/leaderboard. New regression suite at `/app/backend/tests/test_leaderboard.py`.


## Pending / Next Up
- 🟡 Field Journalist Missions (LLM photo prompts in Photo Mode) — **deferred at user's request**
- 🧹 Refactor `Poker.jsx` (~382 lines) and `server.py` (~590 lines: split poker logic to `poker.py`)
- 🚀 User intends to publish/deploy with remaining 50 credits