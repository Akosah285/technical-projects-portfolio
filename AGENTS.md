<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Working agreement

This is Akwasi's personal technical portfolio. Source material is the academic submissions in `C:\Users\akwasiakosah\Downloads\Submissions extracted\Submissions copy\`. The first course in scope is **Introduction to Programming and Computation (FA18)**.

## How we work

- **Build locally first.** Run `npm run dev` and `npm test` before pushing. Don't push broken builds, but it's fine to push work-in-progress that compiles.
- **Single repo for site, content, and original sources.** Original `.py` files are copied into `public/sources/<course-slug>/<project-slug>/` and served as static assets.
- **Static export only.** No SSR, no API routes, no middleware, no ISR. Hosted on GitHub Pages.
- **TDD for deep modules.** The eight modules called out in `.scratch/intro-to-programming-portfolio/PRD.md` get unit tests; UI composition modules don't.
- **Tests verify behavior through public interfaces.** Never test private functions or internal state.

## Project tracker

PRD and issues live as markdown under `.scratch/<feature-slug>/`:

- PRD: `.scratch/<feature-slug>/PRD.md`
- Issues: `.scratch/<feature-slug>/issues/<NN>-<slug>.md` (numbered from 01)
- Each file has a `Status:` line near the top.
- Comments append at the bottom under a `## Comments` heading.

The `.scratch/` directory is **committed** to the repo (not ignored) so the planning artifacts stay alongside the code.

## Conventions

- TypeScript everywhere.
- Tailwind for styling; shadcn/ui primitives where they help.
- Vitest for unit tests; co-locate `*.test.ts` next to source.
- Site footer carries the academic-integrity acknowledgement: "Originally from Dartmouth COSC 1, FA18; reimplemented and presented as personal portfolio."
- URL structure: `/courses/<course-slug>/<theme-slug>/<project-slug>/` with trailing slashes.
