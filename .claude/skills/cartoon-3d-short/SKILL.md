---
name: cartoon-3d-short
description: Make a ~55-70 s vertical short for a serious Islamic series (Islamic history, sirah context, the lives of ordinary believers, Islamic civilisation and science) in the "2D characters in a colourful 3D world" style. Flat bean-head cartoon cards with ink outlines sit in a painted 3D world with black ink lines, depth of field and gliding cameras, with calm narration and a sound bed without comedy. The 3D world, camera and lighting are three.js; HyperFrames assembles, edits, finishes and renders. Use for any episode of the Islamic series, "an Islamic story short", "in that cartoon 3D style", or "use the cartoon short skill".
---

# Islamic series short: cartoon cards in a 3D world (three.js + HyperFrames)

This is a respectful series about Islam, from its history to its knowledge (ilmu), made easy to digest for a young audience. The narration talks like a friend telling you a story over coffee ("ngobrol santai"), not like a lecture. The content stays respectful: no slapstick, no "funny" props, no mocking characters and no punchlines at anyone's expense.

## Language register: casual storytelling, not gossip (agreed with the user)
- The register is "santai/akrab" (relaxed, between friends), as defined by the `bahasa-inti` skill. Write and check every Indonesian script with `bahasa-inti` at register `santai` (run `scripts/periksa.py --ragam santai`).
- Allowed: short sentences, direct address ("kamu"), conversational words (*nggak, banget, gimana, sih, dong, jadi gini*), questions to the viewer ("Tau nggak sih …?"), and a warm, curious tone. Spelling is still correct; conversational is not careless.
- Gossip-style openers are allowed only as framing for a true, sourced fact ("Eh, tau nggak sih, ada satu kota yang …"). The content is never gossip:
  - No ghibah. Never dwell on anyone's faults, private life or scandals, historical or living.
  - Never use a gossip tone about the prophets, the Prophet's family or the companions. Never "spill the tea" about the disputes between companions (the fitnah era). Leave those topics out of this series.
  - No "katanya …" (hearsay). Every story must have a source in the facts block; a weak narration is not told as true.
- Sacred names are never slang. Say "Allah", "Nabi Muhammad ﷺ" (spoken "shallallahu 'alaihi wa sallam" or "sallallahu alaihi wasallam" per series), "Nabi Musa 'alaihissalam" and so on, never a nickname or a joke name.
- The register shifts when the sacred appears: the ayah or hadith in the Reflection beat is said slowly and seriously, then the narrator returns to the casual tone for the Lesson.
- Use `ansari` to look up and cross-check sources while researching. Its answers are an aid, not a fatwa; they still go into the facts block with the original reference and through the ustadz review.

Technical base: the look engine from the original "bridge" short (`templates/bridge/`). Only its look values and code are reused; its comedic script formula is retired. The study material in `references/` is for the look only.
- The reference frames are private study material. Never upload, publish or send them, and never copy their scripts, characters or shots.
- Never say the reference channel's name anywhere.

## Adab and accuracy rules (these override everything else in this file)
**Never depict as a figure, face, silhouette, card or body:**
- Allah, in any form, and no symbol standing in for Him.
- Any prophet or messenger, e.g. Muhammad ﷺ, Ibrahim, Musa, 'Isa, Yusuf or Nuh (peace be upon them).
- The Prophet's wives and his family (Ahl al-Bayt).
- The companions (sahabah). This is the conservative default, and it covers the four caliphs, the ten promised Paradise and every named companion.
- Angels as figures. An angel is shown ONLY as light (a shaft, a glow, a brightening of the scene) that never takes a human or winged shape.
- The jinn and Iblis as figures. They are shown ONLY as fire or smoke-tinged flame with no face, eyes or body.

Show the prophets, their family and the companions through their presence instead:
- Warm light falling into a room, an empty spot in a row, an open door, a camel led by a rope whose holder stays out of frame.
- Footprints in sand, a staff, a shadow that never resolves into a body, the reactions of ordinary people, or a point-of-view camera.
- Never a glowing human outline. That is still a depiction.

**Who may be a character card, WITH a face (decided by the user):** everyone not in the list above. That means ordinary people (a merchant, a traveller, a student, a farmer), and historical figures who are not prophets, the Prophet's family or companions (later scholars, rulers, builders, scientists, e.g. al-Khwarizmi, Ibn Sina, Salahuddin, Walisongo). Their look follows historical sources: period clothing, region and age from the history books and the reference board (`docs/04-referensi-karakter.md`), never a modern guess.
- Characters dress modestly and plausibly for their period. Women wear hijab and loose clothing. No exposed awrah.
- No romance scenes, no music-playing characters and no alcohol.
- Expressions are dignified. Grief, awe, gratitude, determination and concentration are fine. Laughing is not, and neither are mocking faces, smug faces or exaggerated gags.

**Sacred things:**
- Draw the Ka'bah, Masjid al-Haram and Masjid an-Nabawi accurately for the period shown, or not at all. Never use them as a backdrop gag, and never let a camera "fly through" the Ka'bah.
- Show Qur'an text only as correct Arabic: right to left, properly shaped (pre-render it as an image with a shaping-aware renderer; Canvas2D `fillText` may break the joins), and with no letter, vowel mark or word missing.
- Never put Qur'an or Allah's name on floors, feet, shoes, rubbish or anything that gets stepped on, torn or burned on screen.
- Never animate Qur'an text with bouncy or playful effects. A slow fade or light is fine.

**Sources:**
- Every claim comes from the Qur'an (surah:ayah), an authentic hadith (collection + number + grade, e.g. Sahih al-Bukhari 1, sahih), or a recognised history (al-Tabari, Ibn Kathir's al-Bidayah, Ibn Hisham's Sirah, or a modern academic source).
- Write each one into the facts block of `SCRIPT.md`.
- Do not present a weak (da'if) or fabricated (mawdu') narration as fact. If a famous story is weak, say so or leave it out.
- If the scholars disagree on a point, say "according to …" or choose another story.
- Translations of the Qur'an are marked as the meaning ("which means …"), never as the Qur'an itself. Name the translation used, e.g. Sahih International.
- Honorifics: say "peace be upon him" after the Prophet's name every time, and write ﷺ in the script. Say "peace be upon him" after the other prophets too. "May Allah be pleased with him/her" for companions is optional, set per series.
- Before publishing, the script must be reviewed by a qualified teacher (ustadz). The skill marks every script `REVIEW: pending` until the user confirms the review.

**Sound:**
- No musical instruments by default: no march, drums, strings or synth melody. This follows the many scholars who disallow instruments and the audience who expects it.
- The default bed is a quiet ambient tone (wind, room tone, desert air, a city murmur) plus diegetic SFX.
- Voice-only nasheed-style humming or a soft drone is allowed only if the user chooses it. Ask once at intake.
- A Qur'an recitation clip is never cut mid-ayah, never time-stretched or pitch-shifted, and never has music or SFX under it. Duck the bed to silence for it. Use a recitation clip only if its licence allows it.
- The adhan is never used as a sound effect or a transition sting.

## Series rules
- No captions or labels on screen, except correct diegetic text and an optional Qur'an verse reference card.
- The voice-over language is set per series at intake (English or Bahasa Indonesia). Arabic terms keep a consistent transliteration.
- Voice: one warm, relaxed, storytelling tone, like talking to a friend. ~3.0-3.5 words/s, slowing down with breathing room around an ayah or hadith.
- Standard mix (no instruments): voice unchanged, ambient bed -18 dB under the voice, SFX -8 dB with peaks capped. If the user picks the vocal nasheed or drone bed, it sits at -12 dB, and the duck goes to full silence under any recitation.
- Final export 2K vertical: 1440x2560.
- Verify every look check with an agent, and save after every step.
- "Just do it" applies only once the script is approved AND marked as reviewed.

## Script formula (replaces the old comedic formula)
~3.0-3.5 words/s, 55-75 s, 170-240 words.
1. **Hook (sentence 1).** A striking, true fact asked or told casually, with no exaggeration. Example shape: "Tau nggak sih, ada satu kota yang selama ratusan tahun nerjemahin hampir semua buku yang bisa mereka temuin?"
2. **Setting.** Year (Hijri and CE), place and the people involved, described with concrete true details.
3. **Story, in 3-4 rising beats.** What happened, each beat a little more significant. The beats rise in stakes or meaning, never in silliness.
4. **Turning point.** The decisive moment: a choice, a test, a revelation, a loss or a victory.
5. **Reflection.** One ayah or authentic hadith that speaks to it, quoted by meaning with its reference.
   - If a concept needs explaining (a law of inheritance, how a qanat brings water), use one plain everyday analogy. It is respectful, not cute.
6. **Lesson (ibrah).** What it teaches a believer today, in 1-2 sentences. Not preachy, and never a punchline.
7. **Closing.** A calm last line that echoes the hook, or a short du'a or reminder. The video ends on the last word, with no CTA.

Never describe on screen what the viewer already sees. Retired beats from the old formula, never to be used: "Luckily / Unluckily", "these guys think it's hilarious", ironic twists, exaggeration jokes, characters laughing at or mocking someone, and "props that carry the joke".

## Pipeline
**Who owns what:**
- **three.js** owns the 3D world, the camera and the lighting. These are code that runs inside the frame (`story.ts`, `lights.ts`, `world.ts`). No editor can relight a three.js scene from outside.
- **HyperFrames** owns the timeline and edit (shot order, crossfades, holds), the finishing (registry transitions, light leaks, colour grade per beat, the verse card, film look), the audio placement and mix, and the final render.

**Two ways to wire it**, decided once per series and recorded in `SCRIPT.md`:
- **A. Hybrid (default, lower risk).** The existing Remotion + three.js project renders each shot as a clean ProRes or PNG sequence (`out/<name>/shots/<id>.mov`). A HyperFrames project in `hf/<name>/` places those shots on the timeline, adds transitions, grade, light, the verse card and audio, then renders the final file.
  - Camera moves and lighting changes are made in `story.ts` and `lights.ts`, then the affected shots are re-rendered.
  - HyperFrames camera blocks (push-in, drift) may add a 2D reframe on top.
- **B. Full port.** Use `/remotion-to-hyperframes` to move the three.js scene into a HyperFrames composition. The scene draws from `e.detail.time` in an `hf-seek` listener (see `hyperframes/references/runtimes.md`), so camera and light keys run on the HyperFrames timeline directly.
  - This is more work, and it must be verified frame by frame against the Remotion render first.

**Steps:**
1. **Intake.** Ask once for:
   - the topic or the story;
   - the language (EN/ID);
   - the sound bed (ambient only, which is the default, or the vocal nasheed/drone);
   - whether companions may be shown (default no);
   - wiring A or B, if not yet set for the series.
2. **Topic and sources.** Choose one true, well-sourced story that can be shown without depicting forbidden figures.
   - Plan how each beat is shown before writing (presence, POV, ordinary people, places, objects).
   - Write the facts block with full references at the top of `SCRIPT.md`.
3. **Script** with the formula above. Add `REVIEW: pending` at the top.
   - Present it to the user and wait for approval plus the review confirmation.
4. **Voice.** Record or generate `voice.wav` (`/media-use` for TTS or a transcript), then make the word timings `words.json` and hand-fix them. Everything is timed to `words.json`.
5. **Shot plan** in `story.ts`: copy `templates/bridge/` to `src/videos/<name>/`, register a new composition in `src/Root.tsx`, and rename it.
   - `SHOTS`, `XFADE`, `CAMS`, `DOF`/`dofAt` and `FOREGROUND` are as described in "Final look values".
   - Use `KICKS` (impact shakes) only for a real physical impact in the story (a wall falling, a battle), never for emphasis or comedy.
   - Replace `FLASH_AT` with a soft light bloom or a 6-8 frame dissolve after the hook.
   - Every visual reaction lands 0-3 frames before its word.
   - **Depiction check per shot:** list who is in frame. Any forbidden figure → re-plan the shot.
6. **World.** Same files as before (`lights.ts`, `shade.ts`, `build.ts`, `paint.ts`, `world.ts`).
   - The settings are Islamic and period-correct: mud-brick and palm-trunk Madinah, desert caravans, Andalusian courtyards, Baghdad markets, Ottoman domes, Nusantara mosques with tiered roofs.
   - No flags or symbols from the wrong period.
7. **Characters** (`toon.ts`, `cast.ts`, `cardshade.ts`). Only allowed people, modestly dressed.
   - Remove or never use the laugh, smug and gag faces from the face library.
   - Beards, turbans, keffiyeh, hijab and thobes must fit the period and region.
8. **3D post** (`Bridge.tsx` + `ink.ts` + `lensblur.ts` + `grade.ts`) is unchanged.
   - Composer order: ink → lens pre → lens main → bloom → NEUTRAL tone map → grade (MSAA 4).
   - Every pixel parameter scales with output height / 1920.
9. **Sound** (`templates/audio/`: `timeline.py`, `sfx_gen.py`, `sfx.py`, `mix.py`, `dsp.py`).
   - The event table gives synthesized diegetic SFX plus an ambient bed. `music.py` and `instruments.py` are NOT used unless the user picks the drone or nasheed bed. The march score is retired.
   - With wiring A, HyperFrames places the voice, bed and SFX as `<audio>` (`hyperframes/references/sound.md`). `mix.py` checks the levels.
   - Lock the picture's time constants before the sound is made.
10. **Look checks.** `node scripts/bridge-stills.mjs out/<name>/x_ 100,400 0.5` gives the 3D stills, and `hyperframes` snapshot or review gives the edited frames. Side-by-sides go to a verifier agent: 1-3 images and a ≤200-word verdict.
    - The verifier also checks adab: no forbidden figure, correct Arabic, modest dress, no comedy.
11. **Final render.**
    - Wiring A: render the shots from Remotion (`--scale 1.3333`, ProRes or `--crf 12`), then do the final render in HyperFrames at 1440x2560 (`/hyperframes-cli` render).
    - Wiring B: render HyperFrames directly.
    - QA: `python scripts/short_qa.py final.mp4 out/<name>/qa shots.json` checks every frame for black, white, frozen and pop frames, plus loudness. Fix anything it finds.
12. **Deliver.** SendUserFile the final mp4, together with the sources list and the reviewed-script note.

## Final look values (bridge after 4 verifier rounds; all in `templates/bridge/`)
Start every new short from `templates/bridge/` (copy to `src/videos/<name>/`): the look lives in these values, the
story lives in story.ts / build.ts layout / cast.ts roles. Opus max scores at the end: colour day 7, golden 5-6,
lighting 5-6, ink 6, textures 5-6, characters 7, depth 6-7, composition 6-7 (from 5/3/4/5/4/7/4/6 at the start).
- **Light presets** (`lights.ts`, sun camera-relative and frozen per shot):
  - day: az 75 / el 48, lit [1.58,1.5,1.33], shade [.30,.29,.36], lift [.05,.06,.11] (cool tint ONLY in shade), sky
    top #3e7fd2 → horizon #b8d0ec, fog = horizon, 25→300 m, uSat 1.08, ~15 % blue haze past 60 m.
  - golden: az 6 / el 7 (backlit low sun), key toward #FFB36B ×1.5, violet-blue shade (facade ≈ #444380), sky
    #ffc47c → #8a6f8a, peach fog only past 50 m, sun disc #ffcf9e + bloom, contact blobs + real card shadows.
- **Albedos** (`paint.ts`/`build.ts`): muted brick / cream / ochre / terracotta houses with plinth, cornice, sills,
  hoods, door step, chimney + pot, heights 7 / 8.4 / 9.8 m; warm grey/beige stone (saturation −35 % from "storybook");
  ochre wood deck C* ~51-58 with near-black seams; iron dark and desaturated. Never lemon, never lavender lit faces.
- **Ink** (`ink.ts`): #030303, 5.1 px near (6 m) → 3.3 px far (90 m) at 1080x1920, creases ×0.8 from 35°, depth
  jumps from 1 %, fog tint 0.3 only far; character cards on layer `NOINK` (they carry their own plum ink).
- **Lens** (`lensblur.ts` + `dofAt` in story.ts): cInf px at 1080: hook/river CU 15-16, close-ups 12-14, MS 10-12,
  park 7, golden sway 5, wides/aerials 0. Focus on the eyes of the front row.
- **Post** (`Bridge.tsx`): ink → lens pre → lens main → bloom (thr 1.0, int .5, 6 levels, radius .6) → NEUTRAL tone
  map → grade; MSAA 4. Film grain exists but is OFF (reference measures no grain; it quadruples the file size).
- **Characters** (`toon.ts`/`cast.ts`/`cardshade.ts`): bean heads h/w .94, plum ink #241726, eyes .26 W apart, no blush,
  14 expressions; adults 3.5 head-heights; walk bob 5 %, lean 1-7°, planted 0.8 m stride; blinks 0.5-2.3 s; tight
  contact shadow ~.5 under the feet + sun-direction tail by day; golden rim inner only (never an offset outer copy).
- **Camera** (`story.ts`): cuts on big jumps, smootherstep glides 18-40 f, every hold creeps (no static hold ≥4 f),
  flip kicks decaying over 7 f on impacts, 4-4.6° rolls, foreground props (`FOREGROUND`) in ~1/3 of shots.

## Look targets (measured from the reference; see references/reports/)
- **Ink:**
  - World lines: about 3 px at 1080 wide, near-black #0b0a0c, nearly constant with distance. Silhouettes, depth jumps and normal creases only. No line on wall/floor joins or the horizon. Character cards are never outlined by the world ink.
  - Character ink: dark plum #201628-#2f1d28, thicker on the bottom/shadow side.
- **Colour:**
  - Day median luma ~.57. Non-ink p5 ~.23 (no crushed blacks). Lit chroma C* p90 ~55. Day sky top ~#5e93d9, horizon 1.28x brighter.
  - Golden: peach horizon #ffd08a, violet-blue shadows (never brown), backlit sun.
- **Depth:**
  - DOF on about 1/3 of screen time (CU, MS, inserts), cInf 10-16 px at 1080, focus on the eyes. Establishing and wide shots stay sharp.
  - Fog = horizon colour, 25→420 m day, 20→360 m golden.
  - Bloom only on HDR emissives: threshold 1.0.
- **Camera:**
  - Hard cuts on big jumps. Everything else is a smootherstep glide of 18-40 f, peak ≤ 25 px/f at 720p.
  - Every hold pushes in 0.15-0.35 %/f, with 0.6 %/f on punch words.
  - Rolls of 4-5°.
  - No hand-held float. Impact shakes flip sign every frame and decay over 7 f.
- **Characters:**
  - About 3.5 head-heights tall, legs 1.4 HH.
  - Stick limbs about 0.055 of head width, ink-dot hands.
  - Bean head (h/w ~0.93, narrower chin, pointier crown).
  - No blush or eye highlights. Faces at brightness ~.93.
  - Walk bob 3-7 %, lean 1-7°, planted feet.
  - Blinks every 0.5-2.3 s, lasting 4 f.

## Look-match loop (how the bridge look was reached; reuse for any "make it look like X" pass)
1. **Measure the reference first.** One analysis agent per topic (motion, depth, textures, characters, lighting, outlines, grade), each writing numbers, not adjectives, to `references/reports/<topic>.md`. Shared brief: `compare/CONTEXT.md`. Reports are the source of truth for every agent after.
2. **Sandboxes, one owner per file.** Copy the project folder to `src/videos/<name>_{cam,world,mat,char,post}` with entries `src/sandboxes/<n>/index.tsx` (same `index.tsx` as main, only the import path changed). Ownership used for the bridge:
   - cam: story.ts (camera keys, cuts, kicks, DOF table, foreground props)
   - world: world.ts, lights.ts, shade.ts, grade.ts (sun, sky, fog, river, colour, grade)
   - mat: paint.ts, build.ts (painted textures, buildings, props)
   - char: toon.ts, cast.ts, cardshade.ts (character drawing, posing, card lighting, fx cards)
   - post: ink.ts, Bridge.tsx, lensblur.ts (outline pass, composer, lens blur, bloom)
   Agents only edit their own files in their own sandbox and render stills with `BRIDGE_ENTRY=src/sandboxes/<n>/index.tsx node scripts/bridge-stills.mjs out/<name>/<n>/x_ <frames> 0.5`.
3. **Merge** with `python scripts/bridge_merge.py [cam,world,mat,char,post]` (backs main up to `backup/bridge_<time>/`, copies owned files only). Then `npx tsc --noEmit` (filter to the project folder), then **re-sync every sandbox from main** (`cp -f src/videos/<name>/* src/videos/<name>_<n>/`) before the next round.
4. **Verify** with a fresh Opus max agent: side-by-side sheets (`python scripts/sbs_sheet.py out.jpg --ours a b --ref r1 r2`), score each area out of 10 (colour day / golden, lighting, ink, textures, characters, depth, composition) plus a numbered fix list with frame numbers. Map each fix to the file owner and resume that owner's agent with SendMessage (keeps its context). Bridge scores: round 1 5/3/4/5/4/7/4/6 → round 2 5/4/5/6/4/7/6/6 → round 3 see notes.
5. Contracts between owners live in exported constants (e.g. `NOINK` layer from ink.ts, `dofAt`/`FOREGROUND` from story.ts, `LIGHTS`/`LOOK` from lights.ts). Changing a contract means telling every owner that reads it.

## Gotchas
- Kenney nature-kit materials are teal: recolour them by material name in build.ts.
- Cameras end up inside houses: the sight-line culler in build.ts/world.ts removes anything blocking any camera ray.
- Ink in the same merged effect pass as DOF gets overwritten. Ink must be its own pass before the blur.
- Pixel-sized post parameters must scale with resolution: stills are at 0.5, the final at 1.333. R3F clamps dpr to ≥ 1, so `--scale 0.5` stills still render a 1080x1920 buffer.
- **Disk:** every Remotion bundle copies `public/` (~1.3 GB) into `the temp folder\remotion-webpack-bundle-*` and never deletes it. 60+ GB filled the system drive during the bridge passes and a render died with ENOSPC. Always render with `export TEMP='<big drive>/remotion-tmp' TMP='<big drive>/remotion-tmp'` (bridge-stills.mjs sets it itself) and ask the user before deleting old bundle folders in the shared the temp folder (auto mode blocks the sweep). <big drive>/remotion-tmp fills too (~500 folders / 110 GB after the 4 bridge rounds): when a project is finished and nothing is rendering, delete its `remotion-webpack-bundle-*` and `puppeteer_dev_chrome_profile-*` folders there.
- In JS strings write `"<big drive>/remotion-tmp"`, never `"<big drive>\remotion-tmp"` (`\r` becomes a carriage return).
- Remotion writes a silent audio track: mux with `-map 0:v:0 -map 1:a:0`.
- Sub-agents can't write report files in this harness: ask them for a ≤150-word final message and save it yourself to `out/<name>/<n>/REPORT.md`.
- Scratch `.ts` files inside `out/` break `tsc`: name them `.txt`.
- 2K renders run ~4 fps (≈10 min for 67 s). Stills at 0.5 take 3-8 s each after a ~40 s bundle.
- Film grain at 2.5 % made the 2K file 910 MB instead of ~250 MB and will turn to mush on YouTube; the reference has none. Keep it off.

## Readability traps the verifier caught (check every new prop/shot for these)
- **A swing drawn as one rope that disappears behind the kid reads as a HANGING.** Always two ropes to a wide plank
  with the kid between them (`swingKid` in toon.ts), and a frame whose legs clear the arc (A-frame at each end).
- Props or flotsam closer than ~2 m to a lens become huge cut-off blobs at the frame edge. When a camera moves, re-check
  every prop near its new position (the river cameras moved into the floating hats).
- A foreground bush cut by the frame edge reads as a "green ball"; a foreground prop must be recognisable or gone.
- Flags: red + yellow star/diamond reads as Vietnam's. Use a period-correct flag (St George's cross for England 1831).
- Painted signs lit by a side sun go grey-blue and unreadable: give the sign face an unlit material.
- Golden rim light done as an offset outer copy turns every hat into a picture frame: inner rim only, head/torso only.
- Balcony/railing rails at chest height through characters: put the lens ~2.5 m up so rails cross legs, not torsos.
- Flat holds read as freezes in QA (frozen span ≥12 f): every hold needs a creeping push-in.
