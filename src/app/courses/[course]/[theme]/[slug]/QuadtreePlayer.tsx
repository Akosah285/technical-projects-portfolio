"use client";

import { useMemo, useState } from "react";
import {
  PointQuadtree,
  type QuadPoint,
} from "@/lib/projects/quadtree/quadtree";

const W = 480;
const H = 320;

interface SeedPoint extends QuadPoint {
  id: number;
}

const SEED_LAYOUTS: Record<string, SeedPoint[]> = {
  scattered: [
    { id: 1, x: 100, y: 80 },
    { id: 2, x: 350, y: 60 },
    { id: 3, x: 200, y: 200 },
    { id: 4, x: 80, y: 250 },
    { id: 5, x: 410, y: 230 },
    { id: 6, x: 240, y: 100 },
    { id: 7, x: 320, y: 180 },
    { id: 8, x: 150, y: 150 },
  ],
  dense: [
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 130, y: 90 },
    { id: 3, x: 160, y: 110 },
    { id: 4, x: 90, y: 140 },
    { id: 5, x: 140, y: 150 },
    { id: 6, x: 350, y: 220 },
    { id: 7, x: 380, y: 210 },
    { id: 8, x: 360, y: 250 },
    { id: 9, x: 410, y: 240 },
  ],
  empty: [],
};

export function QuadtreePlayer() {
  const [points, setPoints] = useState<SeedPoint[]>(SEED_LAYOUTS.scattered);
  const [showRectangles, setShowRectangles] = useState(true);
  const [queryX, setQueryX] = useState(240);
  const [queryY, setQueryY] = useState(160);
  const [queryR, setQueryR] = useState(60);
  const [nextId, setNextId] = useState(SEED_LAYOUTS.scattered.length + 1);

  const tree = useMemo(() => {
    if (points.length === 0) return null;
    const root = new PointQuadtree<SeedPoint>(points[0], 0, 0, W, H);
    for (let i = 1; i < points.length; i++) root.insert(points[i]);
    return root;
  }, [points]);

  const inCircle = useMemo(() => {
    if (!tree) return [];
    return tree.findInCircle(queryX, queryY, queryR);
  }, [tree, queryX, queryY, queryR]);

  const inCircleIds = useMemo(() => new Set(inCircle.map((p) => p.id)), [inCircle]);

  const rectangles = useMemo(() => {
    if (!tree) return [];
    const rs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    tree.walk((node) => rs.push(node.getBounds()));
    return rs;
  }, [tree]);

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = W / rect.width;
    const sy = H / rect.height;
    const x = Math.round((e.clientX - rect.left) * sx);
    const y = Math.round((e.clientY - rect.top) * sy);
    setPoints((prev) => [...prev, { id: nextId, x, y }]);
    setNextId((n) => n + 1);
  }

  function loadLayout(slug: string) {
    const layout = SEED_LAYOUTS[slug] ?? [];
    setPoints(layout);
    setNextId(layout.length + 1);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Layout</span>
          <div className="flex gap-2">
            {(Object.keys(SEED_LAYOUTS) as Array<keyof typeof SEED_LAYOUTS>).map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => loadLayout(slug)}
                className="rounded border border-zinc-300 px-2 py-1 text-xs capitalize hover:border-zinc-500 dark:border-zinc-700"
              >
                {slug}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Query x: {queryX}</span>
          <input
            type="range"
            min={0}
            max={W}
            value={queryX}
            onChange={(e) => setQueryX(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Query y: {queryY}</span>
          <input
            type="range"
            min={0}
            max={H}
            value={queryY}
            onChange={(e) => setQueryY(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Radius: {queryR}</span>
          <input
            type="range"
            min={10}
            max={200}
            value={queryR}
            onChange={(e) => setQueryR(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showRectangles}
            onChange={(e) => setShowRectangles(e.target.checked)}
          />
          <span className="text-xs uppercase tracking-wider text-zinc-500">Show subdivisions</span>
        </label>
      </div>

      <p className="text-sm text-foreground/70">
        Click anywhere on the canvas to drop another point. Each new point gets routed into the
        quadrant of the existing tree that contains it. The yellow circle is a range query — it
        highlights every point inside it, found by descending only the quadtree branches whose
        rectangles intersect the circle.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full max-w-[640px] cursor-crosshair rounded border border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={handleSvgClick}
      >
        {showRectangles &&
          rectangles.map((r, i) => (
            <rect
              key={i}
              x={r.x1}
              y={r.y1}
              width={r.x2 - r.x1}
              height={r.y2 - r.y1}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={0.5}
              opacity={0.6}
            />
          ))}

        <circle
          cx={queryX}
          cy={queryY}
          r={queryR}
          fill="rgba(250, 204, 21, 0.18)"
          stroke="#facc15"
          strokeWidth={2}
          pointerEvents="none"
        />

        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={inCircleIds.has(p.id) ? 6 : 4}
            fill={inCircleIds.has(p.id) ? "#facc15" : "#3b82f6"}
            stroke="#1e293b"
            strokeWidth={1}
            pointerEvents="none"
          />
        ))}
      </svg>

      <div className="text-sm text-foreground/70">
        <strong>{points.length}</strong> point{points.length === 1 ? "" : "s"} •{" "}
        <strong>{inCircle.length}</strong> inside the query circle •{" "}
        <strong>{rectangles.length}</strong> rectangle{rectangles.length === 1 ? "" : "s"} drawn
      </div>

      <details className="rounded border border-zinc-200 px-4 py-3 text-sm text-foreground/80 dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">How the quadtree speeds up the search</summary>
        <div className="mt-3 space-y-2">
          <p>
            Each node in the quadtree anchors a single point and partitions its rectangle into four
            quadrants around that anchor. New points descend until they find an empty quadrant, at
            which point a leaf is created with a tighter rectangle.
          </p>
          <p>
            <strong>findInCircle</strong> exploits the tree by checking, at each node, whether the
            query circle intersects the node&apos;s rectangle at all. If it doesn&apos;t, the entire
            subtree is skipped — no descendant point can possibly be inside. With many points this
            turns an O(n) scan into something close to O(log n).
          </p>
        </div>
      </details>
    </section>
  );
}
