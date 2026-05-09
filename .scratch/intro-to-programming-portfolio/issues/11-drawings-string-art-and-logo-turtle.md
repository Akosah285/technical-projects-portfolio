---
Status: needs-triage
Type: AFK
---

# Drawings & Generative Art — String Art + Logo turtle

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

Two projects on the **Drawings & Generative Art** theme page.

- **String Art** at `/courses/intro-to-programming/drawings-and-generative-art/string-art/` — reimplementation of the original `string_art_akwasi.py` drawing in the browser. Renders as a one-shot canvas drawing, with optional controls for the parameters that drive the geometry (curve density, color, etc.) so visitors can play.
- **Logo turtle** at `/courses/intro-to-programming/drawings-and-generative-art/logo-turtle/` — reimplementation of `logoakosah.py` as a small in-browser Logo interpreter. Visitor types Logo commands (forward, right, repeat, etc.) into a small REPL and the turtle draws live on canvas, mirroring the spirit of the original.

The Logo turtle has live keyboard input but no game-loop physics, so the Interactive Demo Runtime's mobile fallback isn't really needed; on touch, the visitor uses the on-screen text input as normal. String Art is a one-shot drawing with optional parameter knobs and works identically on all devices.

## Acceptance criteria

- [ ] Both project pages render with the full project-card layout
- [ ] String Art renders the canvas drawing faithfully to the original; at least one parameter knob lets visitors vary the output
- [ ] Logo turtle accepts a small set of commands (at minimum: forward / right / left / repeat / pen-up / pen-down) and draws the turtle's path on canvas
- [ ] Logo turtle includes a small "try this" preset menu (square, spiral, polygon) for visitors who don't know Logo
- [ ] Both source `.py` files are downloadable from their respective `/sources/...` paths
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflections drafted and edited for each
- [ ] Tech sheets auto-generated
- [ ] Theme page lists both projects
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
- 03-pong-tracer-bullet.md
