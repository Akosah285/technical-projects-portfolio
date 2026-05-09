"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pollock } from "@/lib/projects/pollock/pollock";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 460;

interface RunSettings {
  pixelCount: number;
  stepsPerFrame: number;
}

const PRESETS: Array<{ label: string; settings: RunSettings }> = [
  { label: "Sparse trickle", settings: { pixelCount: 200, stepsPerFrame: 50 } },
  { label: "Pollock standard", settings: { pixelCount: 2000, stepsPerFrame: 500 } },
  { label: "Dense storm", settings: { pixelCount: 8000, stepsPerFrame: 2000 } },
];

export function PollockPlayer() {
  const [pixelCount, setPixelCount] = useState(PRESETS[1].settings.pixelCount);
  const [stepsPerFrame, setStepsPerFrame] = useState(PRESETS[1].settings.stepsPerFrame);
  const [running, setRunning] = useState(true);
  const [paintedCells, setPaintedCells] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pollockRef = useRef<Pollock | null>(null);
  const rafRef = useRef<number | null>(null);

  const initPollock = useCallback(() => {
    pollockRef.current = new Pollock({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      pixelCount,
    });
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fafafa";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }
  }, [pixelCount]);

  useEffect(() => {
    initPollock();
  }, [initPollock]);

  const handleReset = () => {
    initPollock();
    setPaintedCells(0);
  };

  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const pollock = pollockRef.current;
      const canvas = canvasRef.current;
      if (!pollock || !canvas) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Track which cells get painted this frame so we can flush them to the
      // canvas without redrawing the entire trail.
      const before = new Set<number>();
      for (let i = 0; i < pollock.trail.length; i++) {
        if (pollock.trail[i] !== null) before.add(i);
      }

      pollock.step(stepsPerFrame);

      for (let i = 0; i < pollock.trail.length; i++) {
        const colour = pollock.trail[i];
        if (colour !== null && !before.has(i)) {
          const x = i % pollock.width;
          const y = Math.floor(i / pollock.width);
          ctx.fillStyle = colour;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Optional: render the live pixels with a subtle marker on top of trail.
      for (const px of pollock.pixels) {
        ctx.fillStyle = px.color;
        ctx.fillRect(px.x, px.y, 1, 1);
      }

      setPaintedCells(pollock.paintedCells());
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, stepsPerFrame]);

  const totalCells = CANVAS_WIDTH * CANVAS_HEIGHT;
  const coverage = ((paintedCells / totalCells) * 100).toFixed(1);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-slate-100">
      <header>
        <h2 className="text-lg font-semibold">Pollock canvas</h2>
        <p className="mt-1 max-w-xl text-sm text-slate-300">
          A swarm of randomly-coloured wandering pixels. Each frame we pick
          some pixels at random, paint a trail at their current cell, then
          nudge them ±1 in each axis. Faithfully ports the WI19 SA_2 Pollock /
          WanderingPixel pair — the Java original used a Swing JFrame and a
          BufferedImage; this one paints into a real HTML canvas.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Presets
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setPixelCount(p.settings.pixelCount);
                  setStepsPerFrame(p.settings.stepsPerFrame);
                }}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs hover:border-sky-500"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:border-sky-500"
          >
            {running ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:border-rose-500"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pixel count: {pixelCount.toLocaleString()}
          </span>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={pixelCount}
            onChange={(e) => setPixelCount(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Steps per frame: {stepsPerFrame.toLocaleString()}
          </span>
          <input
            type="range"
            min={50}
            max={4000}
            step={50}
            value={stepsPerFrame}
            onChange={(e) => setStepsPerFrame(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-neutral-100">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: "100%", height: "auto", display: "block", imageRendering: "pixelated" }}
        />
      </div>

      <p className="text-xs text-slate-400">
        Painted cells: {paintedCells.toLocaleString()} / {totalCells.toLocaleString()} ({coverage}%)
      </p>
    </div>
  );
}
