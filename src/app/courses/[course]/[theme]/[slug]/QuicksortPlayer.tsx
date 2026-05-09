"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  quicksortTrace,
  type QuicksortStep,
} from "@/lib/projects/quicksort/quicksortTrace";
import {
  playbackInit,
  playbackReducer,
} from "@/lib/runtime/algorithmVisualization/playback";

const ARRAY_SIZE = 12;
const VALUE_MIN = 5;
const VALUE_MAX = 99;
const SVG_WIDTH = 600;
const SVG_HEIGHT = 240;
const BAR_GAP = 6;

function randomArray(size: number, min: number, max: number, seed: number): number[] {
  let s = seed >>> 0 || 1;
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    arr.push(min + (s % (max - min + 1)));
  }
  return arr;
}

function inSortedRange(idx: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([a, b]) => idx >= a && idx <= b);
}

export function QuicksortPlayer() {
  const [seed, setSeed] = useState(1);
  const input = useMemo(() => randomArray(ARRAY_SIZE, VALUE_MIN, VALUE_MAX, seed), [seed]);
  const trace = useMemo<QuicksortStep[]>(() => quicksortTrace(input), [input]);
  const stepCount = Math.max(0, trace.length - 1);

  const [state, dispatch] = useReducer(playbackReducer, stepCount, playbackInit);

  // Reset playback whenever the trace changes (new shuffle)
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

    const intervalMs = 350 / state.speed;

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
  const maxValue = Math.max(...input, 1);
  const barWidth = (SVG_WIDTH - BAR_GAP * (step.array.length + 1)) / step.array.length;

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
        aria-label={`Quicksort visualization, step ${state.index} of ${stepCount}: ${step.label}`}
        className="w-full rounded-xl bg-background"
      >
        {step.array.map((value, i) => {
          const x = BAR_GAP + i * (barWidth + BAR_GAP);
          const h = (value / maxValue) * (SVG_HEIGHT - 60);
          const y = SVG_HEIGHT - 30 - h;
          const isPivot = i === step.pivotIndex;
          const isJ = i === step.jIndex;
          const inSorted = inSortedRange(i, step.sortedRanges);
          const inPartition =
            step.partitionRange &&
            i >= step.partitionRange[0] &&
            i <= step.partitionRange[1];
          const inLowSide =
            step.iIndex !== null && step.partitionRange && i >= step.partitionRange[0] && i <= step.iIndex;
          let fill = "currentColor";
          let opacity = 0.25;
          if (isPivot) {
            fill = "#f87171";
            opacity = 0.95;
          } else if (isJ) {
            fill = "#facc15";
            opacity = 0.95;
          } else if (inLowSide) {
            fill = "#34d399";
            opacity = 0.7;
          } else if (inSorted) {
            fill = "#a3e635";
            opacity = 0.55;
          } else if (inPartition) {
            fill = "currentColor";
            opacity = 0.45;
          }
          return (
            <g key={`${i}-${value}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="3"
                fill={fill}
                fillOpacity={opacity}
              />
              <text
                x={x + barWidth / 2}
                y={SVG_HEIGHT - 12}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                fillOpacity="0.7"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-sm text-foreground/80">{step.label}</div>

      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reshuffle
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-foreground/70">
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

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground/60 sm:grid-cols-4">
        <li><span className="inline-block size-3 rounded bg-[#f87171] align-middle" /> pivot</li>
        <li><span className="inline-block size-3 rounded bg-[#facc15] align-middle" /> scan pointer (j)</li>
        <li><span className="inline-block size-3 rounded bg-[#34d399] align-middle" /> low-side (≤ pivot)</li>
        <li><span className="inline-block size-3 rounded bg-[#a3e635] align-middle" /> placed (final position)</li>
      </ul>
    </section>
  );
}
