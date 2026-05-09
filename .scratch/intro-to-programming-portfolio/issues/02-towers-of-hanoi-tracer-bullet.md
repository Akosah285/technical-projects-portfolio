---
Status: needs-triage
Type: HITL
---

# Towers of Hanoi tracer bullet

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

The first real project on the site, end-to-end, deployed to the live URL. Visiting `/courses/intro-to-programming/recursion-and-algorithms/towers-of-hanoi/` shows a complete project page: animated Hanoi disks moving between three pegs with play / pause / step-forward / step-backward / scrub / speed / disk-count (1–8) controls; a syntax-highlighted code viewer for `solve_hanoi.py`; a download link for the original `.py`; an auto-generated tech sheet; an MDX-authored reflection in the author's voice; the original `solve_hanoi_output.tiff` rendered as a responsive WebP screenshot; a footer line acknowledging the work originated as Dartmouth COSC 1 (FA18).

This slice is intentionally fat. It is the tracer bullet that brings the entire reusable framework into existence at the smallest scope: the Project Registry, the Tech Sheet Generator, the Reflection MDX Loader, the Source File Server, the Algorithm Visualization Runtime, the Code Viewer, the Project Card, the Theme Page, the Course Page, the Site Shell, the Image Asset Pipeline, and the Hanoi Step Generator + Renderer — all via one real shipping project. It also includes the design pass that locks the visual language: accent color (2–3 options proposed and the user picks one), typography, spacing, layout. Every subsequent project becomes a step generator + renderer plug-in to the infrastructure built here.

`solve_hanoi.py` is at `Submissions copy/Introduction to Programming and Computation (FA18)/solve_hanoi.py`. The screenshot is `solve_hanoi_output.tiff` in the same folder. Reflection is drafted by the agent from the source code and any matching author notes; the author edits to taste.

## Acceptance criteria

- [ ] Site shell (header, footer, navigation, accent color, typography) is finalized and applied
- [ ] Course page at `/courses/intro-to-programming/` lists the seven themes (the six other themes link to placeholder theme pages with a "coming soon" line if unbuilt)
- [ ] Theme page at `/courses/intro-to-programming/recursion-and-algorithms/` lists Towers of Hanoi as a project card linking to its detail page
- [ ] Project page at `/courses/intro-to-programming/recursion-and-algorithms/towers-of-hanoi/` renders all of: title; live animated viz; transport controls; disk-count selector (1–8); speed control; reset; code viewer; download `.py` link; tech sheet; reflection; original screenshot
- [ ] The Hanoi animation produces exactly 2ⁿ−1 visible disk moves for any chosen n
- [ ] Every animated step is a legal Hanoi move (smaller-on-larger only)
- [ ] Code viewer is syntax-highlighted at build time (no client-side highlighter shipped to visitors)
- [ ] The original `.py` is downloadable and served from the `/sources/intro-to-programming/towers-of-hanoi/` path
- [ ] `solve_hanoi_output.tiff` is converted at build time to WebP at multiple responsive widths with content-hashed filenames; the page references the WebP variants
- [ ] The build fails loudly if the source `.py` or screenshot file is missing or malformed
- [ ] The footer line acknowledging Dartmouth COSC 1 (FA18) origin appears site-wide
- [ ] Unit tests cover: Hanoi Step Generator (length 2ⁿ−1, legal moves, correct destination, n=1..8), Algorithm Visualization Runtime (transport state transitions), Project Registry (querying by theme/slug, malformed-entry failure), Tech Sheet Generator (generation + override precedence), Image Asset Pipeline (WebP outputs at expected widths, content-hashed filenames)
- [ ] Page is fully responsive on mobile (chrome and content readable; canvas scales appropriately)
- [ ] Live deploy on GitHub Pages is verified working

## Blocked by

- 01-walking-skeleton-and-first-deploy.md
