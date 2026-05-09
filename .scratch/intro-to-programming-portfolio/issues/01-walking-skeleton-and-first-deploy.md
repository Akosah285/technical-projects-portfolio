---
Status: needs-triage
Type: HITL
---

# Walking skeleton + first GitHub Pages deploy

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A minimal Next.js (App Router) + TypeScript application configured for static export, wired to the existing GitHub repository `Akosah285/technical-projects-portfolio`, deployed to GitHub Pages, and reachable at the Pages URL with a placeholder landing page that says the portfolio is being built.

This slice exists to de-risk the deployment pipeline before any real content is written. The walking skeleton must successfully traverse: local dev → static export → CI build → Pages publish → live HTTPS URL.

The repository should be initialized locally first (Next.js scaffold, Tailwind, shadcn/ui primitives, basic project structure, `.gitignore`, `AGENTS.md` with the working agreement). Commits land freely even while in-progress. Pages enablement is attempted via `gh` CLI; if it requires a Settings-UI click, loop the human in.

## Acceptance criteria

- [ ] Local dev server runs without errors
- [ ] `next build` produces a static export with `output: 'export'`, `trailingSlash: true`, and correctly configured `basePath` / `assetPrefix` for GitHub Pages
- [ ] Repository is wired to `Akosah285/technical-projects-portfolio` (remote configured, initial push succeeds)
- [ ] Tailwind and shadcn/ui are installed and a single shadcn primitive is used on the landing page to prove the styling pipeline works
- [ ] `AGENTS.md` exists at the repo root documenting the working agreement (build locally first, commit freely, single repo for site + content + sources)
- [ ] `.gitignore` covers `node_modules`, build outputs, `.next/`, `out/`; `.scratch/` is *not* ignored (PRD and issues live there)
- [ ] A GitHub Actions workflow builds the static export and deploys to Pages on push to the default branch
- [ ] The live Pages URL serves a placeholder landing page over HTTPS
- [ ] A 404 page exists and renders correctly under the `basePath`
- [ ] No SSR, API routes, middleware, or ISR present in the configuration

## Blocked by

None — can start immediately
