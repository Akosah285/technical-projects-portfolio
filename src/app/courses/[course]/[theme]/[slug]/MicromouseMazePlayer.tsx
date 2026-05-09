"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Action,
  type Maze,
  type RobotState,
  GRID_SIZE,
  applyMove,
  applyTurn,
  chooseAction,
  corridorMaze,
  openMaze,
  ringMaze,
} from "@/lib/projects/micromouseMaze/micromouseMaze";

const PRESETS: Array<{ key: string; label: string; build: () => Maze }> = [
  { key: "open", label: "Open arena", build: openMaze },
  { key: "corridor", label: "L-corridor", build: corridorMaze },
  { key: "ring", label: "Ring (right-hand fail case)", build: ringMaze },
];

const SPEEDS = [
  { label: "0.25×", ms: 800 },
  { label: "1×", ms: 200 },
  { label: "4×", ms: 50 },
];

const ACTION_GLYPH: Record<Action, string> = {
  RIGHT: "↻",
  FORWARD: "↑",
  LEFT: "↺",
  BACKWARD: "↓",
};

export function MicromouseMazePlayer() {
  const [presetKey, setPresetKey] = useState<string>(PRESETS[0].key);
  const [speedIdx, setSpeedIdx] = useState<number>(1);
  const [playing, setPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  const maze = useMemo(() => {
    const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0];
    return preset.build();
  }, [presetKey]);

  const [robot, setRobot] = useState<RobotState>(() => ({
    position: { ...maze.start },
    heading: maze.startHeading,
  }));
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([`${maze.start.x},${maze.start.y}`]),
  );
  const [history, setHistory] = useState<Array<{ step: number; action: Action }>>(
    [],
  );

  const reset = useCallback(
    (m: Maze) => {
      setRobot({ position: { ...m.start }, heading: m.startHeading });
      setStepCount(0);
      setVisited(new Set([`${m.start.x},${m.start.y}`]));
      setHistory([]);
      setPlaying(false);
    },
    [],
  );

  const switchPreset = (key: string) => {
    setPresetKey(key);
    const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0];
    reset(preset.build());
  };

  const reachedGoal =
    robot.position.x === maze.goal.x && robot.position.y === maze.goal.y;

  const stepRef = useRef<() => void>(() => {});
  const stepOnce = useCallback(() => {
    const cell = maze.cells[robot.position.x][robot.position.y];
    const action = chooseAction(cell, robot.heading);
    const newHeading = applyTurn(robot.heading, action);
    const movedRaw = applyMove(robot.position, newHeading);
    const next = {
      x: Math.max(0, Math.min(maze.width - 1, movedRaw.x)),
      y: Math.max(0, Math.min(maze.height - 1, movedRaw.y)),
    };
    const nextState: RobotState = { position: next, heading: newHeading };
    setRobot(nextState);
    setStepCount((s) => s + 1);
    setVisited((v) => new Set([...v, `${next.x},${next.y}`]));
    setHistory((h) => [...h, { step: h.length, action }].slice(-12));
  }, [maze, robot]);

  useEffect(() => {
    stepRef.current = stepOnce;
  }, [stepOnce]);

  useEffect(() => {
    if (!playing || reachedGoal) return;
    const id = setInterval(() => stepRef.current(), SPEEDS[speedIdx].ms);
    return () => clearInterval(id);
  }, [playing, reachedGoal, speedIdx]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <MazeSvg maze={maze} robot={robot} visited={visited} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/50">
              Status
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-white/70">
              <div>
                <div className="text-white/40">Steps</div>
                <div className="font-mono text-white">{stepCount}</div>
              </div>
              <div>
                <div className="text-white/40">Position</div>
                <div className="font-mono text-blue-300">
                  ({robot.position.x}, {robot.position.y})
                </div>
              </div>
              <div>
                <div className="text-white/40">Heading</div>
                <div className="font-mono text-amber-300">{robot.heading}</div>
              </div>
              <div>
                <div className="text-white/40">Goal</div>
                <div className="font-mono text-pink-300">
                  ({maze.goal.x}, {maze.goal.y})
                </div>
              </div>
            </div>
            {reachedGoal && (
              <div className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-2 text-[11px] uppercase tracking-widest text-emerald-200">
                Goal reached in {stepCount} steps
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/50">
              Action log
            </div>
            <ul className="mt-2 space-y-1 text-[12px]">
              {history.length === 0 && (
                <li className="text-white/40">— no moves yet —</li>
              )}
              {history.map((h, i) => (
                <li
                  key={`${h.step}-${i}`}
                  className="flex items-center justify-between font-mono text-white/70"
                >
                  <span className="text-white/40">#{h.step + 1}</span>
                  <span>
                    {ACTION_GLYPH[h.action]} {h.action.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          <span className="uppercase tracking-widest text-white/50">Maze</span>
          <select
            value={presetKey}
            onChange={(e) => switchPreset(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          <span className="uppercase tracking-widest text-white/50">Speed</span>
          <div className="flex rounded-lg border border-white/10 bg-slate-900 p-1">
            {SPEEDS.map((s, i) => (
              <button
                type="button"
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={`flex-1 rounded-md px-2 py-1 text-xs ${
                  speedIdx === i ? "bg-blue-500 text-white" : "text-white/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={stepOnce}
            disabled={reachedGoal}
            className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs uppercase tracking-widest text-white/80 hover:bg-white/20 disabled:opacity-40"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={reachedGoal}
            className="flex-1 rounded-lg border border-blue-400/40 bg-blue-500/30 px-3 py-2 text-xs uppercase tracking-widest text-white hover:bg-blue-500/50 disabled:opacity-40"
          >
            {playing ? "Pause" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => reset(maze)}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs uppercase tracking-widest text-white/70 hover:bg-white/15"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function MazeSvg({
  maze,
  robot,
  visited,
}: {
  maze: Maze;
  robot: RobotState;
  visited: Set<string>;
}) {
  const CELL = 44;
  const PAD = 8;
  const W = GRID_SIZE * CELL + PAD * 2;
  const H = GRID_SIZE * CELL + PAD * 2;

  const cellX = (x: number) => PAD + x * CELL;
  // SVG y grows downward, but maze y grows upward — flip
  const cellY = (y: number) => PAD + (GRID_SIZE - 1 - y) * CELL;

  const headingDeg = (() => {
    switch (robot.heading) {
      case "UP":
        return 0;
      case "RIGHT":
        return 90;
      case "DOWN":
        return 180;
      case "LEFT":
        return -90;
    }
  })();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      aria-label="Micromouse maze"
    >
      {/* Visited shading */}
      {Array.from(visited).map((key) => {
        const [x, y] = key.split(",").map(Number);
        return (
          <rect
            key={`v-${key}`}
            x={cellX(x)}
            y={cellY(y)}
            width={CELL}
            height={CELL}
            fill="rgba(96, 165, 250, 0.12)"
          />
        );
      })}
      {/* Goal cell */}
      <rect
        x={cellX(maze.goal.x)}
        y={cellY(maze.goal.y)}
        width={CELL}
        height={CELL}
        fill="rgba(244, 114, 182, 0.25)"
        stroke="rgba(244, 114, 182, 0.6)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      {/* Walls */}
      {maze.cells.flatMap((col, x) =>
        col.map((cell, y) => {
          const x0 = cellX(x);
          const y0 = cellY(y);
          const x1 = x0 + CELL;
          const y1 = y0 + CELL;
          return (
            <g key={`c-${x}-${y}`} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="square">
              {cell.N && <line x1={x0} y1={y0} x2={x1} y2={y0} />}
              {cell.S && <line x1={x0} y1={y1} x2={x1} y2={y1} />}
              {cell.E && <line x1={x1} y1={y0} x2={x1} y2={y1} />}
              {cell.W && <line x1={x0} y1={y0} x2={x0} y2={y1} />}
            </g>
          );
        }),
      )}
      {/* Robot */}
      {(() => {
        const cx = cellX(robot.position.x) + CELL / 2;
        const cy = cellY(robot.position.y) + CELL / 2;
        return (
          <g transform={`translate(${cx} ${cy}) rotate(${headingDeg})`}>
            <polygon
              points="0,-12 9,9 0,4 -9,9"
              fill="#60a5fa"
              stroke="#93c5fd"
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </g>
        );
      })()}
    </svg>
  );
}
