"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PWM_MAX,
  VMAX,
} from "@/lib/projects/motorStepResponse/motorStepResponse";
import {
  DEFAULT_P,
  DEFAULT_PI,
  PLANT_DEFAULT,
  runClosedLoop,
  steadyStateP,
  type ClosedLoopSnapshot,
  type Controller,
} from "@/lib/projects/speedControl/speedControl";

const DT = 0.005;
const DURATION = 1.0;

interface DualPlotProps {
  refValue: number;
  pTrace: ClosedLoopSnapshot[];
  piTrace: ClosedLoopSnapshot[];
  highlight: "P" | "PI";
}

function DualPlot({ refValue, pTrace, piTrace, highlight }: DualPlotProps) {
  const W = 720;
  const H = 280;
  const pad = { top: 18, right: 28, bottom: 28, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const tMax = pTrace[pTrace.length - 1]?.t ?? 1;
  const vMax = Math.max(refValue * 1.2, 5);
  const x = (t: number) => pad.left + (t / tMax) * innerW;
  const y = (v: number) => pad.top + innerH - (v / vMax) * innerH;
  const toPath = (trace: ClosedLoopSnapshot[]) =>
    trace
      .map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(2)} ${y(s.velocity).toFixed(2)}`)
      .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl rounded-lg bg-slate-950 ring-1 ring-slate-800">
      <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="rgb(71 85 105)" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="rgb(71 85 105)" />
      {/* reference */}
      <line x1={pad.left} y1={y(refValue)} x2={pad.left + innerW} y2={y(refValue)} stroke="rgb(244 114 182)" strokeDasharray="6 4" strokeWidth={1.4} />
      <text x={pad.left + innerW + 4} y={y(refValue) + 4} fill="rgb(244 114 182)" fontSize={10}>
        ref
      </text>
      {/* traces */}
      <path d={toPath(pTrace)} fill="none" stroke={highlight === "P" ? "rgb(248 113 113)" : "rgba(248,113,113,0.45)"} strokeWidth={highlight === "P" ? 2.6 : 1.6} />
      <path d={toPath(piTrace)} fill="none" stroke={highlight === "PI" ? "rgb(52 211 153)" : "rgba(52,211,153,0.45)"} strokeWidth={highlight === "PI" ? 2.6 : 1.6} />
      <text x={pad.left - 8} y={pad.top + 12} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">
        {vMax.toFixed(0)}
      </text>
      <text x={pad.left - 8} y={pad.top + innerH} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">
        0
      </text>
      <text x={pad.left - 32} y={pad.top + innerH / 2 + 4} fill="rgb(148 163 184)" fontSize={11}>
        rad/s
      </text>
      <text x={pad.left + innerW} y={pad.top + innerH + 18} fill="rgb(148 163 184)" fontSize={11} textAnchor="end">
        {tMax.toFixed(2)} s
      </text>
      {/* legend */}
      <g transform={`translate(${pad.left + 8}, ${pad.top + 8})`}>
        <rect width={158} height={42} rx={4} fill="rgba(15,23,42,0.85)" stroke="rgb(51 65 85)" />
        <line x1={8} y1={14} x2={28} y2={14} stroke="rgb(248 113 113)" strokeWidth={2.5} />
        <text x={34} y={18} fill="rgb(252 165 165)" fontSize={11}>P controller</text>
        <line x1={8} y1={32} x2={28} y2={32} stroke="rgb(52 211 153)" strokeWidth={2.5} />
        <text x={34} y={36} fill="rgb(110 231 183)" fontSize={11}>PI controller</text>
      </g>
    </svg>
  );
}

export function SpeedControlPlayer() {
  const [reference, setReference] = useState(78.5);
  const [Kp, setKp] = useState(DEFAULT_P.Kp);
  const [a, setA] = useState(DEFAULT_PI.a);
  const [b, setB] = useState(DEFAULT_PI.b);
  const [highlight, setHighlight] = useState<"P" | "PI">("PI");
  const [tick, setTick] = useState(0);

  const pCtrl: Controller = useMemo(() => ({ kind: "P", Kp }), [Kp]);
  const piCtrl: Controller = useMemo(() => ({ kind: "PI", a, b }), [a, b]);
  const pTrace = useMemo(() => runClosedLoop(reference, DURATION, DT, pCtrl), [reference, pCtrl]);
  const piTrace = useMemo(() => runClosedLoop(reference, DURATION, DT, piCtrl), [reference, piCtrl]);
  const ssP = useMemo(() => steadyStateP(reference, { kind: "P", Kp }), [reference, Kp]);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (t: number) => {
      if (!start) start = t;
      const phase = ((t - start) / 3000) % 1;
      setTick(phase);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const idx = Math.min(pTrace.length - 1, Math.floor(tick * pTrace.length));
  const liveP = pTrace[idx]!;
  const livePI = piTrace[idx]!;
  const ssPiFinal = piTrace[piTrace.length - 1]!.velocity;

  return (
    <section className="rounded-xl bg-slate-900/60 p-6 ring-1 ring-slate-800">
      <h2 className="text-lg font-semibold text-slate-200">P vs PI speed control</h2>
      <p className="mt-1 text-sm text-slate-400">
        Same plant from <em>Open-loop step response</em>, now wrapped in a feedback loop. The
        proportional controller leaves a steady-state error because its only way to push out a
        non-zero control signal is for the error to stay non-zero.         The PI controller&apos;s integrator
        accumulates error over time, and that integral term drives the steady-state error to zero.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
        <DualPlot refValue={reference} pTrace={pTrace} piTrace={piTrace} highlight={highlight} />

        <div className="space-y-3 text-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHighlight("P")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition ${highlight === "P" ? "bg-rose-500/20 text-rose-200 ring-rose-400" : "bg-slate-900 text-slate-400 ring-slate-700 hover:text-slate-200"}`}
            >
              Highlight P
            </button>
            <button
              type="button"
              onClick={() => setHighlight("PI")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition ${highlight === "PI" ? "bg-emerald-500/20 text-emerald-200 ring-emerald-400" : "bg-slate-900 text-slate-400 ring-slate-700 hover:text-slate-200"}`}
            >
              Highlight PI
            </button>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-rose-900/40">
            <div className="text-xs text-rose-300">P · live</div>
            <div className="font-mono text-rose-200">v = {liveP.velocity.toFixed(2)}</div>
            <div className="font-mono text-xs text-slate-500">e = {liveP.error.toFixed(2)} · u = {liveP.controlVolts.toFixed(2)} V</div>
            <div className="font-mono text-xs text-slate-500">PWM = {liveP.pwm}</div>
            <div className="mt-1 text-xs text-slate-500">
              steady-state ≈ <span className="text-rose-300">{ssP.toFixed(2)}</span> · err = {(reference - ssP).toFixed(2)}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-emerald-900/40">
            <div className="text-xs text-emerald-300">PI · live</div>
            <div className="font-mono text-emerald-200">v = {livePI.velocity.toFixed(2)}</div>
            <div className="font-mono text-xs text-slate-500">e = {livePI.error.toFixed(2)} · u = {livePI.controlVolts.toFixed(2)} V</div>
            <div className="font-mono text-xs text-slate-500">PWM = {livePI.pwm}</div>
            <div className="mt-1 text-xs text-slate-500">
              final ≈ <span className="text-emerald-300">{ssPiFinal.toFixed(2)}</span> · err = {(reference - ssPiFinal).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-slate-300">
          reference (rad/s)
          <input
            type="range"
            min={10}
            max={120}
            step={0.5}
            value={reference}
            onChange={(e) => setReference(Number(e.target.value))}
            className="mt-1 w-full accent-pink-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">{reference.toFixed(1)}</div>
        </label>

        <label className="text-sm text-slate-300">
          Kp (P · V/(rad/s))
          <input
            type="range"
            min={0.01}
            max={0.6}
            step={0.005}
            value={Kp}
            onChange={(e) => setKp(Number(e.target.value))}
            className="mt-1 w-full accent-rose-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">{Kp.toFixed(3)}</div>
        </label>

        <label className="text-sm text-slate-300">
          a (PI · = Kp+Ki·Ts)
          <input
            type="range"
            min={0.01}
            max={0.4}
            step={0.002}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="mt-1 w-full accent-emerald-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">{a.toFixed(3)}</div>
        </label>

        <label className="text-sm text-slate-300">
          b (PI · = Kp)
          <input
            type="range"
            min={0.01}
            max={0.4}
            step={0.002}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="mt-1 w-full accent-emerald-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">{b.toFixed(3)}</div>
        </label>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Plant params held at <code className="rounded bg-slate-800 px-1 py-0.5">K = {PLANT_DEFAULT.K}</code> rad/s and
        <code className="ml-1 rounded bg-slate-800 px-1 py-0.5">τ = {PLANT_DEFAULT.tau}</code> s. PWM saturated at
        ±{PWM_MAX} (±{VMAX} V). Controllers run at {(DT * 1000).toFixed(0)} ms sample period.
      </p>
    </section>
  );
}
