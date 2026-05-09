---
Status: needs-triage
Type: AFK
---

# Cities & Maps — Sort cities + Visualize cities (world map)

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

Two projects on the **Cities & Maps** theme page.

- **Sort cities** at `/courses/intro-to-programming/cities-and-maps/sort-cities/` — animated visualization showing cities being sorted along a chosen attribute (alphabetical, by population, by latitude). Visitors choose the sort axis from a small dropdown; the visualization re-runs. Sources: `sort_cities.py`, `read_cities.py`, `city.py`.
- **Visualize cities** at `/courses/intro-to-programming/cities-and-maps/visualize-cities/` — cities plotted as dots on a world-map base image, color-coded by population or another attribute. Source: `visualize_cities.py`.

The world-map base image is `earthicefree.jpg` from `extra_credit/` (decided in PRD as substitute for the missing `world.png`). Cities data is reconstructed from the existing output files (`cities_alpha.txt`, `cities_population.txt`, `cities_latitude.txt`) into a single canonical JSON shipped with the site.

## Acceptance criteria

- [ ] Both project pages render with the full project-card layout
- [ ] Sort cities visualization animates the sort along at least one axis (alphabetical) and supports switching axes
- [ ] Visualize cities plots cities at correct geographic coordinates on the world-map base image; the base image is responsive
- [ ] City data is reconstructed from the existing FA18 output files into a single canonical data file shipped with the site
- [ ] Original `.py` files (`sort_cities.py`, `read_cities.py`, `city.py`, `visualize_cities.py`) are served from the appropriate `/sources/intro-to-programming/<project-slug>/` paths and downloadable
- [ ] World-map base image is converted via the Image Asset Pipeline to responsive WebP variants
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflections drafted and edited for each project
- [ ] Tech sheets auto-generated
- [ ] Theme page lists both projects in a sensible order
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
