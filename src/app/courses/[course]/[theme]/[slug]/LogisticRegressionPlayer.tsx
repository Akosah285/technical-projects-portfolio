"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CLASSIFICATION_DATA,
  CLASSIFICATION_XS,
  CLASSIFICATION_YS,
  classify,
  evaluate,
  predictProb,
  runLogisticRegression,
  type ClassificationStep,
  type Weights,
} from "@/lib/projects/logisticRegression/logisticRegression";

const PLOT_W = 600;
const PLOT_H = 320;
const PADDING = 40;
const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -0.15;
const Y_MAX = 1.15;

function projectX(x: number): number {
  return PADDING + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_W - 2 * PADDING);
}
function projectY(y: number): number {
  return PLOT_H - PADDING - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (PLOT_H - 2 * PADDING);
}

export function LogisticRegressionPlayer() {
  const [w0, setW0] = useState(0);
  const [w1, setW1] = useState(0);
  const [alpha, setAlpha] = useState(0.5);
  const [iters] = useState(800);
  const [threshold, setThreshold] = useState(0.5);
  const [history, setHistory] = useState<ClassificationStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const liveStep = history.length > 0 ? history[Math.min(stepIdx, history.length - 1)] : null;
  const liveW: Weights = useMemo(
    () => (liveStep ? liveStep.w : [w0, w1]),
    [liveStep, w0, w1],
  );

  useEffect(() => {
    if (!playing) return;
    if (history.length === 0 || stepIdx >= history.length - 1) {
      const id = window.setTimeout(() => setPlaying(false), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStepIdx((i) => Math.min(history.length - 1, i + 1)), 25);
    return () => window.clearTimeout(id);
  }, [playing, stepIdx, history.length]);

  const sigmoidCurve = useMemo(() => {
    const points: { x: number; p: number }[] = [];
    const N = 200;
    for (let i = 0; i < N; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / (N - 1);
      points.push({ x, p: predictProb(liveW, x) });
    }
    return points;
  }, [liveW]);

  const decisionBoundary = useMemo(() => {
    if (Math.abs(liveW[1]) < 1e-9) return null;
    const z = Math.log(threshold / (1 - threshold));
    const x = (z - liveW[0]) / liveW[1];
    if (!Number.isFinite(x) || x < X_MIN || x > X_MAX) return null;
    return x;
  }, [liveW, threshold]);

  const predictions = CLASSIFICATION_XS.map((x) => classify(liveW, x, threshold));
  const cm = evaluate(CLASSIFICATION_YS, predictions);

  function handleTrain() {
    const result = runLogisticRegression(
      { initialW: [w0, w1], learningRate: alpha, maxIters: iters },
      CLASSIFICATION_XS,
      CLASSIFICATION_YS,
    );
    setHistory(result);
    setStepIdx(0);
    setPlaying(true);
  }

  function handleReset() {
    setW0(0);
    setW1(0);
    setHistory([]);
    setStepIdx(0);
    setPlaying(false);
  }

  const polyPoints = sigmoidCurve.map((p) => `${projectX(p.x)},${projectY(p.p)}`).join(" ");

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Logistic regression with cross-entropy</h2>
        <p className="text-sm text-foreground/70">
          Single-feature binary classifier from HW3. Each dot is a training example — class 1 sits
          near the top of the plot at <code>y = 1</code>, class 0 at <code>y = 0</code>, with a
          deliberate overlap zone. The green curve is the predicted probability{" "}
          <code>σ(w₀ + w₁·x)</code>; the dashed vertical line is the decision boundary at the
          chosen threshold.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleTrain}
          className="rounded-md bg-foreground/85 px-3 py-1 text-sm text-background hover:bg-foreground"
        >
          Train (gradient descent)
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reset weights
        </button>
        <span className="text-sm text-foreground/70">
          Live weights: w₀ = <span className="font-mono">{liveW[0].toFixed(3)}</span>, w₁ ={" "}
          <span className="font-mono">{liveW[1].toFixed(3)}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm">
          w₀ (intercept): <span className="font-mono">{liveW[0].toFixed(3)}</span>
          <input
            type="range"
            min={-6}
            max={6}
            step={0.05}
            value={liveW[0]}
            onChange={(e) => {
              setW0(Number(e.target.value));
              setHistory([]);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          w₁ (slope): <span className="font-mono">{liveW[1].toFixed(3)}</span>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.05}
            value={liveW[1]}
            onChange={(e) => {
              setW1(Number(e.target.value));
              setHistory([]);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Decision threshold: <span className="font-mono">{threshold.toFixed(2)}</span>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          Learning rate α: <span className="font-mono">{alpha.toFixed(2)}</span>
          <input
            type="range"
            min={0.01}
            max={3}
            step={0.01}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-foreground/10 bg-background/40 p-3">
        <svg width={PLOT_W} height={PLOT_H} className="text-foreground">
          <line x1={projectX(X_MIN)} y1={projectY(0)} x2={projectX(X_MAX)} y2={projectY(0)} stroke="currentColor" strokeOpacity={0.1} />
          <line x1={projectX(X_MIN)} y1={projectY(1)} x2={projectX(X_MAX)} y2={projectY(1)} stroke="currentColor" strokeOpacity={0.1} />
          <line
            x1={projectX(X_MIN)}
            y1={projectY(threshold)}
            x2={projectX(X_MAX)}
            y2={projectY(threshold)}
            stroke="rgb(148 163 184)"
            strokeDasharray="3 3"
          />
          <polyline
            points={polyPoints}
            fill="none"
            stroke="rgb(34 197 94)"
            strokeWidth={2.5}
          />
          {decisionBoundary !== null && (
            <line
              x1={projectX(decisionBoundary)}
              y1={projectY(Y_MIN)}
              x2={projectX(decisionBoundary)}
              y2={projectY(Y_MAX)}
              stroke="rgb(249 115 22)"
              strokeDasharray="6 4"
              strokeWidth={2}
            />
          )}
          {CLASSIFICATION_DATA.map((d, i) => (
            <circle
              key={i}
              cx={projectX(d.x)}
              cy={projectY(d.y)}
              r={5}
              fill={d.y === 1 ? "rgb(59 130 246)" : "rgb(244 63 94)"}
              opacity={0.85}
            />
          ))}
          <text x={PADDING} y={PLOT_H - 8} fontSize={11} fill="currentColor" opacity={0.6}>
            x = {X_MIN}
          </text>
          <text x={PLOT_W - PADDING - 30} y={PLOT_H - 8} fontSize={11} fill="currentColor" opacity={0.6}>
            x = {X_MAX}
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 text-sm">
        <Stat label="cost" value={liveStep ? liveStep.cost.toFixed(4) : "—"} />
        <Stat label="accuracy" value={(cm.accuracy * 100).toFixed(1) + "%"} />
        <Stat label="TP" value={cm.truePositive.toString()} accent="rgb(59 130 246)" />
        <Stat label="TN" value={cm.trueNegative.toString()} accent="rgb(244 63 94)" />
        <Stat label="FP / FN" value={`${cm.falsePositive} / ${cm.falseNegative}`} />
      </div>

      <p className="text-xs text-foreground/55">
        The cross-entropy cost penalises confident wrong predictions exponentially harder than
        almost-right ones — that&apos;s why a positively-overlapping training set still produces a
        sensible boundary. Try sliding the threshold to see how it trades off false positives
        against false negatives without retraining.
      </p>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-md border border-foreground/10 bg-background/30 p-3">
      <div className="text-xs uppercase tracking-wide text-foreground/55" style={accent ? { color: accent } : undefined}>
        {label}
      </div>
      <div className="mt-1 font-mono text-base">{value}</div>
    </div>
  );
}
