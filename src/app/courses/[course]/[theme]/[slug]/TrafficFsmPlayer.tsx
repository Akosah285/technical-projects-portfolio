"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  initialFsmState,
  step,
  type FsmState,
  type Light,
} from "@/lib/projects/trafficFsm/trafficFsm";

const LIGHT_COLOR: Record<Light, string> = {
  RED: "#ef4444",
  YELLOW_1: "#f59e0b",
  GREEN: "#10b981",
  YELLOW_2: "#f59e0b",
  TF_PED_CROSS: "#3b82f6",
  BLUE_STATE_ON: "#3b82f6",
  BLUE_STATE_OFF: "#1e293b",
  GATE_CLOSE: "#dc2626",
  GATE_OPEN: "#22c55e",
};

const LIGHTS: Light[] = [
  "RED",
  "YELLOW_1",
  "GREEN",
  "YELLOW_2",
  "TF_PED_CROSS",
  "BLUE_STATE_ON",
  "BLUE_STATE_OFF",
  "GATE_CLOSE",
  "GATE_OPEN",
];

export function TrafficFsmPlayer() {
  const [state, setState] = useState<FsmState>(initialFsmState);
  const [auto, setAuto] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setState((s) => step(s, { kind: "tick" }));
    }, 2000);
    return () => window.clearInterval(id);
  }, [auto]);

  useEffect(() => {
    if (state.light !== "BLUE_STATE_ON" && state.light !== "BLUE_STATE_OFF") return;
    const id = window.setInterval(() => {
      setState((s) => step(s, { kind: "blue_blink" }));
    }, 500);
    return () => window.clearInterval(id);
  }, [state.light]);

  const carLight = useMemo(() => {
    if (state.light === "RED" || state.light === "TF_PED_CROSS") return "RED";
    if (state.light === "GREEN") return "GREEN";
    if (state.light === "YELLOW_1" || state.light === "YELLOW_2") return "YELLOW";
    return "OFF";
  }, [state.light]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Level-crossing FSM</h2>
        <p className="text-sm text-white/60">
          A 9-state event-driven FSM for a level-crossing intersection. Four TTC counters fire timer
          ticks at different intervals; switches simulate maintenance and train arrival; the
          pedestrian button requests a crossing. Watch the state cycle through its normal RED →
          YELLOW → GREEN → YELLOW loop, then divert into pedestrian, maintenance, or train modes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-black/60 p-4 flex flex-col items-center gap-3">
            <svg viewBox="0 0 240 200" className="h-48 w-full">
              <rect x="0" y="80" width="240" height="60" fill="#1f2937" />
              <line x1="0" y1="110" x2="240" y2="110" stroke="#fbbf24" strokeDasharray="8 8" strokeWidth="2" />
              <rect x="40" y="20" width="40" height="60" rx="6" fill="#0f172a" stroke="rgba(255,255,255,0.2)" />
              <circle cx="60" cy="32" r="8" fill={carLight === "RED" ? "#ef4444" : "#1e293b"} />
              <circle cx="60" cy="50" r="8" fill={carLight === "YELLOW" ? "#f59e0b" : "#1e293b"} />
              <circle cx="60" cy="68" r="8" fill={carLight === "GREEN" ? "#10b981" : "#1e293b"} />
              <rect x="120" y="60" width="40" height="20" fill="#fbbf24" opacity={state.light === "TF_PED_CROSS" ? 1 : 0.3} />
              <text x="140" y="74" textAnchor="middle" className="fill-black" fontSize="9" fontFamily="monospace">
                PED
              </text>
              <g transform={`translate(180, 110) rotate(${state.light === "GATE_CLOSE" ? 0 : -80})`}>
                <line x1="0" y1="0" x2="40" y2="0" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
              </g>
              <circle cx="180" cy="110" r="4" fill="#dc2626" />
              {(state.light === "BLUE_STATE_ON" || state.light === "BLUE_STATE_OFF") && (
                <circle
                  cx="200"
                  cy="40"
                  r="10"
                  fill={state.light === "BLUE_STATE_ON" ? "#3b82f6" : "#1e293b"}
                  stroke="#60a5fa"
                />
              )}
              <text x="120" y="180" textAnchor="middle" className="fill-white/70" fontSize="11" fontFamily="monospace">
                state = {state.light}
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setState((s) => step(s, { kind: "ped_press" }))}
              className="rounded-md border border-white/15 bg-amber-500/30 px-3 py-2 text-xs font-mono text-white/90 hover:brightness-125"
            >
              ped_press (BTN0/1)
            </button>
            <button
              type="button"
              onClick={() => setState((s) => step(s, { kind: "ped_done" }))}
              className="rounded-md border border-white/15 bg-cyan-500/30 px-3 py-2 text-xs font-mono text-white/90 hover:brightness-125"
            >
              ped_done (TTC2)
            </button>
            <button
              type="button"
              onClick={() => setState((s) => step(s, { kind: "toggle_maintenance" }))}
              className="rounded-md border border-white/15 bg-blue-500/30 px-3 py-2 text-xs font-mono text-white/90 hover:brightness-125"
            >
              SW0: maintenance
            </button>
            <button
              type="button"
              onClick={() => setState((s) => step(s, { kind: "toggle_train" }))}
              className="rounded-md border border-white/15 bg-rose-500/30 px-3 py-2 text-xs font-mono text-white/90 hover:brightness-125"
            >
              SW1: train arrival
            </button>
            <button
              type="button"
              onClick={() => setState((s) => step(s, { kind: "tick" }))}
              className="rounded-md border border-white/15 bg-emerald-500/30 px-3 py-2 text-xs font-mono text-white/90 hover:brightness-125"
            >
              manual tick (TTC0)
            </button>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-mono text-white/90 hover:bg-white/20"
            >
              auto-tick: {auto ? "ON" : "OFF"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setState(initialFsmState)}
            className="rounded-md border border-white/15 bg-pink-500/20 px-3 py-1.5 text-xs font-mono text-white/80 hover:bg-pink-500/30"
          >
            reset
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-white/10 bg-black/60 p-3 grid grid-cols-3 gap-2">
            {LIGHTS.map((l) => (
              <div
                key={l}
                className={`rounded p-2 text-[10px] font-mono text-white text-center transition-all ${
                  state.light === l ? "ring-2 ring-pink-400 scale-105" : "opacity-50"
                }`}
                style={{ backgroundColor: LIGHT_COLOR[l] + (state.light === l ? "" : "33") }}
              >
                {l}
              </div>
            ))}
          </div>

          <div
            ref={logRef}
            className="h-72 overflow-y-auto rounded-md border border-white/10 bg-black/60 p-3 font-mono text-xs text-emerald-300"
          >
            {state.log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
