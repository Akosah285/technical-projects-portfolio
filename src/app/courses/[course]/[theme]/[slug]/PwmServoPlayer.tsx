"use client";

import { useEffect, useRef, useState } from "react";

import {
  initialServoState,
  processServoCommand,
  tickHeartbeat,
  dutyToAngle,
  LOW_DUTY,
  HIGH_DUTY,
  type ServoState,
} from "@/lib/projects/pwmServo/pwmServo";

const COMMANDS = [
  { label: "a (+0.25%)", cmd: "a" },
  { label: "s (-0.25%)", cmd: "s" },
  { label: "low (5.25%)", cmd: "low" },
  { label: "high (10.25%)", cmd: "high" },
  { label: "q (quit)", cmd: "q" },
];

export function PwmServoPlayer() {
  const [state, setState] = useState<ServoState>(initialServoState);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.done) return;
    const id = window.setInterval(() => {
      setState((s) => (s.done ? s : tickHeartbeat(s)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.done]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  const angle = dutyToAngle(state.duty);
  const dutyPct = ((state.duty - LOW_DUTY) / (HIGH_DUTY - LOW_DUTY)) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Servo PWM controller</h2>
        <p className="text-sm text-white/60">
          AXI Timer 0 generates a 100 Hz PWM whose duty cycle (5.25 – 10.25 %) maps to the servo arm
          (0 – 180°). The TTC heartbeat ticks once per second, toggling LD4 on the board so you can
          tell the SoC is alive.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMANDS.map((c) => (
              <button
                key={c.cmd}
                type="button"
                disabled={state.done}
                onClick={() => setState((s) => processServoCommand(s, c.cmd))}
                className="rounded-md border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-mono text-white/80 hover:bg-white/10 disabled:opacity-40"
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setState(initialServoState)}
              className="rounded-md border border-white/15 bg-pink-500/20 px-3 py-1.5 text-xs font-mono text-white/80 hover:bg-pink-500/30"
            >
              reset
            </button>
          </div>

          <div
            ref={logRef}
            className="h-72 overflow-y-auto rounded-md border border-white/10 bg-black/60 p-3 font-mono text-xs text-emerald-300"
          >
            {state.log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            {state.done && <div className="text-pink-300">[program exited]</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-black/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>duty cycle</span>
              <span className="text-white">{state.duty.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-fuchsia-400 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, dutyPct))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>5.25%</span>
              <span>10.25%</span>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/60 p-4 flex flex-col items-center gap-3">
            <svg viewBox="-110 -110 220 130" className="h-40 w-full">
              <defs>
                <radialGradient id="hub" cx="0" cy="0" r="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#831843" />
                </radialGradient>
              </defs>
              <path
                d="M -100 0 A 100 100 0 0 1 100 0"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
                fill="none"
              />
              <line x1="-100" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" />
              <g transform={`rotate(${-180 + angle})`}>
                <line x1="0" y1="0" x2="92" y2="0" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
                <circle cx="92" cy="0" r="6" fill="#fb7185" />
              </g>
              <circle cx="0" cy="0" r="14" fill="url(#hub)" stroke="#fda4af" strokeWidth="2" />
              <text x="0" y="22" textAnchor="middle" className="fill-white/60" fontSize="10" fontFamily="monospace">
                {angle.toFixed(0)}°
              </text>
            </svg>
            <div className="flex items-center gap-3 text-xs font-mono text-white/60">
              <span>TTC heartbeat</span>
              <div
                className="h-4 w-4 rounded-full border border-white/20"
                style={{
                  backgroundColor: state.heartbeatLed ? "#34d399" : "#1f2937",
                  boxShadow: state.heartbeatLed ? "0 0 10px #34d399" : "none",
                }}
              />
              <span className="text-white/40">tick #{state.heartbeatCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
