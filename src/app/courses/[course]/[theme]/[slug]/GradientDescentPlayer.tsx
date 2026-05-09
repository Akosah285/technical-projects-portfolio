"use client";

import { useMemo, useState } from "react";
import {
  runGradientDescent,
  sampleCostCurve,
  type DescentStep,
} from "@/lib/projects/gradientDescent/gradientDescent";

const W_MIN = -3;
const W_MAX = 3;
const PLOT_W = 600;
const PLOT_H = 320;
const PADDING = 32;

function projectX(w: number): number {
  return PADDING + ((w - W_MIN) / (W_MAX - W_MIN)) * (PLOT_W - 2 * PADDING);
}

function projectY(c: number, cMin: number, cMax: number): number {
  const t = (c - cMin) / (cMax - cMin);
  return PLOT_H - PADDING - t * (PLOT_H - 2 * PADDING);
}

const PRESETS: { label: string; w0: number; alpha: number; iters: number; note: string }[] = [
  { label: "Gentle (lr=0.1, w₀=2)", w0: 2, alpha: 0.1, iters: 60, note: "Smooth roll downhill from the right." },
  { label: "Aggressive (lr=2, w₀=2)", w0: 2, alpha: 2, iters: 60, note: "Big steps that overshoot — watch the bounce." },
  { label: "Climb out of saddle (lr=0.3, w₀=-2)", w0: -2, alpha: 0.3, iters: 80, note: "Starts left of the minimum, walks right." },
  { label: "Diverge (lr=10)", w0: 1.5, alpha: 10, iters: 30, note: "Learning rate too big — runs away to infinity." },
];

export function GradientDescentPlayer() {
  const [w0, setW0] = useState(2);
  const [alpha, setAlpha] = useState(0.5);
  const [iters, setIters] = useState(50);
  const [stepIdx, setStepIdx] = useState(0);

  const history: DescentStep[] = useMemo(
    () => runGradientDescent({ initialW: w0, learningRate: alpha, maxIters: iters }),
    [w0, alpha, iters],
  );
  const curve = useMemo(() => sampleCostCurve(W_MIN, W_MAX, 200), []);
  const cMin = Math.min(...curve.map((p) => p.cost)) - 0.5;
  const cMax = Math.max(...curve.map((p) => p.cost)) + 0.5;

  const safeIdx = Math.min(stepIdx, history.length - 1);
  const current = history[safeIdx];
  const visibleHistory = history.slice(0, safeIdx + 1).filter((s) => Number.isFinite(s.w));

  function applyPreset(p: (typeof PRESETS)[number]) {
    setW0(p.w0);
    setAlpha(p.alpha);
    setIters(p.iters);
    setStepIdx(0);
  }

  const polyPoints = useMemo(
    () => curve.map((p) => `${projectX(p.w)},${projectY(p.cost, cMin, cMax)}`).join(" "),
    [curve, cMin, cMax],
  );

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Gradient descent on the HW1 cost</h2>
        <p className="text-sm text-foreground/70">
          Cost surface: <code>g(w) = (w⁴ + w² + 10w − 50) / 50</code>. Pick a starting point, a
          learning rate, and walk the descent step by step. The orange dot is your current iterate;
          the trail shows every step taken so far.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="rounded-md border border-foreground/15 px-3 py-1 text-xs hover:bg-foreground/5"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="text-sm">
          Starting w₀: <span className="font-mono">{w0.toFixed(2)}</span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.05}
            value={w0}
            onChange={(e) => {
              setW0(Number(e.target.value));
              setStepIdx(0);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Learning rate α: <span className="font-mono">{alpha.toFixed(2)}</span>
          <input
            type="range"
            min={0.01}
            max={5}
            step={0.01}
            value={alpha}
            onChange={(e) => {
              setAlpha(Number(e.target.value));
              setStepIdx(0);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Max iterations: <span className="font-mono">{iters}</span>
          <input
            type="range"
            min={1}
            max={300}
            step={1}
            value={iters}
            onChange={(e) => {
              setIters(Number(e.target.value));
              setStepIdx(0);
            }}
            className="w-full"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-foreground/10 bg-background/40 p-3">
        <svg width={PLOT_W} height={PLOT_H} className="text-foreground">
          <line
            x1={PADDING}
            y1={projectY(0, cMin, cMax)}
            x2={PLOT_W - PADDING}
            y2={projectY(0, cMin, cMax)}
            stroke="currentColor"
            strokeOpacity={0.15}
          />
          <polyline
            points={polyPoints}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeWidth={1.6}
          />
          {visibleHistory.map((s, i) => (
            <circle
              key={i}
              cx={projectX(s.w)}
              cy={projectY(s.cost, cMin, cMax)}
              r={3}
              fill="rgb(59 130 246)"
              opacity={0.45}
            />
          ))}
          {Number.isFinite(current.w) && (
            <circle
              cx={projectX(current.w)}
              cy={projectY(current.cost, cMin, cMax)}
              r={6}
              fill="rgb(249 115 22)"
              stroke="white"
              strokeWidth={1.5}
            />
          )}
          <text x={PADDING} y={PLOT_H - 10} fontSize={10} fill="currentColor" opacity={0.5}>
            w = {W_MIN}
          </text>
          <text
            x={PLOT_W - PADDING - 22}
            y={PLOT_H - 10}
            fontSize={10}
            fill="currentColor"
            opacity={0.5}
          >
            w = {W_MAX}
          </text>
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          ← Step
        </button>
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.min(history.length - 1, i + 1))}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Step →
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(0)}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(history.length - 1)}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Skip to end
        </button>
        <span className="text-sm text-foreground/70">
          Step <span className="font-mono">{safeIdx}</span> / {history.length - 1}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label="w" value={Number.isFinite(current.w) ? current.w.toFixed(4) : "diverged"} />
        <Stat
          label="g(w)"
          value={Number.isFinite(current.cost) ? current.cost.toFixed(4) : "—"}
        />
        <Stat
          label="g'(w₀ at start)"
          value={(((4 * Math.pow(w0, 3) + 2 * w0 + 10) / 50)).toFixed(4)}
        />
      </div>

      <details className="rounded-lg border border-foreground/10 bg-background/30 p-3 text-sm">
        <summary className="cursor-pointer font-medium">All iterations</summary>
        <div className="mt-2 max-h-60 overflow-y-auto font-mono text-xs">
          <table className="w-full">
            <thead className="text-foreground/60">
              <tr>
                <th className="text-left">iter</th>
                <th className="text-left">w</th>
                <th className="text-left">g(w)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.iter} className={s.iter === safeIdx ? "text-orange-500" : ""}>
                  <td>{s.iter}</td>
                  <td>{Number.isFinite(s.w) ? s.w.toFixed(4) : "∞"}</td>
                  <td>{Number.isFinite(s.cost) ? s.cost.toFixed(4) : "∞"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-xs text-foreground/55">
        At α = 0.5 from w₀ = 2, descent settles near w ≈ −1.235, where g′(w) = 0. The cost surface
        also has a saddle to the right of the origin — try presets to see how the learning rate
        controls overshoot, oscillation, and divergence. Cost g(w) reaches about −1.6 at the global
        min.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-foreground/10 bg-background/30 p-3">
      <div className="text-xs uppercase tracking-wide text-foreground/55">{label}</div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}
