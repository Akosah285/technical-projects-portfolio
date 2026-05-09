---
Status: needs-triage
Type: AFK
---

# Recursion & Algorithms — Quicksort + Scan visualizations

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

Two more projects on the **Recursion & Algorithms** theme page, each a full project card with live algorithm visualization, code viewer, tech sheet, reflection, screenshot, and source download.

- **Quicksort** at `/courses/intro-to-programming/recursion-and-algorithms/quicksort/` — an animated visualization of the partition step and the recursive descent on a randomly-generated array; transport controls let visitors step through pivots, partitions, and recursion depth. Source: `quicksort.py`.
- **Scan** at `/courses/intro-to-programming/recursion-and-algorithms/scan/` — a step-by-step visualization of the parallel-prefix-scan operation on a sequence, illustrating the up-sweep and down-sweep (or whatever the original `scan.py` actually does — verify against source). Source: `scan.py`.

Both projects plug into the Algorithm Visualization Runtime built in S2; no new framework infrastructure required.

## Acceptance criteria

- [ ] Both project pages render with the full project-card layout
- [ ] Quicksort animates the partition step and the recursive descent; transport controls work; reset re-shuffles the input; results can be inspected step-by-step
- [ ] Scan animates the original algorithm faithfully (verify the source first; if it isn't a parallel scan, animate what it actually is)
- [ ] Original `.py` files served from `/sources/intro-to-programming/quicksort/` and `/sources/intro-to-programming/scan/`
- [ ] Original screenshots (if present) converted to WebP and shown
- [ ] Reflections drafted and edited to the author's voice for each
- [ ] Tech sheets auto-generated for both
- [ ] Theme page lists Hanoi, Quicksort, and Scan in a sensible within-theme order
- [ ] No new tests required beyond regression coverage from S2 (these projects only contribute step generators and renderers, which are exercised manually)
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
