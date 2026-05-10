"use client";

import { useEffect, useRef, useState } from "react";

import {
  initialAdcState,
  pressButton,
  setPot,
  potToDuty,
  LOW_DUTY,
  HIGH_DUTY,
  TEMP_C,
  VCC_V,
  type AdcState,
} from "@/lib/projects/adcSensors/adcSensors";

const BUTTONS = [
  { idx: 0, label: "BTN0 — read temp", color: "bg-rose-500/30" },
  { idx: 1, label: "BTN1 — read VccInt", color: "bg-amber-500/30" },
  { idx: 2, label: "BTN2 — read pot", color: "bg-cyan-500/30" },
  { idx: 3, label: "BTN3 — pot → servo", color: "bg-emerald-500/30" },
];

export function AdcSensorsPlayer() {
  const [state, setState] = useState<AdcState>(initialAdcState);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  const angle = ((state.duty - LOW_DUTY) / (HIGH_DUTY - LOW_DUTY)) * 180;
  const projectedDuty = potToDuty(state.pot);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">XADC sensor bench</h2>
        <p className="text-sm text-white/60">
          The Zynq&apos;s on-chip XADC samples temp, internal Vcc, and the on-board potentiometer
          (channel 30, AUX14). Each push-button reads a different channel; BTN3 maps the pot voltage
          straight onto the servo&apos;s duty cycle.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-black/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>pot voltage</span>
              <span className="text-white">{state.pot.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.pot}
              onChange={(e) => setState((s) => setPot(s, parseFloat(e.target.value)))}
              className="w-full accent-pink-400"
            />
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/40">
              <div className="rounded bg-white/5 p-2">
                <div className="text-white/50">temp</div>
                <div className="text-white">{TEMP_C.toFixed(2)} °C</div>
              </div>
              <div className="rounded bg-white/5 p-2">
                <div className="text-white/50">vccInt</div>
                <div className="text-white">{VCC_V.toFixed(2)} V</div>
              </div>
              <div className="rounded bg-white/5 p-2">
                <div className="text-white/50">pot→duty</div>
                <div className="text-white">{projectedDuty.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BUTTONS.map((b) => (
              <button
                key={b.idx}
                type="button"
                onClick={() => setState((s) => pressButton(s, b.idx))}
                className={`rounded-md border border-white/15 ${b.color} px-3 py-3 text-xs font-mono text-white/90 hover:brightness-125`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setState(initialAdcState)}
            className="rounded-md border border-white/15 bg-pink-500/20 px-3 py-1.5 text-xs font-mono text-white/80 hover:bg-pink-500/30"
          >
            reset
          </button>
        </div>

        <div className="space-y-4">
          <div
            ref={logRef}
            className="h-72 overflow-y-auto rounded-md border border-white/10 bg-black/60 p-3 font-mono text-xs text-emerald-300"
          >
            {state.log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-black/60 p-4 flex flex-col items-center gap-3">
            <svg viewBox="-110 -110 220 130" className="h-32 w-full">
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
              <circle cx="0" cy="0" r="14" fill="#831843" stroke="#fda4af" strokeWidth="2" />
              <text x="0" y="22" textAnchor="middle" className="fill-white/60" fontSize="10" fontFamily="monospace">
                {angle.toFixed(0)}° · {state.duty.toFixed(2)}%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
