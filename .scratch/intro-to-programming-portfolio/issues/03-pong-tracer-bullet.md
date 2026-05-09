---
Status: needs-triage
Type: AFK
---

# Pong tracer bullet (Interactive Demo Runtime)

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

The second tracer bullet: a fully playable Pong game on the project page at `/courses/intro-to-programming/interactive-worlds/pong/`. On desktop, the visitor plays with keyboard controls (paddle up/down, both paddles supported); the game tracks score and resets on game-over. On mobile, the canvas auto-plays a simulated demo loop with a gentle "best on desktop" hint. The page also includes a **checkpoint timeline** showing the project's progression from `atari_pong_akosah.py` (paddles only) → `pong_game_Akosa.py` (full game with ball and scoring), each checkpoint viewable as code in the Code Viewer.

This slice brings into existence: the Interactive Demo Runtime (canvas lifecycle, RAF loop, focus/blur pause/resume, framerate normalization, mobile detection, mobile fallback engagement), the Mobile / Input Adapter (touch / viewport decisions), the Checkpoint Timeline UI, and a deterministic seeded Pong physics core. After this slice both the Algorithm Visualization Runtime (from S2) and the Interactive Demo Runtime (from this slice) are battle-tested, unblocking parallel work on remaining projects.

Source files at `Submissions copy/Introduction to Programming and Computation (FA18)/atari_pong_akosah.py` and `pong_game_Akosa.py`.

## Acceptance criteria

- [ ] Project page renders with the full project-card layout (title, demo, code viewer, tech sheet, reflection, screenshots, source download)
- [ ] On desktop, the game is playable with keyboard controls; both paddles can be controlled; score updates on goals; the game responds to the keyboard with no perceptible lag
- [ ] The RAF loop pauses when the tab loses focus and resumes when it regains focus
- [ ] On mobile / touch-only devices, the demo automatically engages an auto-play loop showing the game playing itself, with a brief hint that desktop is the better experience
- [ ] The Code Viewer presents both `atari_pong_akosah.py` and `pong_game_Akosa.py` via the Checkpoint Timeline UI (tabs or stepper); both files are downloadable
- [ ] Both source files are served from `/sources/intro-to-programming/pong/`
- [ ] Original Pong screenshots (any `.tiff` files for this project) are converted to responsive WebP and rendered on the page
- [ ] Reflection MDX is present and edited to the author's voice
- [ ] Tech sheet is auto-generated
- [ ] Unit tests cover: Pong physics core (paddle bounds, ball-paddle collision behavior, ball-wall collision behavior, scoring trigger, deterministic given a seed); Interactive Demo Runtime (RAF pause/resume on focus/blur, lifecycle cleanup releases listeners and frames, mobile fallback engagement); Mobile / Input Adapter (touch / viewport / fallback decisions across realistic input combinations)
- [ ] Cleanup correctness: navigating away from the page leaves no leaked listeners, RAF frames, or audio
- [ ] Live deploy on GitHub Pages is verified working

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
