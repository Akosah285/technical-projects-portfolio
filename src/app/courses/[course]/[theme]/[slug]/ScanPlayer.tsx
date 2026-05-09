"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  scanTrace,
  type ScanMode,
  type ScanOp,
} from "@/lib/projects/scan/scanTrace";
import {
  playbackInit,
  playbackReducer,
} from "@/lib/runtime/algorithmVisualization/playback";

const DEFAULT_INPUT_PLUS = [3, 6, 2, 1, 4, 7];
const DEFAULT_INPUT_TIMES = [2, 4, 2, 6, 2];
const SVG_WIDTH = 600;
const SVG_HEIGHT = 160;

export function ScanPlayer() {
  const [op, setOp] = useState<ScanOp>("plus");
  const [mode, setMode] = useState<ScanMode>("inclusive");
  const input = useMemo(
    () => (op === "plus" ? DEFAULT_INPUT_PLUS : DEFAULT_INPUT_TIMES),
    [op],
  );
  const trace = useMemo(() => scanTrace(input, op, mode), [input, op, mode]);
  const stepCount = Math.max(0, trace.length - 1);

  const [state, dispatch] = useReducer(playbackReducer, stepCount, playbackInit);

  useEffect(() => {
    dispatch({ type: "reset" });
  }, [trace]);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
      return;
    }
    if (state.index >= state.stepCount) {
      dispatch({ type: "pause" });
      return;
    }

    const intervalMs = 600 / state.speed;
    function tick(now: number) {
      if (lastTickRef.current === null) lastTickRef.current = now;
      if (now - lastTickRef.current >= intervalMs) {
        lastTickRef.current = now;
        dispatch({ type: "step-forward" });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
    };
  }, [state.isPlaying, state.speed, state.index, state.stepCount]);

  const step = trace[Math.min(state.index, trace.length - 1)];
  const cellSize = Math.min(72, (SVG_WIDTH - 40) / Math.max(step.array.length, 1));
  const cellGap = 6;
  const totalWidth = step.array.length * cellSize + (step.array.length - 1) * cellGap;
  const startX = (SVG_WIDTH - totalWidth) / 2;

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Visualization</h2>
        <span className="text-sm tabular-nums text-foreground/60">
          step {state.index} / {stepCount}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label={`Scan visualization, step ${state.index} of ${stepCount}: ${step.label}`}
        className="w-full rounded-xl bg-background"
      >
        {step.array.map((value, i) => {
          const x = startX + i * (cellSize + cellGap);
          const y = (SVG_HEIGHT - cellSize) / 2;
          const isActive = i === step.activeIndex;
          const isSource = step.sourceIndices.includes(i);
          let fill = "currentColor";
          let opacity = 0.18;
          if (isActive) {
            fill = "#facc15";
            opacity = 0.9;
          } else if (isSource) {
            fill = "#34d399";
            opacity = 0.7;
          }
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx="6"
                fill={fill}
                fillOpacity={opacity}
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="1"
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(20, cellSize / 2.5)}
                fontWeight="600"
                fill="currentColor"
                fillOpacity="0.85"
              >
                {value}
              </text>
              <text
                x={x + cellSize / 2}
                y={y + cellSize + 14}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                fillOpacity="0.55"
              >
                [{i}]
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-sm text-foreground/80 font-mono">{step.label}</div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ScanMode)}
            className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
          >
            <option value="inclusive">inclusive</option>
            <option value="exclusive">exclusive</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          Operation
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as ScanOp)}
            className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
          >
            <option value="plus">plus (+)</option>
            <option value="times">times (×)</option>
          </select>
        </label>
        <span className="ml-auto" />
        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "step-backward" })}
          disabled={state.index === 0}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5 disabled:opacity-40"
        >
          ◀ Step
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: state.isPlaying ? "pause" : "play" })}
          disabled={state.index >= state.stepCount && !state.isPlaying}
          className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          {state.isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "step-forward" })}
          disabled={state.index >= state.stepCount}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5 disabled:opacity-40"
        >
          Step ▶
        </button>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          Speed
          <select
            value={state.speed}
            onChange={(e) =>
              dispatch({ type: "set-speed", speed: Number(e.target.value) })
            }
            className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </label>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        <li><span className="inline-block size-3 rounded bg-[#facc15] align-middle" /> currently being computed</li>
        <li><span className="inline-block size-3 rounded bg-[#34d399] align-middle" /> source cell</li>
      </ul>
    </section>
  );
}
