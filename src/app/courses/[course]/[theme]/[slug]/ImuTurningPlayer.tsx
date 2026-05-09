"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RAD_TO_DEG,
  TURN_A,
  TURN_B,
  TURN_K,
  runImuTurning,
} from "@/lib/projects/imuTurning/imuTurning";

const PLOT_W = 600;
const PLOT_H = 200;
const PLOT_PAD = 36;
const DURATION_S = 3;

function degToXY(deg: number, r: number, cx: number, cy: number): [number, number] {
  // 0° = up (north), positive clockwise (compass convention)
  const rad = (deg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function ImuTurningPlayer() {
  const [target, setTarget] = useState(90);
  const [K, setK] = useState(TURN_K);
  const [a, setA] = useState(TURN_A);
  const [b, setB] = useState(TURN_B);
  const [playT, setPlayT] = useState(DURATION_S);
  const [playing, setPlaying] = useState(false);

  const trace = useMemo(
    () => runImuTurning({ targetDeg: target, K, a, b, durationS: DURATION_S }),
    [target, K, a, b],
  );

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dtMs = now - last;
      last = now;
      setPlayT((t) => {
        const next = t + dtMs / 1000;
        return next >= DURATION_S ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const playIdx = Math.min(
    trace.length - 1,
    Math.max(0, Math.floor((playT / DURATION_S) * (trace.length - 1))),
  );
  const liveSample = trace[playIdx];

  const maxRel = Math.max(...trace.map((s) => Math.abs(s.relHeadingDeg)), Math.abs(target));
  const yScale = (PLOT_H - 2 * PLOT_PAD) / (maxRel * 1.1 || 1);

  const traceY = (deg: number) => PLOT_H / 2 - deg * yScale;
  const traceX = (i: number) =>
    PLOT_PAD + (i / (trace.length - 1)) * (PLOT_W - 2 * PLOT_PAD);

  const headingPath = trace
    .map((s, i) => `${i === 0 ? "M" : "L"} ${traceX(i)} ${traceY(s.relHeadingDeg)}`)
    .join(" ");

  // Top-down robot view
  const ROBOT_R = 90;
  const ROBOT_CX = 110;
  const ROBOT_CY = 110;
  const targetEnd = degToXY(target, ROBOT_R, ROBOT_CX, ROBOT_CY);
  const headingEnd = degToXY(liveSample.relHeadingDeg, ROBOT_R, ROBOT_CX, ROBOT_CY);

  const finalErr = Math.abs(trace[trace.length - 1].errorRad) * RAD_TO_DEG;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-widest text-white/50">
            Top-down robot view
          </div>
          <svg
            viewBox="0 0 220 220"
            className="mt-3 h-56 w-full"
            aria-label="Robot heading dial"
          >
            <circle
              cx={ROBOT_CX}
              cy={ROBOT_CY}
              r={ROBOT_R}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
            {/* Cardinal ticks */}
            {[0, 90, 180, 270].map((d) => {
              const [x, y] = degToXY(d, ROBOT_R, ROBOT_CX, ROBOT_CY);
              const [xi, yi] = degToXY(d, ROBOT_R - 6, ROBOT_CX, ROBOT_CY);
              return (
                <line
                  key={d}
                  x1={x}
                  y1={y}
                  x2={xi}
                  y2={yi}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={1}
                />
              );
            })}
            <text x={ROBOT_CX} y={18} textAnchor="middle" className="fill-white/40 text-[10px]">
              N (0°)
            </text>
            {/* Target arrow (dashed) */}
            <line
              x1={ROBOT_CX}
              y1={ROBOT_CY}
              x2={targetEnd[0]}
              y2={targetEnd[1]}
              stroke="#f472b6"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            {/* Live heading arrow */}
            <line
              x1={ROBOT_CX}
              y1={ROBOT_CY}
              x2={headingEnd[0]}
              y2={headingEnd[1]}
              stroke="#60a5fa"
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* Robot body */}
            <circle cx={ROBOT_CX} cy={ROBOT_CY} r={14} fill="#1e293b" stroke="#60a5fa" strokeWidth={2} />
          </svg>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/70">
            <div>
              <div className="text-white/40">Target</div>
              <div className="font-mono text-pink-300">{target.toFixed(0)}°</div>
            </div>
            <div>
              <div className="text-white/40">Live</div>
              <div className="font-mono text-blue-300">{liveSample.relHeadingDeg.toFixed(1)}°</div>
            </div>
            <div>
              <div className="text-white/40">Error</div>
              <div className="font-mono">{(liveSample.errorRad * RAD_TO_DEG).toFixed(1)}°</div>
            </div>
            <div>
              <div className="text-white/40">PWM</div>
              <div className="font-mono">{liveSample.pwm.toFixed(0)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/50">
                Heading vs. time
              </div>
              <div className="text-sm text-white/70">
                Lag compensator chases the target heading; settles to within
                <span className="text-emerald-300"> {finalErr.toFixed(1)}° </span>
                after {DURATION_S}s.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/80 hover:bg-white/20"
            >
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <svg
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            className="mt-3 h-48 w-full"
            aria-label="Heading vs time plot"
          >
            <line
              x1={PLOT_PAD}
              y1={PLOT_H / 2}
              x2={PLOT_W - PLOT_PAD}
              y2={PLOT_H / 2}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
            />
            <line
              x1={PLOT_PAD}
              y1={traceY(target)}
              x2={PLOT_W - PLOT_PAD}
              y2={traceY(target)}
              stroke="#f472b6"
              strokeWidth={1.5}
              strokeDasharray="6 6"
            />
            <path d={headingPath} fill="none" stroke="#60a5fa" strokeWidth={2} />
            <circle cx={traceX(playIdx)} cy={traceY(liveSample.relHeadingDeg)} r={4} fill="#fbbf24" />
            <text x={PLOT_W - PLOT_PAD} y={traceY(target) - 4} textAnchor="end" className="fill-pink-300 text-[10px]">
              ref {target}°
            </text>
          </svg>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Slider
          label="Target angle (°)"
          value={target}
          min={-180}
          max={180}
          step={5}
          onChange={setTarget}
          format={(v) => `${v.toFixed(0)}°`}
        />
        <Slider
          label="K (compensator gain)"
          value={K}
          min={1}
          max={12}
          step={0.1}
          onChange={setK}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label="a (zero)"
          value={a}
          min={0.5}
          max={1.0}
          step={0.001}
          onChange={setA}
          format={(v) => v.toFixed(3)}
        />
        <Slider
          label="b (pole)"
          value={b}
          min={0.5}
          max={1.0}
          step={0.001}
          onChange={setB}
          format={(v) => v.toFixed(3)}
        />
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}
function Slider({ label, value, min, max, step, onChange, format }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/70">
      <span className="flex items-center justify-between">
        <span className="uppercase tracking-widest text-white/50">{label}</span>
        <span className="font-mono text-white">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-blue-400"
      />
    </label>
  );
}
