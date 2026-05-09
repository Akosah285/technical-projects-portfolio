---
Status: needs-triage
Type: HITL
---

# Pre-deploy polish — About me, footer, custom-domain decision, final QA

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

The final pass before declaring the Intro to Programming portfolio publicly shareable. Covers the human content and decisions that were deferred during the build, plus a comprehensive final QA pass.

- **About me** page at `/about/` (or equivalent) — a short bio in Akwasi's voice, written from material gathered while drafting the per-project reflections. Includes a way to get in touch (mailto link or social profile links).
- **Footer copy** finalized — the academic-integrity acknowledgement line, copyright, links to source repository.
- **Custom domain decision** — the user decides whether to register a custom domain or stay on the GitHub Pages default URL; if a custom domain is chosen, configure DNS and the `CNAME` file in the repository.
- **Optional analytics decision** — the user decides whether to add a privacy-friendly analytics provider (e.g., Plausible, GoatCounter) or stay tracker-free; default remains tracker-free per PRD.
- **Final QA pass** — every theme page, every project page, every demo verified manually on both desktop and mobile; broken links fixed; missing screenshots/reflections completed; mobile chrome and content verified responsive everywhere; accessibility quick-pass (alt text on images, keyboard navigability of all interactive controls).

## Acceptance criteria

- [ ] About me page exists at a stable URL with a short bio and a way to get in touch
- [ ] Footer copy is finalized site-wide
- [ ] Custom-domain decision recorded; if a domain is chosen, it is wired up and resolves over HTTPS
- [ ] Analytics decision recorded; if added, it is privacy-friendly and disclosed in a small site notice
- [ ] All seven theme pages render correctly with their built projects
- [ ] All built project pages have working demos, code viewers, source downloads, screenshots, reflections, and tech sheets
- [ ] All `.py` source files referenced anywhere on the site are present and downloadable
- [ ] No broken internal links; no broken image references
- [ ] Mobile chrome and content is responsive and readable on every page
- [ ] Every interactive control is reachable via keyboard
- [ ] Every image has descriptive alt text
- [ ] Live deploy verified end-to-end on the final hosting URL

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
- 03-pong-tracer-bullet.md
- 04-recursion-quicksort-and-scan.md
- 05-cities-sort-and-visualize-world-map.md
- 06-bfs-dartmouth-campus-pathfinding.md
- 07-crypto-xor-cipher-step-through.md
- 08-game-of-life.md
- 09-soldiers-josephus.md
- 10-first-programs-and-loops-bundle.md
- 11-drawings-string-art-and-logo-turtle.md
- 12-oop-counter-and-timer.md
