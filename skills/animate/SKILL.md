---
name: animate
description: Build HyperFrames (HTML to MP4) videos with the Animate workflow - full YouTube long-form edits (16:9) copying ANY reference editing style, presenter reels in 9:16 or 16:9, motion graphics, real 3D, editable infographics and the eight-reel wall - from the RUBRIC Elements library, registering every new element back into it. Footage is cut beforehand by the coupe-facecam skill. Use when the user says "animate", "/animate", "hyperframes", "html to mp4", "render this", "motion graphics for [recording]", "copie le style de montage de <URL>", "montage complet", "storyboard a video", "make a reel", "landscape version", "vertical version", "create an element", "register this asset", or asks what reusable elements exist. Also fires in French ("monte cette vidéo", "fais un reel", "montage", "version verticale", "version horizontale") and for sourcing or generating the visuals inside a video job.
---

# Animate (v4)

Build organised HyperFrames videos from reusable elements, and leave the library richer than you found it. One principle: every scene is a pure function of scene-local time, so previews, scrubs and renders agree.

**Division of labour:** `coupe-facecam` cuts the rush (euh, blancs, reprises), corrects eye contact and exports `mots-coupe-v1.json`. Animate never cuts footage and never re-transcribes: it anchors scenes on those words.

| Doing... | Read | Covers |
|---|---|---|
| **A full YouTube edit copying a reference style** | [style-copy.md](references/style-copy.md) + `styles/<videoId>.md` + `assets/components/youtube-longform-engine/README.md` | the fast path validated on a 20-min video |
| **Any video that names a tool, site, repo, company or statistic** | [real-visuals.md](references/real-visuals.md) | real interface, logos, French sources, fal.ai last |
| A presenter reel, portrait or landscape | [reel-production.md](references/reel-production.md) | type, palette, layouts, resources, 3D, hooks, beats, audio, proof |
| Any other composition, storyboard or render | [production-manual.md](references/production-manual.md) | phases, lint rules, motion patterns, CLI |
| Words on screen | [motion-copy.md](references/motion-copy.md) | hook, subtitle and CTA copy rules |
| The eight-reel wall | [eight-reel-wall.md](references/eight-reel-wall.md) | reuse of the approved template |
| Finding or registering an element | [element-library.md](references/element-library.md) | categories, previews, register and rebuild commands |
| Creating a new element | [creating-elements.md](references/creating-elements.md) | the element contract, quality bar, registration |
| Checking your work | [evals.md](references/evals.md) | acceptance prompts with observable checks |

Read only the file for the job in hand.

## Universal rules (never skipped)

0. **Show the real thing.** A named tool, app, site, repo, company, model, study or article is on screen within 0.3 s of the spoken name: its real interface, results, logo or page ([real-visuals.md](references/real-visuals.md)). Generate (fal.ai) only what cannot exist. Never invent proof (revenue, client messages): honest graphics, or ask the user for real captures.
1. **Register new reusable elements/components in the library** before calling the job done (`node library/register-asset.mjs entry.json`).
2. **Look in the library / components before building.**
3. **Scene-local time drives everything** (`renderAt(t)` / paused GSAP timelines; no timers, random or clock).
4. **Links, never tabs.** Validate headless, return paths.
5. **One folder per video**, shared masters in a common folder.
6. **Find before you generate** (stock footage: Mixkit; logos: brand page, Simple Icons, Wikimedia).
7. **Footage comes from coupe-facecam** (cut + eye contact). If eye contact is still running, build and preview on `<rush>-v1.mp4` without correction (same timings) and swap the source at the end.
8. **Audio follows the house rules** (section below), measured, never guessed.
9. **No black opening.** Frame 0 is finished; first word within 0.05 s. `scripts/check-render.py` (add `--dark-style` when the copied style uses black graphics: black runs are then notes, the opening is still checked).
10. **Notify on Telegram** (if configured in `config/keys.env`; otherwise just tell the user in chat) with `python3 scripts/notify.py "message"`: blocking question, missing key/credit, a validation step ready (first minute cut, first minute edited), job finished.

## Fast path: full YouTube edit in a reference style (validated)

1. **Brief (no questions if the prompt gives them):** rush, reference URL, script (Google Doc → `https://docs.google.com/document/d/<ID>/export?format=txt`), format 16:9.
2. **Cut** with coupe-facecam: first-minute extract → the user validates → full rush (`rendu --sans-eyecontact`), then **eye contact in the background** (`coupe.py eyecontact`) while you edit. Mind its rule 1 (script "tel que dit").
3. **Style:** `styles/<videoId>.md` if it exists, else one subagent analyses the reference ([style-copy.md](references/style-copy.md)) and the spec is saved for next time.
4. **In parallel, one subagent collects real visuals** for the whole script (logos, site captures 1920×1080 + tall, the cited study/article, Mixkit b-roll per generic idea, MANIFEST.json).
5. **First minute** (hook): bespoke composition (start from the closest `examples/hook-intro-*.html`), render, the user validates (music, SFX, formatting).
6. **Sections:** copy the engine, `theme.json` from the style, `story.py` from the closest example; `story.py ... --check` (all anchors at once) → build → lint all → snapshot 1 frame per scene type on 2–3 parts → fix → render all parts in ONE background loop with `npx hyperframes render --fps 30 --workers 4 --gpu` (≈30 % faster than the default single worker).
7. **Soundtrack:** `final_mix.py` (prefix = the hook pre-mix, voice = the cut, looped lofi, SFX from the parts) → concat parts (`-c:v copy`) + mux (`-af apad -shortest`) → checks (decode, duration vs audio, -14 LUFS) → Telegram.

**Time budget seen (20-min video):** cut analysis 5 min; full cut render 25–45 min (2 verification rounds); eye contact 2–3 h on the FREE NVIDIA tier (the bottleneck — run it in the background from minute one); section renders ≈ 0.6× realtime with `--workers 4 --gpu` (≈ 30 min for 18 min). Render the sections ONCE, after eye contact, unless the user wants an early preview.

## Audio rules (house defaults, validated Oct 2026)

- **Music 100 % free**: Mixkit (licence free, YouTube OK), YouTube Audio Library, or the user's own file. Never the reference's tracks (Shazam often finds Epidemic Sound: describe tempo/mood and find a free equivalent).
- **Hook**: an audible music bed, ~-12 dB under the voice median (a free "suspense" track; no music is bundled, the user supplies or downloads it).
- **Body**: ONE calm lofi, looped with 3 s crossfades, very discreet ~-21 dB under the voice (validated: "Sleepy Cat", Alejandro Magaña, Mixkit). No playlist, no faster track later ("too speed" = rejected). Music may drop out on a dramatic B&W beat if the reference does.
- **SFX**: Animate house sounds only (`assets/sound-effects/`), sparse — only where the reference has one: soft click on scene cuts, switch on hero titles, confirmation rarely; -16 to -19 dB under the voice. Never `scroll_001` (sounded like a bug).
- **Fades on music only**, never on the voice (a 2 s master fade ate the last words). Final -14 LUFS, limiter 0.89.
- Levels are set by measuring (0.5 s RMS windows of the voice vs the bed), never by fixed gains.

## Editing rules (house defaults)

- Every spoken CTA (guide/PDF "dans la description", lien, réserver un appel, laisser un commentaire) gets a motion-design scene (`pdf`, `cta` scene types), never a bare facecam.
- Competitor content (YouTube results/thumbnails) ≤ 2 s, channel names blurred.
- Copy the reference's formatting faithfully (e.g. YouTube *results list* with filmed-screen look, not a thumbnail grid).
- Overlays on the face never sit on top of a full-screen graphic (the engine's overlap resolver handles it).

## Reels (9:16 / 16:9 short form)

- Split presenter reels (animation above, presenter below, 1-2 word captions): library entry **Split presenter reel** (`assets/components/split-presenter-reel/`, `storyboard.json` → `render_reel.sh`, `retime.py` after a re-cut).

### Landscape vs vertical

| | Vertical 9:16 (1080x1920) | Landscape 16:9 (1920x1080) |
|---|---|---|
| Opening | Split layout with a short kinetic hook, real resource, infographic transformation or illustration, visible on frame 0 | Full-screen real footage with no hook text; the same playing layer then slides into the right plate (long-form YouTube: follow the reference style instead) |
| Split layout | Animation above, square presenter plate below | Animation left, presenter right |
| Presenter plate | 952x952 at (64,868), radius 64, soft white outer glow | 820x820 at (1040,98), radius 54, soft white outer glow |
| Subtitles and titles | Subtitles 68-76 px, titles 96-116 px, centred | Same starting sizes, clear of the presenter plate |
| Infographics | Above the presenter | Left of the presenter |
| Broll | Real or stock first, cropped 9:16 | Real or stock first |

Recompose, never stretch.

## Locked motion defaults (house style; a copied reference style overrides them)

- New elements move in **0.4 s**, expo.inOut, strong moving blur returning to zero at both ends.
- **Real 3D**: one Y turn over 0.5 s, 0.1 s fade, ≤ 30° drift, ≤ 3 s per appearance.
- Big headlines/hero numbers sit directly on the scene; full-screen presenter scenes stay unobscured.
- Hero numbers < 100 show immediately; ≥ 100 count over 0.5 s.
- **Presenter footage true 30 fps; animation sampled at 15 fps** (`Math.floor(t * 15) / 15`).
- Frame 0 finished; scenes ≤ 6 s; never crossfade presenter crops.
- House background (when no reference style): dot-matrix wave at 30% over warm paper.

## API keys (your own, in `config/keys.env`, read automatically; the file ships empty; never copy it into projects or share it once filled)

fal.ai (generation, last resort), NVIDIA (optional, kept for reference; eye contact runs in coupe-facecam), Telegram (optional notifications). If a needed key is missing, ask the user for it and say where to paste it.

## Resources

- `references/style-copy.md` — method to copy any reference style; `styles/` — cached style spec (`top10-ranking.md`).
- `assets/components/youtube-longform-engine/` — long-form engine (template, builder, final mix, examples).
- `references/reel-production.md`, `references/production-manual.md`, `references/motion-copy.md`, `references/real-visuals.md`, `references/element-library.md`, `references/creating-elements.md`, `references/eight-reel-wall.md`, `references/evals.md`.
- `templates/` — composition, storyboard, eight-reel wall, element and port templates, `recipes.md`. `blocks/` — drop-in compositions. `examples/` — paste-ready references.
- `scripts/check-render.py` opening/format gate (`--dark-style`); `scripts/fal-generate.py` fal.ai; `scripts/notify.py` Telegram; `scripts/run-hyperframes.mjs` pinned CLI with hidden Windows consoles; `scripts/prepare-video-folders.mjs` project scaffold.
- `library/index.html` RUBRIC Elements (`register-asset.mjs`, `build.mjs`), `library/motion-studio.html` motion recipes.
