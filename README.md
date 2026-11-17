# Short-Video-Director

Vertical (1080x1920, 30 fps) hybrid 2.5D/3D cel-shaded explainer built with **Remotion + React Three Fiber**.

**Episode:** *350 Years of Rule, Lost in a Week* (the fall of the Dutch East Indies, 1–8 March 1942), 61.87 s.

| Doc | What |
|---|---|
| `docs/01-naskah-vo.md` | VO script (English) with SFX/BGM markers |
| `docs/02-storyboard.md` | Shot-by-shot storyboard (planned timing) |
| `docs/03-bgm-dan-subtitle-guide.md` | BGM duck/mute cues + subtitle safe zone (final timing) |

## Code map

| File | Role |
|---|---|
| `src/storyBeats.ts` | **Audio-driven beat map**: 36 `StoryBeat`s timed from the VO word timestamps, plus the SFX cue sheet and BGM guide |
| `src/Composition.tsx` | `Main`: picks the active beat, renders the set inside `<ThreeCanvas>`, overlays labels, plays VO + SFX, VO-driven lip-sync (`useAudioData` + `visualizeAudio`) |
| `src/ToonCharacter.tsx` | Procedural rig: white sphere head, capsule body, bendy `CatmullRomCurve3`+`TubeGeometry` limbs, pose library, step-swap face decal (`polygonOffset`), spring emotes, hand **sockets** for props |
| `src/CameraController.tsx` | Deterministic camera: pos/target moves, `Easing.out(Easing.cubic)` micro-zoom, whip, roll, shake |
| `src/SubtitleOverlay.tsx` | Optional word-synced captions (off by default) + subtitle safe zone |
| `src/ScreenText.tsx` | Kinetic labels (typewriter / stamp / label / counter) |
| `src/Lighting.tsx` | Emotional colour coding: `colonial_day`, `night_threat`, `danger_fire`, `explainer_studio`, `dawn_hope` |
| `src/lib/toon.tsx` | `MeshToonMaterial` + 2-step `NearestFilter` gradient, `<Outlines thickness={0.035} color="#111111" screenspace/>` |
| `src/sets/*` | The 23 sets (office, maps, Java Sea, beach, hangar, egg analogy, finale...) |
| `tools/align.py` | Forced alignment of the VO against the script (pocketsphinx) → `src/data/words.json` |
| `tools/sfx.py` | Procedural SFX stem, level-locked to 50 % of the voice → `public/sfx.wav` |
| `tools/stills.mjs` | Render a list of frames as stills (contact sheets) |

## Run

```bash
npm install
```

```bash
npm run studio
```

```bash
npm run render
```

In a CPU-only cloud container use `npm run render:cloud` (WebGL via `--gl=swangle`).

Note: in drei 10 `<Outlines>` reads `thickness` in **pixels** unless `screenspace` is set; with `screenspace` it is world units, so `0.035` = 3.5 cm ink lines.
