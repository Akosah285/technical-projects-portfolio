"use client";

import { useMemo, useState } from "react";
import {
  averageSeparation,
  bfs,
  getPath,
  Graph,
  missingVertices,
} from "@/lib/projects/kevinBacon/kevinBacon";

interface ActorPos {
  name: string;
  x: number;
  y: number;
}

interface Dataset {
  slug: string;
  name: string;
  description: string;
  actors: ActorPos[];
  edges: Array<{ a: string; b: string; movies: string[] }>;
  defaultCenter: string;
}

const TINY: Dataset = {
  slug: "tiny",
  name: "Tiny test dataset",
  description: "The exact graph from PS_4_test_1 — six actors plus a disconnected pair.",
  actors: [
    { name: "Kevin Bacon", x: 380, y: 60 },
    { name: "Alice", x: 200, y: 130 },
    { name: "Bob", x: 380, y: 180 },
    { name: "Charlie", x: 380, y: 280 },
    { name: "Dartmouth (Earl thereof)", x: 220, y: 320 },
    { name: "Nobody", x: 600, y: 100 },
    { name: "Nobody's Friend", x: 600, y: 220 },
  ],
  edges: [
    { a: "Kevin Bacon", b: "Bob", movies: ["A movie"] },
    { a: "Kevin Bacon", b: "Alice", movies: ["A movie"] },
    { a: "Alice", b: "Bob", movies: ["A movie"] },
    { a: "Bob", b: "Charlie", movies: ["C movie"] },
    { a: "Charlie", b: "Dartmouth (Earl thereof)", movies: ["B movie"] },
    { a: "Nobody", b: "Nobody's Friend", movies: ["F movie"] },
  ],
  defaultCenter: "Kevin Bacon",
};

const HOLLYWOOD: Dataset = {
  slug: "hollywood",
  name: "Six degrees of Hollywood",
  description: "A small curated graph of well-known actors and the films that link them.",
  actors: [
    { name: "Kevin Bacon", x: 80, y: 200 },
    { name: "Tom Hanks", x: 230, y: 90 },
    { name: "Meg Ryan", x: 380, y: 60 },
    { name: "Tim Robbins", x: 230, y: 320 },
    { name: "Morgan Freeman", x: 410, y: 330 },
    { name: "Brad Pitt", x: 560, y: 220 },
    { name: "Edward Norton", x: 700, y: 130 },
    { name: "Helena B. Carter", x: 700, y: 320 },
  ],
  edges: [
    { a: "Kevin Bacon", b: "Tom Hanks", movies: ["Apollo 13"] },
    { a: "Kevin Bacon", b: "Tim Robbins", movies: ["Mystic River"] },
    { a: "Tom Hanks", b: "Meg Ryan", movies: ["You've Got Mail", "Sleepless in Seattle"] },
    { a: "Tim Robbins", b: "Morgan Freeman", movies: ["The Shawshank Redemption"] },
    { a: "Morgan Freeman", b: "Brad Pitt", movies: ["Se7en"] },
    { a: "Brad Pitt", b: "Edward Norton", movies: ["Fight Club"] },
    { a: "Brad Pitt", b: "Helena B. Carter", movies: ["Fight Club"] },
    { a: "Edward Norton", b: "Helena B. Carter", movies: ["Fight Club"] },
  ],
  defaultCenter: "Kevin Bacon",
};

const DATASETS = [TINY, HOLLYWOOD];

function buildGraph(d: Dataset): Graph<string, Set<string>> {
  const g = new Graph<string, Set<string>>();
  for (const a of d.actors) g.insertVertex(a.name);
  for (const e of d.edges) g.insertUndirected(e.a, e.b, new Set(e.movies));
  return g;
}

export function KevinBaconPlayer() {
  const [datasetSlug, setDatasetSlug] = useState(TINY.slug);
  const [center, setCenter] = useState(TINY.defaultCenter);
  const [target, setTarget] = useState<string | null>(null);

  const dataset = DATASETS.find((d) => d.slug === datasetSlug)!;
  const positions = useMemo(() => {
    const map = new Map<string, ActorPos>();
    for (const a of dataset.actors) map.set(a.name, a);
    return map;
  }, [dataset]);

  const graph = useMemo(() => buildGraph(dataset), [dataset]);
  const parents = useMemo(() => bfs(graph, center), [graph, center]);

  const baconNumbers = useMemo(() => {
    const depths = new Map<string, number>();
    if (!parents.has(center)) return depths;
    depths.set(center, 0);
    for (const v of parents.keys()) {
      if (depths.has(v)) continue;
      const chain: string[] = [];
      let cur: string | null = v;
      while (cur !== null && !depths.has(cur)) {
        chain.push(cur);
        cur = parents.get(cur) ?? null;
      }
      let baseDepth = cur !== null ? depths.get(cur)! : 0;
      while (chain.length > 0) {
        baseDepth++;
        depths.set(chain.pop()!, baseDepth);
      }
    }
    return depths;
  }, [parents, center]);

  const path = useMemo(() => (target ? getPath(parents, target) : null), [parents, target]);
  const pathEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (!path) return set;
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b] = [path[i], path[i + 1]].sort();
      set.add(`${a}|${b}`);
    }
    return set;
  }, [path]);

  const missing = useMemo(() => missingVertices(graph, parents).sort(), [graph, parents]);
  const avgSep = useMemo(() => averageSeparation(parents, center), [parents, center]);

  function handleSelectActor(name: string) {
    if (name === center) return;
    setTarget((prev) => (prev === name ? null : name));
  }

  function handleSetCenter(name: string) {
    setCenter(name);
    setTarget(null);
  }

  function handleDataset(slug: string) {
    const d = DATASETS.find((x) => x.slug === slug);
    if (!d) return;
    setDatasetSlug(slug);
    setCenter(d.defaultCenter);
    setTarget(null);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Dataset</span>
          <select
            value={datasetSlug}
            onChange={(e) => handleDataset(e.target.value)}
            className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
          >
            {DATASETS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <div className="text-xs text-foreground/70">
          <span className="uppercase tracking-wider text-zinc-500">Center: </span>
          <strong>{center}</strong>
        </div>

        <div className="text-xs text-foreground/70">
          <span className="uppercase tracking-wider text-zinc-500">Avg separation: </span>
          <strong>{avgSep === 0 ? "—" : avgSep.toFixed(2)}</strong>
        </div>
      </div>

      <p className="text-sm text-foreground/70">{dataset.description}</p>

      <p className="text-sm text-foreground/70">
        Click an actor to highlight the shortest path from them back to the center. Right-click (or
        long-press) an actor to make them the new center. Disconnected actors get an &ldquo;∞&rdquo;
        Bacon number.
      </p>

      <svg
        viewBox="0 0 800 400"
        className="block w-full max-w-[800px] rounded border border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {dataset.edges.map((e, i) => {
          const a = positions.get(e.a);
          const b = positions.get(e.b);
          if (!a || !b) return null;
          const key = [e.a, e.b].sort().join("|");
          const onPath = pathEdgeSet.has(key);
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={onPath ? "#facc15" : "#94a3b8"}
                strokeWidth={onPath ? 4 : 1.5}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 4}
                fontSize={9}
                fill={onPath ? "#a16207" : "#64748b"}
                textAnchor="middle"
              >
                {e.movies.join(", ")}
              </text>
            </g>
          );
        })}

        {dataset.actors.map((a) => {
          const isCenter = a.name === center;
          const isTarget = a.name === target;
          const reachable = parents.has(a.name);
          const onPath = path?.includes(a.name);
          const fill = isCenter
            ? "#3b82f6"
            : onPath
              ? "#facc15"
              : reachable
                ? "#22c55e"
                : "#dc2626";
          return (
            <g
              key={a.name}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelectActor(a.name)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleSetCenter(a.name);
              }}
            >
              <circle
                cx={a.x}
                cy={a.y}
                r={isCenter || isTarget ? 18 : 14}
                fill={fill}
                stroke="#1e293b"
                strokeWidth={1.5}
              />
              <text
                x={a.x}
                y={a.y + 4}
                fontSize={10}
                fill="#fff"
                textAnchor="middle"
                fontWeight="bold"
              >
                {reachable ? baconNumbers.get(a.name) : "∞"}
              </text>
              <text
                x={a.x}
                y={a.y + 32}
                fontSize={11}
                fill="currentColor"
                textAnchor="middle"
              >
                {a.name}
              </text>
            </g>
          );
        })}
      </svg>

      {path && path.length > 1 && (
        <div className="rounded border border-yellow-400 bg-yellow-50 p-3 text-sm dark:bg-yellow-950/30">
          <div className="mb-1 font-medium">
            {path[0]}&apos;s number is {path.length - 1}
          </div>
          <ul className="space-y-1">
            {path.slice(0, -1).map((p, i) => {
              const next = path[i + 1];
              const label = graph.getLabel(p, next);
              return (
                <li key={p} className="text-xs">
                  {p} appeared in [{[...(label ?? new Set())].join(", ")}] with {next}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {target && !path && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm dark:bg-red-950/30">
          {target} is not connected to {center}.
        </div>
      )}

      {missing.length > 0 && (
        <div className="text-xs text-foreground/70">
          <strong>Disconnected from {center}:</strong> {missing.join(", ")}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {dataset.actors.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => handleSetCenter(a.name)}
            className={`rounded border px-2 py-1 text-xs ${
              a.name === center
                ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40"
                : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700"
            }`}
          >
            Center: {a.name}
          </button>
        ))}
      </div>

      <details className="rounded border border-zinc-200 px-4 py-3 text-sm text-foreground/80 dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">How the BFS finds shortest paths</summary>
        <div className="mt-3 space-y-2">
          <p>
            Starting from the center, BFS explores the graph in waves: first the immediate
            neighbors (Bacon number 1), then their neighbors (number 2), and so on. Because each
            vertex is visited the first time at its minimum depth, the parent pointer recorded at
            that visit gives the shortest path.
          </p>
          <p>
            To recover a path, follow parent pointers from any reachable actor back to the center.
            Actors with no parent recorded are in a different connected component — infinitely
            far from the center.
          </p>
        </div>
      </details>
    </section>
  );
}
