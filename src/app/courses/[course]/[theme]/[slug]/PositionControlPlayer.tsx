"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PWM_MAX,
} from "@/lib/projects/motorStepResponse/motorStepResponse";
import {
  DEFAULT_CONTROLLER,
  PLANT_DEFAULT,
  runPositionControl,
  type PositionSnapshot,
  type ZDomainController,
} from "@/lib/projects/positionControl/positionControl";

const DT = 0.005;

interface PlotProps {
  trace: PositionSnapshot[];
  amplitude: number;
}

function PositionPlot({ trace, amplitude }: PlotProps) {
  if (trace.length === 0) return null;
  const W = 720;
  const H = 280;
  const pad = { top: 18, right: 28, bottom: 28, left: 56 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const tMax = trace[trace.length - 1]!.t;
  const yMax = Math.max(amplitude * 1.4, 0.5);
  const x = (t: number) => pad.left + (t / tMax) * innerW;
  const y = (v: number) => pad.top + innerH / 2 - (v / yMax) * (innerH / 2 - 6);
  const refPath = trace
    .map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(2)} ${y(s.reference).toFixed(2)}`)
    .join(" ");
  const posPath = trace
    .map((s, i) => `${i === 0 ? "M" : "L"} ${x(s.t).toFixed(2)} ${y(s.position).toFixed(2)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl rounded-lg bg-slate-950 ring-1 ring-slate-800">
      <line x1={pad.left} y1={pad.top + innerH / 2} x2={pad.left + innerW} y2={pad.top + innerH / 2} stroke="rgb(71 85 105)" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="rgb(71 85 105)" />
      <path d={refPath} fill="none" stroke="rgb(244 114 182)" strokeWidth={1.6} strokeDasharray="6 3" />
      <path d={posPath} fill="none" stroke="rgb(56 189 248)" strokeWidth={2.4} />
      <text x={pad.left - 8} y={pad.top + 12} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">+{yMax.toFixed(2)}</text>
      <text x={pad.left - 8} y={pad.top + innerH - 4} fill="rgb(148 163 184)" fontSize={10} textAnchor="end">−{yMax.toFixed(2)}</text>
      <text x={pad.left - 36} y={pad.top + innerH / 2 + 4} fill="rgb(148 163 184)" fontSize={11}>θ (rad)</text>
      <text x={pad.left + innerW} y={pad.top + innerH + 18} fill="rgb(148 163 184)" fontSize={11} textAnchor="end">{tMax.toFixed(2)} s</text>
      <g transform={`translate(${pad.left + 8}, ${pad.top + 8})`}>
        <rect width={148} height={42} rx={4} fill="rgba(15,23,42,0.85)" stroke="rgb(51 65 85)" />
        <line x1={8} y1={14} x2={28} y2={14} stroke="rgb(244 114 182)" strokeWidth={2} strokeDasharray="6 3" />
        <text x={34} y={18} fill="rgb(244 114 182)" fontSize={11}>reference</text>
        <line x1={8} y1={32} x2={28} y2={32} stroke="rgb(56 189 248)" strokeWidth={2.5} />
        <text x={34} y={36} fill="rgb(125 211 252)" fontSize={11}>θ (position)</text>
      </g>
    </svg>
  );
}

interface DialProps {
  position: number;
  reference: number;
  amplitude: number;
}

function Dial({ position, reference, amplitude }: DialProps) {
  const R = 70;
  const cx = 90;
  const cy = 90;
  const refAngle = -Math.PI / 2 + (reference / amplitude) * (Math.PI / 2);
  const posAngle = -Math.PI / 2 + (position / amplitude) * (Math.PI / 2);
  const tickPath: string[] = [];
  for (let i = -3; i <= 3; i++) {
    const a = -Math.PI / 2 + (i / 3) * (Math.PI / 2);
    const r1 = R - 6;
    const r2 = R;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    tickPath.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 180 130" className="w-full max-w-xs">
      <circle cx={cx} cy={cy} r={R} fill="rgb(15 23 42)" stroke="rgb(51 65 85)" strokeWidth={1.5} />
      <path d={tickPath.join(" ")} stroke="rgb(100 116 139)" strokeWidth={1.5} />
      {/* ref needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(refAngle) * (R - 8)}
        y2={cy + Math.sin(refAngle) * (R - 8)}
        stroke="rgb(244 114 182)"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      {/* position needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(posAngle) * (R - 12)}
        y2={cy + Math.sin(posAngle) * (R - 12)}
        stroke="rgb(56 189 248)"
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={4} fill="rgb(56 189 248)" />
      <text x={cx} y={120} textAnchor="middle" fill="rgb(148 163 184)" fontSize={11}>
        θ = {position.toFixed(2)} rad
      </text>
    </svg>
  );
}

export function PositionControlPlayer() {
  const [amplitudeDeg, setAmplitudeDeg] = useState(60);
  const [halfPeriod, setHalfPeriod] = useState(0.4);
  const [K, setK] = useState(DEFAULT_CONTROLLER.K);
  const [a, setA] = useState(DEFAULT_CONTROLLER.a);
  const [b, setB] = useState(DEFAULT_CONTROLLER.b);
  const [tick, setTick] = useState(0);

  const amplitude = (amplitudeDeg * Math.PI) / 180;
  const ctrl: ZDomainController = useMemo(() => ({ K, a, b }), [K, a, b]);
  const duration = halfPeriod * 4;
  const trace = useMemo(
    () => runPositionControl(amplitude, halfPeriod, duration, DT, ctrl),
    [amplitude, halfPeriod, duration, ctrl],
  );

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (t: number) => {
      if (!start) start = t;
      const phase = ((t - start) / 4000) % 1;
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
      <h2 className="text-lg font-semibold text-slate-200">Discrete-time position control</h2>
      <p className="mt-1 text-sm text-slate-400">
        Lab 4 wraps the same first-order motor in a position loop. The compensator
        <code className="mx-1 rounded bg-slate-800 px-1 py-0.5 text-xs">C(z) = K(z−a)/(z−b)</code>
        adds phase lead so the closed-loop can chase a square-wave reference without going
        unstable. The blue trace is the shaft angle; the dashed pink trace is the reference
        flipping sign every half-period.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
        <PositionPlot trace={trace} amplitude={amplitude} />
        <div className="space-y-3 text-sm">
          <Dial position={live.position} reference={live.reference} amplitude={amplitude} />
          <div className="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <div className="text-xs text-slate-500">live · t = {live.t.toFixed(3)} s</div>
            <div className="font-mono text-sky-300">θ = {live.position.toFixed(3)} rad</div>
            <div className="font-mono text-xs text-slate-500">
              ref = {live.reference.toFixed(3)} · err = {live.error.toFixed(3)}
            </div>
            <div className="font-mono text-xs text-slate-500">
              u = {live.controlVolts.toFixed(2)} V · PWM = {live.pwm}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm text-slate-300">
          amplitude (°)
          <input type="range" min={10} max={120} step={5} value={amplitudeDeg} onChange={(e) => setAmplitudeDeg(Number(e.target.value))} className="mt-1 w-full accent-pink-400" />
          <div className="mt-1 font-mono text-xs text-slate-500">±{amplitudeDeg}°</div>
        </label>
        <label className="text-sm text-slate-300">
          half-period (s)
          <input type="range" min={0.2} max={1.0} step={0.05} value={halfPeriod} onChange={(e) => setHalfPeriod(Number(e.target.value))} className="mt-1 w-full accent-pink-400" />
          <div className="mt-1 font-mono text-xs text-slate-500">{halfPeriod.toFixed(2)} s</div>
        </label>
        <label className="text-sm text-slate-300">
          K (controller gain)
          <input type="range" min={1} max={20} step={0.1} value={K} onChange={(e) => setK(Number(e.target.value))} className="mt-1 w-full accent-sky-400" />
          <div className="mt-1 font-mono text-xs text-slate-500">{K.toFixed(2)}</div>
        </label>
        <label className="text-sm text-slate-300">
          a (zero · close to 1)
          <input type="range" min={0} max={0.99} step={0.005} value={a} onChange={(e) => setA(Number(e.target.value))} className="mt-1 w-full accent-sky-400" />
          <div className="mt-1 font-mono text-xs text-slate-500">{a.toFixed(3)}</div>
        </label>
        <label className="text-sm text-slate-300">
          b (pole)
          <input type="range" min={0} max={0.99} step={0.005} value={b} onChange={(e) => setB(Number(e.target.value))} className="mt-1 w-full accent-sky-400" />
          <div className="mt-1 font-mono text-xs text-slate-500">{b.toFixed(3)}</div>
        </label>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Plant K = {PLANT_DEFAULT.K} rad/s, τ = {PLANT_DEFAULT.tau} s · sample period {(DT * 1000).toFixed(0)} ms · PWM saturated at ±{PWM_MAX}.
        Reset gains to lab defaults: K = 7.143, a = 0.9231, b = 0.5094.
      </p>
    </section>
  );
}
