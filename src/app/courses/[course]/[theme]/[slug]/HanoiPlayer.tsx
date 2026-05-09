"use client";

import { useMemo, useReducer, useEffect, useRef } from "react";
import {
  generateHanoiSteps,
  type HanoiMove,
  type Peg,
} from "@/lib/projects/hanoi/stepGenerator";
import { simulate } from "@/lib/projects/hanoi/pegState";
import {
  playbackInit,
  playbackReducer,
} from "@/lib/runtime/algorithmVisualization/playback";

const N = 5;
const SOURCE: Peg = "A";
const DESTINATION: Peg = "C";
const VIA: Peg = "B";

const PEG_LAYOUT: Record<Peg, number> = { A: 100, B: 300, C: 500 };
const BASE_Y = 260;
const PEG_HEIGHT = 180;
const DISK_HEIGHT = 22;
const DISK_UNIT_WIDTH = 22;

export function HanoiPlayer() {
  const moves: HanoiMove[] = useMemo(
    () => generateHanoiSteps(N, SOURCE, DESTINATION, VIA),
    [],
  );

  const [state, dispatch] = useReducer(
    playbackReducer,
    moves.length,
    playbackInit,
  );

  const pegState = useMemo(
    () => simulate(N, SOURCE, moves.slice(0, state.index)),
    [moves, state.index],
  );

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

  const currentMove = state.index > 0 ? moves[state.index - 1] : null;
  const upcomingMove =
    state.index < moves.length ? moves[state.index] : null;

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Visualization</h2>
        <span className="text-sm tabular-nums text-foreground/60">
          step {state.index} / {state.stepCount}
        </span>
      </div>

      <svg
        viewBox="0 0 600 300"
        role="img"
        aria-label={`Towers of Hanoi state, step ${state.index} of ${state.stepCount}`}
        className="w-full rounded-xl bg-background"
      >
        <line
          x1="40"
          x2="560"
          y1={BASE_Y + 6}
          y2={BASE_Y + 6}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="2"
        />
        {(["A", "B", "C"] as Peg[]).map((peg) => {
          const x = PEG_LAYOUT[peg];
          return (
            <g key={peg}>
              <line
                x1={x}
                x2={x}
                y1={BASE_Y - PEG_HEIGHT}
                y2={BASE_Y}
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="4"
              />
              <text
                x={x}
                y={BASE_Y + 28}
                textAnchor="middle"
                fontSize="14"
                fill="currentColor"
                fillOpacity="0.6"
              >
                Peg {peg}
              </text>
              {pegState[peg].map((disk, i) => {
                const w = disk * DISK_UNIT_WIDTH;
                const y = BASE_Y - DISK_HEIGHT * (i + 1);
                return (
                  <rect
                    key={`${peg}-${disk}`}
                    x={x - w / 2}
                    y={y}
                    width={w}
                    height={DISK_HEIGHT - 4}
                    rx="4"
                    fill="currentColor"
                    fillOpacity={0.15 + (disk / N) * 0.5}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

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
          onClick={() =>
            dispatch({ type: state.isPlaying ? "pause" : "play" })
          }
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
        <label className="ml-auto flex items-center gap-2 text-sm text-foreground/70">
          Speed
          <select
            value={state.speed}
            onChange={(e) =>
              dispatch({
                type: "set-speed",
                speed: Number(e.target.value),
              })
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

      <div className="grid gap-1 text-sm tabular-nums">
        <div>
          <span className="text-foreground/50">Last move:</span>{" "}
          {currentMove
            ? `disk ${currentMove.disk} from ${currentMove.from} → ${currentMove.to}`
            : "—"}
        </div>
        <div>
          <span className="text-foreground/50">Next move:</span>{" "}
          {upcomingMove
            ? `disk ${upcomingMove.disk} from ${upcomingMove.from} → ${upcomingMove.to}`
            : "(complete)"}
        </div>
      </div>
    </section>
  );
}
