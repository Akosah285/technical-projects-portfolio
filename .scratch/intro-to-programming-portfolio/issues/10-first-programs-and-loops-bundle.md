---
Status: needs-triage
Type: AFK
---

# First Programs & Loops — Egg and Ham, Portia, Rich, Choose

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

Four small projects on the **First Programs & Loops** theme page, each a full project card. These are bundled in one slice because they're each small (mostly console output or a single one-shot drawing) and shipping them together lights up the entire theme page at once.

- **Egg and Ham** at `/.../first-programs-and-loops/egg-and-ham/` — the original is a graphical drawing via `cs1lib`. Reimplement as a one-shot canvas drawing in the browser, faithful to the original. Source: `egg_and_ham.py`.
- **Portia** at `/.../first-programs-and-loops/portia/` — narrative compound-interest console program. Show the simulated console output as a styled "terminal" output block; visitor presses "run" to play the output line-by-line. Source: `portia.py`.
- **Rich** at `/.../first-programs-and-loops/rich/` — same pattern as Portia. Source: `rich.py`.
- **Choose** at `/.../first-programs-and-loops/choose/` — combinatorics calculator. Visitor enters n and k; result computes live. Source: `choose.py`.

All four use the project-card layout; none require new runtime infrastructure (all are either one-shot canvas, simulated terminal, or plain form input).

## Acceptance criteria

- [ ] All four project pages render with the full project-card layout
- [ ] Egg and Ham renders the canvas drawing faithfully to the original `.py` output (compare against the original screenshot)
- [ ] Portia and Rich each render their narrative line-by-line in a styled terminal block when the visitor presses "run"
- [ ] Choose accepts n and k inputs (with sensible bounds) and computes the binomial coefficient live
- [ ] All four `.py` source files are downloadable from their respective `/sources/...` paths
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflections drafted and edited for each
- [ ] Tech sheets auto-generated for each
- [ ] Theme page lists all four in a sensible order
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
