"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  emptyGrid,
  nextGeneration,
  PATTERNS,
  placePattern,
  type LifeGrid,
} from "@/lib/projects/life/gameOfLife";

const ROWS = 30;
const COLS = 50;
const CELL_SIZE = 16;

const SPEEDS: Array<{ label: string; ms: number }> = [
  { label: "0.5×", ms: 400 },
  { label: "1×", ms: 200 },
  { label: "2×", ms: 100 },
  { label: "4×", ms: 50 },
];

export function GameOfLifePlayer() {
  const [grid, setGrid] = useState<LifeGrid>(() => emptyGrid(ROWS, COLS));
  const [generation, setGeneration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const isPaintingRef = useRef<null | boolean>(null);

  const speed = SPEEDS[speedIndex];

  const advance = useCallback(() => {
    setGrid((g) => nextGeneration(g));
    setGeneration((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(advance, speed.ms);
    return () => window.clearInterval(id);
  }, [isPlaying, speed, advance]);

  useEffect(() => {
    function onBlur() {
      setIsPlaying(false);
    }
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  const aliveCount = useMemo(
    () => grid.reduce((a, r) => a + r.reduce((b, c) => b + (c ? 1 : 0), 0), 0),
    [grid],
  );

  function setCell(row: number, col: number, alive: boolean) {
    setGrid((g) => {
      if (g[row][col] === alive) return g;
      const next = g.map((r) => [...r]);
      next[row][col] = alive;
      return next;
    });
  }

  function toggleCell(row: number, col: number) {
    setGrid((g) => {
      const next = g.map((r) => [...r]);
      next[row][col] = !next[row][col];
      return next;
    });
  }

  function handleCellPointerDown(row: number, col: number) {
    const willBeAlive = !grid[row][col];
    isPaintingRef.current = willBeAlive;
    toggleCell(row, col);
  }

  function handleCellPointerEnter(row: number, col: number) {
    if (isPaintingRef.current === null) return;
    setCell(row, col, isPaintingRef.current);
  }

  function endPainting() {
    isPaintingRef.current = null;
  }

  function handleClear() {
    setIsPlaying(false);
    setGrid(emptyGrid(ROWS, COLS));
    setGeneration(0);
  }

  function handlePattern(name: keyof typeof PATTERNS) {
    setIsPlaying(false);
    const pattern = PATTERNS[name];
    const fresh = emptyGrid(ROWS, COLS);
    const anchorRow = Math.floor(ROWS / 2 - 6);
    const anchorCol = Math.floor(COLS / 2 - 6);
    setGrid(placePattern(fresh, pattern, anchorRow, anchorCol));
    setGeneration(0);
  }

  function handleStep() {
    setIsPlaying(false);
    advance();
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="rounded-md bg-foreground px-3 py-1 font-medium text-background hover:opacity-90"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={handleStep}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Step
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Clear
        </button>
        <label className="flex items-center gap-1">
          <span className="text-xs text-foreground/60">Speed</span>
          <select
            value={speedIndex}
            onChange={(e) => setSpeedIndex(Number(e.target.value))}
            className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-xs"
          >
            {SPEEDS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <span className="ml-auto rounded-md bg-foreground/5 px-2 py-1 font-mono text-xs">
          gen {generation} · alive {aliveCount}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-foreground/60">Seed pattern:</span>
        {(Object.keys(PATTERNS) as Array<keyof typeof PATTERNS>).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => handlePattern(name)}
            className="rounded-md border border-foreground/20 px-2 py-1 capitalize hover:bg-foreground/5"
          >
            {name === "rPentomino" ? "R-pentomino" : name}
          </button>
        ))}
      </div>

      <div
        className="overflow-x-auto rounded-md border border-foreground/15 bg-foreground/5 p-2"
        onPointerUp={endPainting}
        onPointerLeave={endPainting}
      >
        <svg
          viewBox={`0 0 ${COLS * CELL_SIZE} ${ROWS * CELL_SIZE}`}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="block touch-none select-none"
          style={{ maxWidth: "100%", height: "auto" }}
          role="grid"
          aria-label="Game of Life cell grid — click or drag to toggle cells"
        >
          {grid.map((row, r) =>
            row.map((alive, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * CELL_SIZE}
                y={r * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={alive ? "#2563eb" : "#fef9c3"}
                stroke="#0a0a0a"
                strokeWidth={0.5}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleCellPointerDown(r, c);
                }}
                onPointerEnter={() => handleCellPointerEnter(r, c)}
                style={{ cursor: "pointer" }}
              />
            )),
          )}
        </svg>
      </div>

      <p className="text-xs text-foreground/60">
        Standard Conway B3/S23 rules with toroidal wraparound (left edge wraps to right,
        top wraps to bottom) — exactly the topology the original <code>colony.py</code> used
        via <code>%</code> on row/column indices. Click a cell to toggle, or drag to paint.
      </p>
    </section>
  );
}
