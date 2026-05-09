"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { publicPath } from "@/lib/site/publicPath";
import { bfsTrace, type CampusGraph, type BfsStep } from "@/lib/projects/bfs/bfsTrace";

interface CampusVertex {
  name: string;
  x: number;
  y: number;
  adjacent: string[];
}

interface CampusGraphFile {
  width: number;
  height: number;
  vertices: CampusVertex[];
}

const STEP_INTERVAL_MS = 350;

export function BfsCampusPlayer() {
  const [graph, setGraph] = useState<CampusGraphFile | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(publicPath("/data/intro-to-programming/bfs-dartmouth-campus/campus-graph.json"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CampusGraphFile>;
      })
      .then((data) => {
        if (cancelled) return;
        setGraph(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(`Could not load the campus graph: ${e instanceof Error ? e.message : String(e)}`);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const adjacency: CampusGraph = useMemo(() => {
    if (!graph) return {};
    const out: CampusGraph = {};
    for (const v of graph.vertices) out[v.name] = v.adjacent;
    return out;
  }, [graph]);

  const vertexByName = useMemo(() => {
    const m = new Map<string, CampusVertex>();
    if (graph) for (const v of graph.vertices) m.set(v.name, v);
    return m;
  }, [graph]);

  const trace: BfsStep[] = useMemo(() => {
    if (!graph || !start || !goal) return [];
    return bfsTrace(adjacency, start, goal);
  }, [graph, start, goal, adjacency]);

  useEffect(() => {
    if (!isPlaying || trace.length === 0) return;
    if (stepIndex >= trace.length - 1) return;
    intervalRef.current = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, trace.length - 1));
    }, STEP_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, trace.length, stepIndex]);

  const currentStep: BfsStep | null = trace[stepIndex] ?? null;
  const visitedSet = useMemo(() => new Set(currentStep?.visited ?? []), [currentStep]);
  const frontierSet = useMemo(() => new Set(currentStep?.frontier ?? []), [currentStep]);
  const path = currentStep?.path ?? [];

  function handleVertexClick(name: string) {
    if (start === null) {
      setStart(name);
      setStepIndex(0);
      setIsPlaying(true);
    } else if (goal === null && name !== start) {
      setGoal(name);
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setStart(name);
      setGoal(null);
      setStepIndex(0);
      setIsPlaying(true);
    }
  }

  function handleReset() {
    setStart(null);
    setGoal(null);
    setStepIndex(0);
    setIsPlaying(true);
  }

  if (error) {
    return (
      <section className="rounded-md border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </section>
    );
  }
  if (!graph) {
    return (
      <section className="rounded-md border border-foreground/10 p-4 text-sm text-foreground/60">
        Loading campus graph…
      </section>
    );
  }

  const w = graph.width;
  const h = graph.height;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Campus map</h2>
        <p className="text-sm text-foreground/70">
          Click a landmark to set the <strong>start</strong>, then click another for the{" "}
          <strong>goal</strong>. The BFS frontier expands outward from the start, and the shortest
          path lights up once the goal is reached.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-md bg-foreground/5 px-2 py-1">
            <strong>Start:</strong> {start ?? "—"}
          </span>
          <span className="rounded-md bg-foreground/5 px-2 py-1">
            <strong>Goal:</strong> {goal ?? "—"}
          </span>
          {trace.length > 0 && (
            <span className="rounded-md bg-foreground/5 px-2 py-1">
              <strong>Step:</strong> {stepIndex + 1} / {trace.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5"
          >
            Reset
          </button>
          {trace.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={stepIndex >= trace.length - 1}
              className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
            >
              {isPlaying && stepIndex < trace.length - 1 ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-foreground/15 bg-foreground/5">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="block w-full h-auto"
          role="img"
          aria-label="Dartmouth campus map with BFS pathfinding overlay"
        >
          <image
            href={publicPath("/images/intro-to-programming/bfs-dartmouth-campus/campus-map.webp")}
            x={0}
            y={0}
            width={w}
            height={h}
            opacity={0.45}
            preserveAspectRatio="none"
          />
          <rect x={0} y={0} width={w} height={h} fill="#0a0a0a" opacity={0.25} />

          {graph.vertices.map((v) =>
            v.adjacent.map((adjName) => {
              const adj = vertexByName.get(adjName);
              if (!adj) return null;
              if (v.name >= adjName) return null;
              const onPath =
                path.includes(v.name) &&
                path.includes(adjName) &&
                Math.abs(path.indexOf(v.name) - path.indexOf(adjName)) === 1;
              return (
                <line
                  key={`${v.name}-${adjName}`}
                  x1={v.x}
                  y1={v.y}
                  x2={adj.x}
                  y2={adj.y}
                  stroke={onPath ? "#ef4444" : "#94a3b8"}
                  strokeWidth={onPath ? 6 : 1.5}
                  opacity={onPath ? 1 : 0.55}
                />
              );
            }),
          )}

          {graph.vertices.map((v) => {
            const isStart = v.name === start;
            const isGoal = v.name === goal;
            const isOnPath = path.includes(v.name);
            const isVisited = visitedSet.has(v.name);
            const isFrontier = frontierSet.has(v.name);
            const fill = isStart
              ? "#22c55e"
              : isGoal
                ? "#ef4444"
                : isOnPath
                  ? "#f97316"
                  : isFrontier
                    ? "#facc15"
                    : isVisited
                      ? "#a78bfa"
                      : "#38bdf8";
            const radius = isStart || isGoal || isOnPath ? 10 : isFrontier ? 8 : 6;
            return (
              <g key={v.name} onClick={() => handleVertexClick(v.name)} style={{ cursor: "pointer" }}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={radius + 2}
                  fill="white"
                  opacity={0.85}
                />
                <circle cx={v.x} cy={v.y} r={radius} fill={fill} stroke="#0a0a0a" strokeWidth={1} />
                {(isStart || isGoal || isOnPath) && (
                  <text
                    x={v.x}
                    y={v.y - 14}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={600}
                    fill="#0a0a0a"
                    stroke="white"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {v.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {currentStep && (
        <p className="text-sm text-foreground/70">
          <strong>Status:</strong> {currentStep.label}
        </p>
      )}

      {path.length > 0 && (
        <p className="text-sm">
          <strong>Shortest path:</strong> {path.join(" → ")}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#22c55e]" /> Start
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#ef4444]" /> Goal
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#facc15]" /> In BFS frontier
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#a78bfa]" /> Visited
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#f97316]" /> On shortest path
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#38bdf8]" /> Unvisited
        </li>
      </ul>

      <p className="text-xs text-foreground/50">
        Vertex coordinates and adjacency come from the original{" "}
        <code>vertices.txt</code> output of <code>lab_3_checkpoint.py</code> — 79 landmarks across
        the Dartmouth campus.
      </p>
    </section>
  );
}
