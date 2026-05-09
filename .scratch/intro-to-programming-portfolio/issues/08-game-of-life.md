---
Status: needs-triage
Type: AFK
---

# Interactive Worlds — Conway's Game of Life

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A project page at `/courses/intro-to-programming/interactive-worlds/game-of-life/` with a fully interactive Conway's Game of Life. Visitor clicks (or taps) cells to toggle them alive/dead, presses play to evolve generations continuously, or steps generation-by-generation. Speed and grid-size controls are available; reset clears the grid; a small pattern menu offers a few classic seeds (glider, blinker, pulsar) for visitors who don't know what to draw.

This slice plugs into the Interactive Demo Runtime built in S3 — touch interaction (tap-to-toggle) substitutes one-to-one for click, so no special mobile fallback is needed. Sources: `cell.py`, `colony.py`.

## Acceptance criteria

- [ ] Project page renders with the full project-card layout
- [ ] Visitor can toggle cells alive/dead by clicking or tapping
- [ ] Play / pause / step / reset / speed controls all work
- [ ] At least three classic seed patterns are selectable from a small menu
- [ ] Generation count is displayed
- [ ] The simulation runs at a steady framerate via the Interactive Demo Runtime
- [ ] RAF loop pauses on tab blur and resumes on focus
- [ ] `cell.py` and `colony.py` are downloadable from `/sources/intro-to-programming/game-of-life/`
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflection drafted and edited; tech sheet auto-generated
- [ ] Touch input works correctly on mobile
- [ ] Live deploy verified

## Blocked by

- 03-pong-tracer-bullet.md
