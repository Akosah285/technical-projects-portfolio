"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Sketch,
  contains,
  createShape,
  moveBy,
  setColor,
  setCorners,
  type Shape,
  type ShapeType,
} from "@/lib/projects/sketchEditor/sketchEditor";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 460;

const COLORS: Array<{ hex: string; label: string }> = [
  { hex: "#0f172a", label: "Slate" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#f9fafb", label: "Paper" },
];

type Mode = "draw" | "move" | "recolor" | "delete";

const MODE_HINT: Record<Mode, string> = {
  draw: "Click and drag to draw a new shape with the selected tool and colour.",
  move: "Click any shape and drag it to a new position.",
  recolor: "Click any shape to repaint it with the currently-selected colour.",
  delete: "Click any shape to delete it.",
};

interface DragState {
  kind: "draw" | "move";
  shapeId: number;
  /** For DRAW: the original anchor point. For MOVE: the previous mouse position. */
  refX: number;
  refY: number;
}

function shapeToSvg(shape: Shape) {
  switch (shape.type) {
    case "ellipse": {
      const cx = (shape.x1 + shape.x2) / 2;
      const cy = (shape.y1 + shape.y2) / 2;
      const rx = Math.max(0.5, (shape.x2 - shape.x1) / 2);
      const ry = Math.max(0.5, (shape.y2 - shape.y1) / 2);
      return (
        <ellipse
          key={shape.id}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={shape.color}
          stroke="#0f172a"
          strokeWidth={0.5}
        />
      );
    }
    case "rectangle": {
      return (
        <rect
          key={shape.id}
          x={shape.x1}
          y={shape.y1}
          width={Math.max(0.5, shape.x2 - shape.x1)}
          height={Math.max(0.5, shape.y2 - shape.y1)}
          fill={shape.color}
          stroke="#0f172a"
          strokeWidth={0.5}
        />
      );
    }
    case "segment": {
      return (
        <line
          key={shape.id}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
          stroke={shape.color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    }
  }
}

export function SketchEditorPlayer() {
  const [sketch, setSketch] = useState(new Sketch());
  const [history, setHistory] = useState<Sketch[]>([]);
  const [mode, setMode] = useState<Mode>("draw");
  const [tool, setTool] = useState<ShapeType>("ellipse");
  const [color, setColor_] = useState(COLORS[1].hex);
  const [drag, setDrag] = useState<DragState | null>(null);

  const canvasRef = useRef<SVGSVGElement | null>(null);

  const pushHistory = useCallback((next: Sketch) => {
    setHistory((h) => [...h, sketch]);
    setSketch(next);
  }, [sketch]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setSketch(last);
      return h.slice(0, -1);
    });
  }, []);

  const clear = useCallback(() => {
    pushHistory(new Sketch());
  }, [pushHistory]);

  const getCanvasPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getCanvasPoint(e);

    if (mode === "draw") {
      const newShape = createShape(tool, x, y, color);
      const next = sketch.add(newShape);
      pushHistory(next);
      setDrag({ kind: "draw", shapeId: newShape.id, refX: x, refY: y });
      return;
    }

    const top = sketch.topMost(x, y);
    if (!top) return;

    if (mode === "move") {
      // Don't push history for the move start — we'll push when the drag ends.
      setDrag({ kind: "move", shapeId: top.id, refX: x, refY: y });
    } else if (mode === "recolor") {
      pushHistory(sketch.updateById(top.id, (s) => setColor(s, color)));
    } else if (mode === "delete") {
      pushHistory(sketch.removeById(top.id));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag) return;
    const { x, y } = getCanvasPoint(e);

    if (drag.kind === "draw") {
      setSketch((s) =>
        s.updateById(drag.shapeId, (shape) => setCorners(shape, drag.refX, drag.refY, x, y)),
      );
    } else {
      const dx = x - drag.refX;
      const dy = y - drag.refY;
      setSketch((s) => s.updateById(drag.shapeId, (shape) => moveBy(shape, dx, dy)));
      setDrag({ ...drag, refX: x, refY: y });
    }
  };

  const handleMouseUp = () => {
    setDrag(null);
  };

  const cursor = useMemo(() => {
    if (mode === "draw") return "crosshair";
    if (mode === "move") return "grab";
    return "pointer";
  }, [mode]);

  const hoveredHint = useMemo(() => {
    return `${sketch.size()} shape${sketch.size() === 1 ? "" : "s"} on canvas`;
  }, [sketch]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-slate-100">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sketch editor</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-300">
            The single-client core of PS_6 — pick a tool and a colour, then
            draw, move, recolour, or delete shapes. Hit-testing for each shape
            type matches the Java original (ellipse uses the closed-form ellipse
            equation, segments use 3-pixel point-to-segment distance).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:border-sky-500 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={sketch.size() === 0}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:border-rose-500 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mode</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {(["draw", "move", "recolor", "delete"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg border px-2 py-1 text-xs capitalize ${
                  mode === m
                    ? "border-sky-500 bg-sky-500/20 text-sky-200"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tool</p>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {(["ellipse", "rectangle", "segment"] as ShapeType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                disabled={mode !== "draw"}
                className={`rounded-lg border px-2 py-1 text-xs capitalize ${
                  tool === t && mode === "draw"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                } disabled:opacity-40`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Colour</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor_(c.hex)}
                aria-label={c.label}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  color === c.hex ? "border-white" : "border-slate-700"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">{MODE_HINT[mode]}</p>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-white">
        <svg
          ref={canvasRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor, width: "100%", height: "auto", display: "block" }}
        >
          {sketch.shapes.map(shapeToSvg)}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>{hoveredHint}</span>
        <span>
          The original PS_6 wired this same model through a TCP server so multiple
          clients could draw on a shared sketch. Here it&apos;s a single client.
        </span>
      </div>
    </div>
  );
}

// keep the unused-import lint quiet — `contains` is used implicitly through Sketch.topMost
void contains;
