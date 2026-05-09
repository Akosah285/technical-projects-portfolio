"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  josephusTrace,
  type JosephusStep,
} from "@/lib/projects/josephus/josephusTrace";

const SPEEDS: Array<{ label: string; ms: number }> = [
  { label: "0.5×", ms: 700 },
  { label: "1×", ms: 350 },
  { label: "2×", ms: 175 },
  { label: "4×", ms: 80 },
];

const RADIUS = 180;
const SOLDIER_RADIUS = 14;

export function SoldiersPlayer() {
  const [n, setN] = useState(41);
  const [k, setK] = useState(2);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const trace: JosephusStep[] = useMemo(() => josephusTrace(n, k), [n, k]);
  const speed = SPEEDS[speedIndex];
  const currentStep = trace[stepIndex] ?? trace[0];

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= trace.length - 1) return;
    intervalRef.current = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, trace.length - 1));
    }, speed.ms);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, stepIndex, trace.length, speed]);

  function resetPlayback() {
    setStepIndex(0);
    setIsPlaying(false);
  }

  function handleN(value: number) {
    const clamped = Math.max(2, Math.min(80, value));
    setN(clamped);
    resetPlayback();
  }

  function handleK(value: number) {
    const clamped = Math.max(1, Math.min(20, value));
    setK(clamped);
    resetPlayback();
  }

  function handlePlay() {
    if (stepIndex >= trace.length - 1) setStepIndex(0);
    setIsPlaying(true);
  }

  function handleStep() {
    setIsPlaying(false);
    setStepIndex((i) => Math.min(i + 1, trace.length - 1));
  }

  function handleReveal() {
    setIsPlaying(false);
    setStepIndex(trace.length - 1);
  }

  const positions = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      map.set(i + 1, { x, y });
    }
    return map;
  }, [n]);

  const aliveSet = useMemo(() => new Set(currentStep.alive), [currentStep]);
  const currentNumber =
    currentStep.currentIndex !== null ? currentStep.alive[currentStep.currentIndex] : null;
  const survivor = currentStep.survivor;
  const lastKilled = currentStep.killed;

  const viewBox = `${-RADIUS - 30} ${-RADIUS - 30} ${(RADIUS + 30) * 2} ${(RADIUS + 30) * 2}`;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Number of soldiers (N): {n}</span>
          <input
            type="range"
            min={2}
            max={80}
            value={n}
            onChange={(e) => handleN(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Spacing (k): {k}</span>
          <input
            type="range"
            min={1}
            max={20}
            value={k}
            onChange={(e) => handleK(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying}
          className="rounded-md bg-foreground px-3 py-1 font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          {stepIndex >= trace.length - 1 ? "Replay" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying(false)}
          disabled={!isPlaying}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={handleStep}
          disabled={stepIndex >= trace.length - 1}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Step
        </button>
        <button
          type="button"
          onClick={handleReveal}
          disabled={stepIndex >= trace.length - 1}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Reveal survivor
        </button>
        <button
          type="button"
          onClick={resetPlayback}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Reset
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
          step {stepIndex + 1} / {trace.length}
        </span>
      </div>

      <div className="rounded-lg border border-foreground/15 bg-foreground/5 p-2">
        <svg
          viewBox={viewBox}
          className="block w-full h-auto"
          role="img"
          aria-label={`Josephus circle of ${n} soldiers, killing every k=${k}`}
          style={{ aspectRatio: "1 / 1" }}
        >
          <circle cx={0} cy={0} r={RADIUS} fill="none" stroke="#94a3b8" strokeDasharray="3 4" strokeWidth={1} />
          {Array.from(positions.entries()).map(([num, pos]) => {
            const isAlive = aliveSet.has(num);
            const isCurrent = num === currentNumber;
            const isSurvivor = num === survivor;
            const isLastKilled = num === lastKilled && !isAlive;
            const fill = isSurvivor
              ? "#22c55e"
              : isLastKilled
                ? "#ef4444"
                : isCurrent
                  ? "#facc15"
                  : isAlive
                    ? "#38bdf8"
                    : "#94a3b8";
            const opacity = isAlive || isLastKilled || isSurvivor ? 1 : 0.25;
            return (
              <g key={num} opacity={opacity}>
                <circle cx={pos.x} cy={pos.y} r={SOLDIER_RADIUS} fill={fill} stroke="#0a0a0a" strokeWidth={1} />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#0a0a0a"
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <strong>Status:</strong> {currentStep.label}
        </p>
        {survivor !== null && (
          <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-300">
            🎉 Survivor: <strong>Soldier {survivor}</strong>
          </p>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#38bdf8]" /> Alive
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#facc15]" /> Pointer
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#ef4444]" /> Just killed
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#22c55e]" /> Survivor
        </li>
      </ul>
    </section>
  );
}
