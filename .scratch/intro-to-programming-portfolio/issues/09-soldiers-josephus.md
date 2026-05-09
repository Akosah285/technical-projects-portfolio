---
Status: needs-triage
Type: AFK
---

# Interactive Worlds — Soldiers / Josephus circular-elimination viz

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A project page at `/courses/intro-to-programming/interactive-worlds/soldiers/` with an animated visualization of the Josephus problem: N soldiers (default 41, configurable) stand in a circle, and every k-th soldier (default 2, configurable) is eliminated until one remains. The animation steps through the eliminations with each soldier briefly highlighting as the counting reaches them, then visibly being removed. Visitor controls N and k; transport controls let them step / play / reset.

This slice plugs into the Algorithm Visualization Runtime built in S2. Source: `soldiers.py`.

## Acceptance criteria

- [ ] Project page renders with the full project-card layout
- [ ] Soldiers are drawn arranged in a circle with their indices visible
- [ ] Visitor can adjust N (within a sensible range, e.g., 5–60) and k (e.g., 2–10)
- [ ] Animation visibly counts around the circle and removes each k-th soldier
- [ ] Final survivor is highlighted distinctly when only one remains
- [ ] Transport controls (play / pause / step / reset / speed) work via the Algorithm Visualization Runtime
- [ ] `soldiers.py` is downloadable from `/sources/intro-to-programming/soldiers/`
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflection drafted and edited; tech sheet auto-generated
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
