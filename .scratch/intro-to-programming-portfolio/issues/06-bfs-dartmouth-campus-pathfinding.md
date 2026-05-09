---
Status: needs-triage
Type: AFK
---

# Cities & Maps — BFS Dartmouth campus pathfinding

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A project page at `/courses/intro-to-programming/cities-and-maps/bfs-dartmouth-campus/` with a hybrid demo: the visitor sees the annotated Dartmouth campus base map (`foco_thayer.tiff` → WebP) overlaid with the campus graph vertices. They click a start vertex and a goal vertex; the BFS frontier animates outward across the graph, and once the goal is reached the shortest path highlights along the campus map.

This slice exercises both the Algorithm Visualization Runtime (the animated BFS frontier expansion + path replay) and the Interactive Demo Runtime (click handling, mouse / touch input via the Mobile/Input Adapter), making it the first project that uses both runtimes together.

Vertex coordinates come from the existing `vertices.txt`. Edge adjacency is reconstructed manually for this slice and shipped as a JSON data file alongside the project. Sources: `bfs.py`, `lab_3_checkpoint.py`, `vertex.py`, `load_graph.py`, `map_plot.py`.

## Acceptance criteria

- [ ] Project page renders with the full project-card layout
- [ ] Campus base map (`foco_thayer.tiff`) is converted via the Image Asset Pipeline to responsive WebP and serves as the background
- [ ] Campus graph vertices are overlaid on the map at their correct coordinates from `vertices.txt`
- [ ] Adjacency data is reconstructed manually and committed as a JSON data file
- [ ] Visitor can click (or tap on touch devices) a start vertex and a goal vertex
- [ ] BFS visibly animates the frontier expansion across the graph, then highlights the shortest path on goal reach
- [ ] Reset clears the selection and lets the visitor pick a new pair
- [ ] Touch interaction works on mobile (clicks substitute one-to-one for taps)
- [ ] All four `.py` source files are downloadable from `/sources/intro-to-programming/bfs-dartmouth-campus/`
- [ ] Reflection drafted and edited; tech sheet auto-generated
- [ ] Theme page lists this project alongside the city-sort and visualize-cities projects
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
- 03-pong-tracer-bullet.md
