"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  KLEIBER_DATA,
  KLEIBER_LOG_XS,
  KLEIBER_LOG_YS,
  olsClosedForm,
  predict,
  runRegression,
  type CostFn,
  type RegressionStep,
  type Weights,
} from "@/lib/projects/linearRegression/linearRegression";

const PLOT_W = 600;
const PLOT_H = 360;
const PADDING = 44;

function makeProjector(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) {
  const projectX = (x: number) =>
    PADDING + ((x - xMin) / (xMax - xMin)) * (PLOT_W - 2 * PADDING);
  const projectY = (y: number) =>
    PLOT_H - PADDING - ((y - yMin) / (yMax - yMin)) * (PLOT_H - 2 * PADDING);
  return { projectX, projectY };
}

export function LinearRegressionPlayer() {
  const [costFn, setCostFn] = useState<CostFn>("lse");
  const [w0, setW0] = useState(0);
  const [w1, setW1] = useState(0);
  const [alpha, setAlpha] = useState(0.05);
  const [iters, setIters] = useState(800);
  const [history, setHistory] = useState<RegressionStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const xs = KLEIBER_LOG_XS;
  const ys = KLEIBER_LOG_YS;

  const xMin = useMemo(() => Math.min(...xs) - 0.4, [xs]);
  const xMax = useMemo(() => Math.max(...xs) + 0.4, [xs]);
  const yMin = useMemo(() => Math.min(...ys) - 0.4, [ys]);
  const yMax = useMemo(() => Math.max(...ys) + 0.4, [ys]);
  const { projectX, projectY } = useMemo(
    () => makeProjector(xMin, xMax, yMin, yMax),
    [xMin, xMax, yMin, yMax],
  );

  const [olsW0, olsW1] = useMemo(() => olsClosedForm(xs, ys), [xs, ys]);

  const liveStep = history.length > 0 ? history[Math.min(stepIdx, history.length - 1)] : null;
  const liveW: Weights = liveStep ? liveStep.w : [w0, w1];

  useEffect(() => {
    if (!playing) return;
    if (history.length === 0 || stepIdx >= history.length - 1) {
      // Use a microtask to defer the state update outside of the effect's render-time logic
      const id = window.setTimeout(() => setPlaying(false), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStepIdx((i) => Math.min(history.length - 1, i + 1)), 25);
    return () => window.clearTimeout(id);
  }, [playing, stepIdx, history.length]);

  const animationRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    },
    [],
  );

  function handleTrain() {
    const result = runRegression(
      { initialW: [w0, w1], learningRate: alpha, maxIters: iters, costFn },
      xs,
      ys,
    );
    setHistory(result);
    setStepIdx(0);
    setPlaying(true);
  }

  function handleResetWeights() {
    setW0(0);
    setW1(0);
    setHistory([]);
    setStepIdx(0);
    setPlaying(false);
  }

  function handleSnapToOls() {
    setW0(olsW0);
    setW1(olsW1);
    setHistory([]);
    setStepIdx(0);
    setPlaying(false);
  }

  const lineX0 = xMin;
  const lineX1 = xMax;

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Linear regression on Kleiber&apos;s law</h2>
        <p className="text-sm text-foreground/70">
          Body mass (kg) and resting metabolism (kcal/day) for {KLEIBER_DATA.length} mammals,
          plotted on log–log axes. Kleiber&apos;s 1932 finding: metabolism scales as mass<sup>0.75</sup>.
          On log–log axes that becomes a straight line with slope ≈ 0.75 — pick a cost function and
          either drag the line yourself or train it with gradient descent.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <fieldset className="rounded-md border border-foreground/15 px-3 py-2 text-sm">
          <legend className="px-1 text-xs uppercase tracking-wide text-foreground/55">cost</legend>
          <label className="mr-3">
            <input
              type="radio"
              checked={costFn === "lse"}
              onChange={() => {
                setCostFn("lse");
                setHistory([]);
                setStepIdx(0);
              }}
              className="mr-1"
            />
            Least squares
          </label>
          <label>
            <input
              type="radio"
              checked={costFn === "lad"}
              onChange={() => {
                setCostFn("lad");
                setHistory([]);
                setStepIdx(0);
              }}
              className="mr-1"
            />
            Least absolute deviation
          </label>
        </fieldset>
        <button
          type="button"
          onClick={handleTrain}
          className="rounded-md bg-foreground/85 px-3 py-1 text-sm text-background hover:bg-foreground"
        >
          Train (gradient descent)
        </button>
        <button
          type="button"
          onClick={handleResetWeights}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reset to (0, 0)
        </button>
        <button
          type="button"
          onClick={handleSnapToOls}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Snap to closed-form OLS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm">
          Intercept w₀: <span className="font-mono">{liveW[0].toFixed(3)}</span>
          <input
            type="range"
            min={-2}
            max={4}
            step={0.01}
            value={liveW[0]}
            onChange={(e) => {
              setW0(Number(e.target.value));
              setHistory([]);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Slope w₁: <span className="font-mono">{liveW[1].toFixed(3)}</span>
          <input
            type="range"
            min={-1}
            max={2}
            step={0.01}
            value={liveW[1]}
            onChange={(e) => {
              setW1(Number(e.target.value));
              setHistory([]);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Learning rate α: <span className="font-mono">{alpha.toFixed(3)}</span>
          <input
            type="range"
            min={0.001}
            max={0.5}
            step={0.001}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Max iterations: <span className="font-mono">{iters}</span>
          <input
            type="range"
            min={50}
            max={3000}
            step={50}
            value={iters}
            onChange={(e) => setIters(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-foreground/10 bg-background/40 p-3">
        <svg width={PLOT_W} height={PLOT_H} className="text-foreground">
          <line x1={projectX(xMin)} y1={projectY(0)} x2={projectX(xMax)} y2={projectY(0)} stroke="currentColor" strokeOpacity={0.1} />
          <line x1={projectX(0)} y1={projectY(yMin)} x2={projectX(0)} y2={projectY(yMax)} stroke="currentColor" strokeOpacity={0.1} />
          {KLEIBER_DATA.map((d, i) => {
            const cx = projectX(xs[i]);
            const cy = projectY(ys[i]);
            const isHovered = hoverIdx === i;
            return (
              <g key={d.species} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} fill="rgb(59 130 246)" opacity={0.8} />
                {isHovered && (
                  <text x={cx + 8} y={cy - 6} fontSize={11} fill="currentColor">
                    {d.species} ({d.massKg} kg → {d.metabolismKcalDay} kcal/d)
                  </text>
                )}
              </g>
            );
          })}
          <line
            x1={projectX(lineX0)}
            y1={projectY(predict([olsW0, olsW1], lineX0))}
            x2={projectX(lineX1)}
            y2={projectY(predict([olsW0, olsW1], lineX1))}
            stroke="rgb(148 163 184)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
          <line
            x1={projectX(lineX0)}
            y1={projectY(predict(liveW, lineX0))}
            x2={projectX(lineX1)}
            y2={projectY(predict(liveW, lineX1))}
            stroke="rgb(249 115 22)"
            strokeWidth={2.5}
          />
          <text x={PADDING} y={PLOT_H - 8} fontSize={11} fill="currentColor" opacity={0.6}>
            log₁₀(mass)
          </text>
          <text
            x={10}
            y={PADDING - 8}
            fontSize={11}
            fill="currentColor"
            opacity={0.6}
          >
            log₁₀(metabolism)
          </text>
        </svg>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
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
              onClick={() => setPlaying((p) => !p)}
              className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStepIdx(0);
                setPlaying(false);
              }}
              className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
            >
              Reset
            </button>
            <span className="text-sm text-foreground/70">
              Iter <span className="font-mono">{stepIdx}</span> / {history.length - 1}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={history.length - 1}
            step={1}
            value={stepIdx}
            onChange={(e) => setStepIdx(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Stat label="cost" value={liveStep ? liveStep.cost.toFixed(5) : "—"} />
        <Stat label="OLS slope (closed form)" value={olsW1.toFixed(4)} />
        <Stat label="OLS intercept (closed form)" value={olsW0.toFixed(4)} />
      </div>

      <p className="text-xs text-foreground/55">
        Dashed grey line: closed-form OLS fit. Orange line: your current iterate. Switch the cost
        function to compare how least squares (sensitive to extreme values) and least absolute
        deviation (robust to outliers) trade off — particularly visible if you nudge a single
        Kleiber observation by hand.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-foreground/10 bg-background/30 p-3">
      <div className="text-xs uppercase tracking-wide text-foreground/55">{label}</div>
      <div className="mt-1 font-mono text-base">{value}</div>
    </div>
  );
}
