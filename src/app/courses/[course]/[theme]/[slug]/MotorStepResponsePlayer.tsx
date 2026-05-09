"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MOTOR,
  PWM_MAX,
  VMAX,
  estimateSteadyState,
  estimateTimeConstant,
  pwmToVolts,
  runStepResponse,
  steadyStateVelocity,
  type StepResponseSnapshot,
} from "@/lib/projects/motorStepResponse/motorStepResponse";

const DT = 0.005;
const DURATION = 0.5;

interface PlotProps {
  trace: StepResponseSnapshot[];
  ssEstimate: number;
  tauEstimate: number;
}

function ResponsePlot({ trace, ssEstimate, tauEstimate }: PlotProps) {
  if (trace.length === 0) return null;
  const W = 720;
  const H = 280;
  const pad = { top: 18, right: 32, bottom: 28, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const tMax = trace[trace.length - 1]!.t;
  const vAbsMax = Math.max(
    1,
    ...trace.map((p) => Math.abs(p.velocity)),
    Math.abs(ssEstimate) * 1.1,
  );
  const x = (t: number) => pad.left + (t / tMax) * innerW;
  const y = (v: number) => pad.top + innerH / 2 - (v / vAbsMax) * (innerH / 2 - 6);
  const path = trace
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.t).toFixed(2)} ${y(p.velocity).toFixed(2)}`)
    .join(" ");
  const ssY = y(ssEstimate);
  const tauX = x(tauEstimate);
  const tauY = y(0.632 * ssEstimate);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl rounded-lg bg-slate-950 ring-1 ring-slate-800">
      {/* axes */}
      <line x1={pad.left} y1={pad.top + innerH / 2} x2={pad.left + innerW} y2={pad.top + innerH / 2} stroke="rgb(71 85 105)" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="rgb(71 85 105)" strokeWidth={1} />
      {/* steady-state asymptote */}
      {ssEstimate !== 0 && (
        <line x1={pad.left} y1={ssY} x2={pad.left + innerW} y2={ssY} stroke="rgb(244 114 182)" strokeWidth={1.2} strokeDasharray="6 4" />
      )}
      {/* 1τ marker */}
      {tauEstimate > 0 && (
        <>
          <line x1={tauX} y1={pad.top} x2={tauX} y2={pad.top + innerH} stroke="rgb(96 165 250)" strokeWidth={1} strokeDasharray="2 4" />
          <circle cx={tauX} cy={tauY} r={5} fill="rgb(96 165 250)" />
          <text x={tauX + 8} y={tauY - 8} fill="rgb(148 163 184)" fontSize={11}>
            1τ ≈ 63.2%
          </text>
        </>
      )}
      {/* trace */}
      <path d={path} fill="none" stroke="rgb(52 211 153)" strokeWidth={2.4} />
      {/* labels */}
      <text x={pad.left - 8} y={pad.top + 12} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">
        +{vAbsMax.toFixed(0)}
      </text>
      <text x={pad.left - 8} y={pad.top + innerH - 4} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">
        −{vAbsMax.toFixed(0)}
      </text>
      <text x={pad.left - 32} y={pad.top + innerH / 2 + 4} fill="rgb(148 163 184)" fontSize={11}>
        rad/s
      </text>
      <text x={pad.left + innerW} y={pad.top + innerH + 18} fill="rgb(148 163 184)" fontSize={11} textAnchor="end">
        {tMax.toFixed(2)} s
      </text>
    </svg>
  );
}

export function MotorStepResponsePlayer() {
  const [pwm, setPwm] = useState(280);
  const [tau, setTau] = useState(DEFAULT_MOTOR.tau);
  const [K, setK] = useState(DEFAULT_MOTOR.K);
  const [tick, setTick] = useState(0);

  const trace = useMemo(
    () => runStepResponse(pwm, DURATION, DT, { K, tau }),
    [pwm, K, tau],
  );
  const ssEst = useMemo(() => estimateSteadyState(trace), [trace]);
  const tauEst = useMemo(() => estimateTimeConstant(trace), [trace]);
  const ssTheoretical = steadyStateVelocity(pwm, { K, tau });

  // animated playhead — sweeps the full duration in 2 s
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (t: number) => {
      if (!start) start = t;
      const phase = ((t - start) / 2000) % 1;
      setTick(phase);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const idx = Math.min(trace.length - 1, Math.floor(tick * trace.length));
  const live = trace[idx]!;

  return (
    <section className="rounded-xl bg-slate-900/60 p-6 ring-1 ring-slate-800">
      <h2 className="text-lg font-semibold text-slate-200">Open-loop step response</h2>
      <p className="mt-1 text-sm text-slate-400">
        Apply a constant PWM duty cycle to the brushed DC motor. The angular velocity rises along
        a textbook first-order curve; the steady-state value is K·(PWM/PWM<sub>max</sub>) and the
        time constant τ is the time to reach 63.2% of that value.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_240px]">
        <ResponsePlot trace={trace} ssEstimate={ssEst} tauEstimate={tauEst} />

        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <div className="flex justify-between text-xs text-slate-500">
              <span>live (animated)</span>
              <span>t = {live.t.toFixed(3)} s</span>
            </div>
            <div className="mt-1 font-mono text-emerald-300">
              v = {live.velocity.toFixed(2)} rad/s
            </div>
            <div className="font-mono text-xs text-slate-500">
              ≈ {(live.velocity * (60 / (2 * Math.PI))).toFixed(0)} RPM
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <div className="text-xs text-slate-500">applied input</div>
            <div className="mt-1 font-mono text-slate-200">
              PWM = {pwm} / {PWM_MAX}
            </div>
            <div className="font-mono text-xs text-slate-500">
              V<sub>motor</sub> = {pwmToVolts(pwm).toFixed(2)} V (max ±{VMAX} V)
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <div className="text-xs text-slate-500">steady-state</div>
            <div className="mt-1 font-mono text-pink-300">
              v<sub>ss</sub> = {ssTheoretical.toFixed(2)} rad/s
            </div>
            <div className="font-mono text-xs text-slate-500">
              estimate from trace = {ssEst.toFixed(2)}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <div className="text-xs text-slate-500">time constant</div>
            <div className="mt-1 font-mono text-blue-300">τ = {tau.toFixed(3)} s</div>
            <div className="font-mono text-xs text-slate-500">
              estimate from trace = {tauEst.toFixed(3)} s
            </div>
            <div className="font-mono text-xs text-slate-500">
              5τ settling ≈ {(5 * tau * 1000).toFixed(0)} ms
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-slate-300">
          PWM step input
          <input
            type="range"
            min={-PWM_MAX}
            max={PWM_MAX}
            step={10}
            value={pwm}
            onChange={(e) => setPwm(Number(e.target.value))}
            className="mt-1 w-full accent-emerald-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">{pwm} / {PWM_MAX}</div>
        </label>

        <label className="text-sm text-slate-300">
          K (rad/s at full PWM)
          <input
            type="range"
            min={20}
            max={200}
            step={5}
            value={K}
            onChange={(e) => setK(Number(e.target.value))}
            className="mt-1 w-full accent-pink-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">K = {K} rad/s</div>
        </label>

        <label className="text-sm text-slate-300">
          τ (mechanical time constant)
          <input
            type="range"
            min={0.01}
            max={0.2}
            step={0.005}
            value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
            className="mt-1 w-full accent-blue-400"
          />
          <div className="mt-1 font-mono text-xs text-slate-500">τ = {tau.toFixed(3)} s</div>
        </label>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Lab firmware (Lab1_part2_timed_loop.ino, BigCompilationExample.ino): writes
        <code className="mx-1 rounded bg-slate-800 px-1 py-0.5">md.setM1Speed(pwm)</code>
        then samples the LS7366 quadrature encoder (1440 counts/rev) every STREAMPERIOD = 5 ms,
        printing the velocity trace over Serial.
      </p>
    </section>
  );
}
