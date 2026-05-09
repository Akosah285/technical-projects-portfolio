---
Status: needs-triage
---

# Intro to Programming Portfolio (FA18) — Site MVP

## Problem Statement

Akwasi has accumulated 22 courses' worth of academic submissions across four years at Dartmouth — substantial work spanning Computer Science, Engineering, Mathematics, Humanities, and Sciences. Today, none of it is publicly visible to recruiters or collaborators. Static screenshots, raw `.py` files, and large `.tiff` images sitting in a `Downloads` folder don't communicate what the work actually does, what was learned, or how sophisticated it is. A recruiter evaluating Akwasi for a software or engineering role has no efficient way to scan the depth and variety of his technical work, and no way to *experience* projects like Pong, Towers of Hanoi, Conway's Game of Life, or BFS pathfinding without cloning, installing dependencies, and running them locally — which they will not do.

The work needs a public-facing home that shows it in motion. Static images and code dumps under-represent what was built; recruiters and collaborators need to see the algorithms execute and the games play.

## Solution

A statically-deployed personal portfolio site that turns each project into a live, interactive demonstration in the browser. Algorithms animate step-by-step (Towers of Hanoi disks moving between pegs, BFS frontier expanding across a campus map, Quicksort partitions visualizing the recursion); games play in the browser (Pong); cellular automata run live (Conway's Game of Life). Every project card pairs the live experience with the original source code, a short reflection in the author's voice, and an auto-generated tech sheet.

The site is initially scoped to a single course — Introduction to Programming and Computation (FA18) — themed into seven outcome-focused buckets, with Towers of Hanoi as the tracer-bullet first project to validate every reusable pattern, and Pong as the marquee second project. The framework is deliberately built to accept the remaining 21 courses without rework: project content lives as data, themes are configurable, the per-project card layout is generic, and the visualization and interactive runtimes are reusable across future projects.

The aesthetic is intentionally minimalist — quiet chrome, a single accent color, generous whitespace — so that the demos themselves carry the visual weight. The site is hosted free on GitHub Pages with a static export that remains portable to other static hosts (e.g., Vercel) without rework.

## User Stories

### Recruiters and hiring managers

1. As a recruiter, I want to see live, in-browser demonstrations of the projects, so that I can quickly judge technical depth without having to clone and run code.
2. As a recruiter, I want to view the original source code for each project, so that I can assess code quality and style.
3. As a recruiter, I want a brief written reflection on each project, so that I can understand what the author learned and how they think.
4. As a recruiter, I want a quick visual scan of all themes and topics covered in the course, so that I can decide in 30 seconds whether to dig deeper.
5. As a recruiter, I want to know the original context (this work was university coursework), so that I can calibrate the work appropriately.
6. As a recruiter, I want the URL to look professional, so that the link conveys legitimacy when shared.
7. As a recruiter, I want HTTPS everywhere, so that the site reads as trustworthy.
8. As a recruiter, I want clear navigation back to the portfolio root from any project page, so that I can keep exploring without using the back button.
9. As a recruiter, I want the visual aesthetic to be minimalist and professional, so that the chrome doesn't distract from the work itself.
10. As a recruiter, I want pages to load quickly even with heavy interactive content, so that the experience feels professional.

### Collaborators and fellow engineers

11. As a collaborator, I want to see how an algorithm executes step-by-step, so that I can understand the author's grasp of the underlying concept.
12. As a collaborator, I want to play interactive games and use interactive demos, so that I can experience the work as an end-user would.
13. As a collaborator, I want to download the original source files, so that I can run them locally if I want to.
14. As a collaborator, I want to compare checkpoint versions of a project (e.g., Pong's progression from paddle-only to full game), so that I can see how the author iterated.
15. As a collaborator, I want to see the author's name and a way to get in touch, so that I can reach out.

### Curious visitors

16. As a curious visitor, I want to navigate by theme, so that I can browse work by topic of interest.
17. As a curious visitor, I want to see beautiful animated visualizations of classic algorithms, so that I leave the site having learned something new.
18. As a curious visitor, I want each theme page to communicate the theme's central concept, so that I understand what unifies the projects within it.

### Mobile visitors

19. As a mobile visitor, I want all reading content (code, reflection, tech sheet, screenshots) to be fully readable on my phone, so that I'm not blocked from consuming the substance.
20. As a mobile visitor, I want interactive demos that require a keyboard to gracefully fall back to an auto-play loop, so that I can still see what they do.
21. As a mobile visitor, I want touch-friendly demos to accept taps in place of mouse clicks, so that I can interact with the things that work on touch.
22. As a mobile visitor, I want a clear note on demos where my device can't deliver the full experience, so that I know to revisit on desktop.

### Akwasi (author / maintainer)

23. As the author, I want to add a new project by editing content files (not application code), so that I can extend the portfolio without engineering work each time.
24. As the author, I want my reflections to be drafted from my code and existing notes automatically, so that I only have to edit (not write from scratch) per project.
25. As the author, I want a tech sheet per project to be auto-generated from the source code, so that recruiters get a quick scannable summary without me writing one.
26. As the author, I want pushing to the main branch to automatically rebuild and redeploy the site, so that updates are friction-free.
27. As the author, I want to add new courses later without restructuring the site, so that the portfolio scales beyond Intro to Programming.
28. As the author, I want my legacy `.tiff` screenshots to be served in modern responsive formats, so that mobile users don't download multi-megabyte images.
29. As the author, I want the build to fail loudly if a project file is malformed, so that I catch errors at build time rather than in production.
30. As the author, I want the build to fail if a referenced source file or screenshot is missing, so that broken cards never reach production.
31. As the author, I want each project to live in a self-contained content directory, so that I can work on one at a time without touching others.
32. As the author, I want algorithm visualizations to share a single runtime, so that I can write each new visualization in hours rather than days.
33. As the author, I want interactive demos to share a single runtime, so that lifecycle issues (focus, RAF, cleanup) are solved once.
34. As the author, I want the academic-integrity framing to be honest but quiet (footer note), so that I'm transparent without being defensive.
35. As the author, I want the entire site to be hosted at zero recurring cost, so that the project doesn't accrue infrastructure debt.
36. As the author, I want a plain-language manual for adding a new project, so that I (or a future contributor) can extend the portfolio without reading framework code.
37. As the author, I want analytics to be optional and not deployed initially, so that I respect visitor privacy by default while keeping the option open.

### Per-project content

38. As a visitor, I want to see screenshots of the original 2018 work, so that I can see what the author actually shipped at the time.
39. As a visitor, I want a checkpoint timeline for projects that have one, so that I can see the iterative progression.
40. As a visitor, I want links to view and download the original `.py` files, so that I can verify the implementation directly.
41. As a visitor, I want code blocks to be syntax-highlighted, so that they're readable rather than a wall of text.

### Specific algorithms and demos

42. As a visitor exploring Towers of Hanoi, I want to watch disks animate from peg to peg, so that the recursion becomes intuitive.
43. As a visitor exploring Towers of Hanoi, I want to control the playback speed and step through moves manually, so that I can study what's happening at my own pace.
44. As a visitor exploring Towers of Hanoi, I want to choose the number of disks (a small range, e.g., 1–8), so that I can see how the move count scales and feel the exponential growth.
45. As a visitor exploring Pong on desktop, I want to play the game with keyboard controls, so that I can experience it as it was originally designed.
46. As a visitor exploring Pong on mobile, I want to watch the game auto-play in a loop, so that I can still see what was built.
47. As a visitor exploring Quicksort, I want to see partitions animate as the recursion descends, so that I understand the divide-and-conquer mechanic.
48. As a visitor exploring BFS pathfinding, I want to click on a start vertex and a goal vertex on the campus map, so that I can see the shortest-path animation play across the map.
49. As a visitor exploring Conway's Game of Life, I want to click cells to seed patterns and step generations, so that I can experiment with cellular automata.
50. As a visitor exploring Cryptography, I want to see the one-time-pad XOR applied character-by-character, so that I understand the mechanic rather than just the I/O.
51. As a visitor exploring Cities sorting, I want to see cities plotted on a world map as they're sorted, so that I can connect data operations to geography.
52. As a visitor exploring the Soldiers (Josephus) project, I want to watch soldiers eliminate in a circle, so that I see why the problem is interesting.
53. As a visitor exploring the OOP projects (Counter, Timer), I want to see the classes execute with their state changes visible, so that I understand the abstraction in motion.
54. As a visitor exploring the early "First Programs" theme, I want to see programs run their actual output, so that I appreciate the starting point of the journey.
55. As a visitor exploring the Drawings theme, I want to see the original generative-art outputs rendered in the browser, so that I see the static images come from real code.

### Reliability and operational

56. As a visitor, I want pages to render readable content even if a heavy interactive component fails to load, so that the rest of the site still works.
57. As the author, I want the deploy pipeline to surface build failures clearly in GitHub Actions, so that I notice when something breaks before it ships.

## Implementation Decisions

### Stack and rendering
- **Framework:** Next.js (App Router) with TypeScript.
- **Content authoring:** MDX for per-project reflections; typed TypeScript modules (or YAML) for project metadata, themes, source-file references, screenshots, and tech-sheet overrides.
- **Styling:** Tailwind CSS + shadcn/ui component primitives.
- **Rendering mode:** Static export (`output: 'export'`). No SSR, no API routes, no middleware, no ISR.
- **Discipline:** All work stays within the static-export envelope so future migration to a different static host (e.g., Vercel) remains painless.

### Hosting and deployment
- **Host:** GitHub Pages.
- **Deploy:** GitHub Actions workflow building the static export and pushing to Pages.
- **URL strategy:** Default to `username.github.io/repo-name/` for now; custom domain decision deferred. `basePath` and `assetPrefix` configured accordingly.
- **HTTPS:** Provided by GitHub Pages automatically.
- **Trailing slashes:** `trailingSlash: true` to match GitHub Pages conventions and avoid 404s.

### URL structure
- Course landing: `/courses/intro-to-programming/`
- Theme page: `/courses/intro-to-programming/<theme-slug>/`
- Project page: `/courses/intro-to-programming/<theme-slug>/<project-slug>/`
- Source files (static): `/sources/intro-to-programming/<project-slug>/<file>.py`
- Site root currently aliases or redirects to the intro-to-programming course landing; multi-course landing IA deferred.

### Content model
- **Themes (7, fixed for this course):** First Programs & Loops; Drawings & Generative Art; Recursion & Algorithms; Object-Oriented Design; Cities & Maps (Working with Real Data); Cryptography & Text Processing; Interactive Worlds.
- **Project entry per project:** Title, slug, theme reference, ordered list of source-file references, ordered list of screenshot references, optional checkpoint timeline (for Pong and similar progressions), optional tech-sheet manual overrides.
- **Reflection:** MDX file per project, drafted by the author with AI-assistance from source code + existing author notes (`progress from Checkpoint.txt`, `observation.txt`, `Brief Description of Video.txt`); editorially the author's voice.
- **Sources:** Original `.py` files copied into a parallel `sources/` directory in the repository, served as static assets. Duplicates from re-downloads (`-1`, `-2` suffixes) collapse into a single canonical entry.

### Modules to build
- **Project Registry** — typed source of truth for all projects/themes; queryable by theme, slug; build fails loudly on malformed entries.
- **Tech Sheet Generator** — pure functions producing per-project structured metadata (concepts, complexity where derivable, LOC, dependencies); supports per-project manual overrides.
- **Reflection Loader** — convention-based MDX loader; missing reflection renders the card without the section.
- **Source File Server** — convention-based serving of original `.py` files as static assets; same paths drive both the in-page Code Viewer and the "download original" link.
- **Algorithm Visualization Runtime** — generic shell driving a per-algorithm step generator and a per-algorithm renderer. Built-in controls: play, pause, step-forward, step-backward, scrub, reset, speed adjustment. Used by Hanoi, Quicksort, Scan, BFS, Crypto, Cities-sort.
- **Interactive Demo Runtime** — generic canvas-based shell handling the requestAnimationFrame loop, framerate normalization, canvas sizing, focus/blur lifecycle, mobile detection, automatic mobile fallback to an auto-play loop for keyboard-required demos. Used by Pong, Game of Life, interactive BFS pathfinding.
- **Mobile / Input Adapter** — pure logic deciding whether the current device is touch-only and whether a given demo should engage its mobile fallback. Consumed by the Interactive Demo Runtime.
- **Code Viewer** — server-rendered syntax-highlighted code blocks (Shiki at build time, no client highlighter shipped). Single-file and multi-file (tabbed) variants.
- **Project Card / Project Page** — composition of all the above into the canonical project layout.
- **Theme Page** — lists all projects in a theme with the theme's framing.
- **Course Page** — lists all themes; landing for `/courses/intro-to-programming/`.
- **Site Shell** — header, footer (with the academic-integrity acknowledgement line), navigation, accent color, responsive layout.
- **Image Asset Pipeline** — build-time `sharp`-based script converting `.tiff` → `.webp` at multiple responsive widths with content-hashed filenames; build fails on missing referenced assets.
- **Checkpoint Timeline** — tabs/timeline UI for projects with multiple checkpoint versions (e.g., Pong's `atari_pong` → final progression).
- **Hanoi Step Generator + Renderer** — recursive step generator producing immutable peg-state snapshots; canvas renderer drawing pegs and disks. Tracer bullet #1.
- **Pong Game Logic + Renderer** — paddle physics, ball physics, collision detection, game-over state machine; pure-function physics core; canvas renderer. Tracer bullet #2.

### Decisions deliberately made and locked
- **Aesthetic:** Minimalist, single accent color (specific accent deferred to first design pass; will propose 2–3 options).
- **Mobile policy:** Per-demo. Keyboard-required demos (Pong) auto-play a loop on mobile with a "best on desktop" hint. Demos where touch substitutes one-to-one for mouse (Game of Life clicks, BFS click-set-vertex, Hanoi has no input) work on touch without special handling.
- **Authorship of reflections:** Drafted by the agent from source code and the author's existing 2018 notes; edited by the author into final voice. No attribution required on the public site.
- **Academic integrity:** Honest, quiet footer line acknowledging the work originated as Dartmouth COSC 1 coursework in 2018 and is presented here as personal portfolio of authored work.
- **Tracer bullet sequence:** Hanoi (#1) — exercises every reusable pattern at smallest scope. Pong (#2) — proves the Interactive Demo Runtime. Subsequent projects parallelizable once both runtimes are stable.
- **Existing portfolios:** Not used as precedent. The `composition-portfolio/` directory in the user's archive is explicitly out of scope as an aesthetic or structural reference.
- **Pyodide:** Not in initial scope. Default for in-scope projects is JavaScript reimplementation. Pyodide may be revisited later if a specific project clearly benefits from running its original Python.

### Confirmed and surfaced asset notes
- **Campus map base image:** `foco_thayer.tiff` is the annotated Dartmouth campus map used for the BFS pathfinding lab.
- **Vertex data:** Available in `vertices.txt`. Adjacency edges need to be reconstructed manually; deferred to the BFS pathfinding implementation.
- **Cities data:** Original `world_cities.txt` not present; reconstructable from any of the existing output files (`cities_alpha.txt`, `cities_population.txt`, `cities_latitude.txt`).
- **Suffix array helper:** `suffix_array.py` not present; will need reimplementation when the Text Analysis project is built.
- **Text Analysis corpora:** `jellyfish-GFP-gene`, `moby-dick.txt`, `Michelle.txt`, `Melania.txt`, `mouse-chromosome-1` — all referenced by `analyze_text.py` but not present; sourcing deferred to that project's slot.

## Testing Decisions

### What makes a good test
- Tests assert observable behavior at a module's external interface only.
- Tests do not couple to internal state, private helpers, or implementation details.
- A test should still pass after a refactor that preserves behavior.
- Where determinism is needed (e.g., Pong physics), inputs include explicit seeds; tests don't rely on `Math.random` or system time.
- Snapshot-style tests are acceptable for stable structured outputs (e.g., Hanoi step sequences, Tech Sheet outputs) — provided the snapshot is reviewed thoughtfully on update.

### Modules with tests (the eight deep modules)
1. **Project Registry** — given a content tree, queries return the expected projects and themes; malformed entries cause loud, descriptive failures; ordering within themes is preserved.
2. **Tech Sheet Generator** — given source code (and optional overrides), the generated metadata matches expectations; manual overrides correctly take precedence over inferred values.
3. **Algorithm Visualization Runtime** — play/pause/step state transitions; speed control; bounded scrubbing within step range; reset returns to the initial state; stepping past the end is a no-op.
4. **Interactive Demo Runtime** — RAF loop pauses on tab blur and resumes on focus; mobile fallback engages when the input adapter signals it; lifecycle cleanup releases all listeners and animation frames.
5. **Mobile / Input Adapter** — touch detection, viewport-size decisions, fallback engagement decisions across realistic input combinations (touch desktop, mouse mobile, no-touch with narrow viewport, etc.).
6. **Hanoi Step Generator** — given (n, source, dest), the step sequence has length 2ⁿ−1; every step is a legal Hanoi move (smaller-on-larger only); final state matches the expected destination configuration; works correctly for n=1 through n=8.
7. **Pong Physics core** — paddle stays within screen bounds; ball-paddle collision reverses x-velocity and offsets to avoid sticking; ball-wall collision reverses y-velocity; scoring trigger fires when ball exits beyond paddle; given a seed, sequence is deterministic.
8. **Image Asset Pipeline** — given TIFF input fixtures, WebP outputs at expected widths exist; output filenames include a content hash; identical inputs produce identical hashes.

### Modules NOT unit-tested (verified manually or via light visual checks)
- Code Viewer, Project Card, Theme Page, Course Page, Site Shell, Checkpoint Timeline, Reflection Loader. These are UI layout / composition modules — low value-per-test, high churn. Visual regression tests may be added later if the surface starts churning unexpectedly.

### Prior art
- None in this repository (greenfield). The standard Next.js + TypeScript ecosystem testing stack is recommended: Vitest for unit tests of pure logic and runtime modules; React Testing Library reserved for any later component-level behavior tests.

## Out of Scope

- **Multi-course landing page IA** and discipline-grouped browsing. Deferred until at least one additional course has been added to the portfolio.
- **The other 21 courses** (Composition I and II, Computational Methods, Digital Electronics, Discrete & Probabilistic Systems, Distributed Systems and Fields, Embedded Systems, Engineering Design Methodology I and II, Fourier Transforms, FYSEP 2017, General Chemistry Lab, Global Sounds, Introduction to Engineering, Moral Philosophy, ML & Statistical Data Analysis, Mechatronics, Problem Solving via OOP, Race and Ethnicity, Solid Mechanics).
- **Custom domain registration and DNS configuration.** Deferred to before the first public deploy.
- **Visitor analytics** (Plausible, Cloudflare Web Analytics, GoatCounter, etc.). Privacy-friendly default of no tracking on initial deploy.
- **Contact form** with server-side submission handling. A plain `mailto:` link or inline contact info is sufficient.
- **Pyodide-based execution** of the original Python code in-browser. Default is JavaScript reimplementation; Pyodide may be revisited later for specific projects.
- **Comments, reactions, or any user-generated content.**
- **Authentication or any private/gated content.**
- **A CMS or admin UI** for editing content. Content is edited via the filesystem and committed via git.
- **Internationalization / multi-language support.**
- **Migration to Vercel.** The option is preserved (the static export ports trivially), but no migration work in this scope.
- **Reimplementation of `suffix_array.py`** and **sourcing of the `analyze_text` text corpora**. Deferred until that project's implementation slot.
- **Reconstruction of `dartmouth_graph.txt` adjacency data.** Deferred to the BFS pathfinding implementation slot. Vertex coordinates are available in `vertices.txt`; `foco_thayer.tiff` is confirmed as the base map.
- **Reconstruction of `world_cities.txt`** from the existing output files. Deferred to the cities-sorting project slot.
- **Accent color selection.** Deferred to first design pass; agent will propose 2–3 options.
- **Visual regression testing infrastructure** (e.g., Playwright + screenshot diffs). Deferred until the UI surface stabilizes.
- **Migration of the `composition-portfolio/` HTML files** into this site. Out of scope; explicitly not used as precedent.

## Further Notes

- **Reframe acknowledgment.** Late in the planning conversation, the user explicitly de-emphasized chronology and curricular framing in favor of an outcome-focused presentation. The portfolio reads as "here is what I built and what it does," not "here is my growth journey through coursework." Themes are outcome-focused; the lab-vs-short-assignment distinction has been intentionally dropped.
- **Greenfield aesthetic.** A `composition-portfolio/` directory exists in the user's submission archive. The user explicitly directed not to use it as a precedent for either structure or visual design.
- **Source folder location.** All FA18 submissions live at `C:\Users\akwasiakosah\Downloads\Submissions extracted\Submissions copy\Introduction to Programming and Computation (FA18)\`. The folder contains 100+ files including duplicates from re-downloads (`-1`, `-2` suffixes) and three nested folders (`lab_2/`, `lab2_extra/`, `extra_credit/`). Duplicates collapse into a single canonical project entry; nested folder contents are de-duplicated against the loose root files.
- **`cs1lib`.** The Dartmouth-specific wrapper around `pyglet` used by all the graphical projects (Pong, Game of Life, Logo turtle, string art, eggs and ham, BFS map plot, cities visualization). The original Python is not designed to run in a browser, which is the practical reason JavaScript reimplementation is the chosen path rather than Pyodide.
- **Authorship of original work.** Author is named in many file headers (Akwasi Akosah / Akwasi D. Akosah / Akwasi). Authorship is unambiguous; no rights or attribution issues anticipated.
- **Authorship of reflections.** Reflections are drafted by the agent and edited by the author into final voice. No attribution disclaimer required on the public site; this is a normal authoring workflow.
- **Why Hanoi as tracer bullet.** It is the smallest possible scope that exercises every reusable pattern: the project card layout, the Code Viewer, the Algorithm Visualization Runtime, the Reflection workflow, the Tech Sheet Generator, the Image Asset Pipeline (for the legacy `solve_hanoi_output.tiff`), the build-and-deploy pipeline, and the per-project content directory convention. Once Hanoi ships, every subsequent algorithm visualization is a step generator + renderer plug-in to existing infrastructure.
- **Why Pong as second.** It validates the Interactive Demo Runtime, mobile fallback policy, and checkpoint-timeline UI (the `atari_pong` paddle-only checkpoint → full game). After Pong, both runtimes are battle-tested and remaining projects can be parallelized.
- **Future PRDs.** When ready, separate PRDs will cover: multi-course landing IA, individual additional courses, optional Vercel migration, custom domain rollout, optional Pyodide integration, and any major aesthetic redesign.
