"use client";

import { useEffect, useState } from "react";
import {
  INITIAL,
  formatDisplay,
  step,
  toBcd,
  type Snapshot,
} from "@/lib/projects/stopwatch/stopwatch";
import { DIGIT_TABLE, isSegOn, MINUS } from "@/lib/projects/tiltSevenSeg/tiltSevenSeg";

const TICK_MS = 10; // 100 Hz

// Segment placement for an SVG 7-segment digit
const SEG_PATHS: Record<string, string> = {
  a: "M 6 2 L 26 2",
  b: "M 28 4 L 28 22",
  c: "M 28 26 L 28 44",
  d: "M 6 46 L 26 46",
  e: "M 4 26 L 4 44",
  f: "M 4 4 L 4 22",
  g: "M 6 24 L 26 24",
};

function SevenSegDigit({ byte, dp }: { byte: number; dp: boolean }) {
  return (
    <svg width={36} height={50} viewBox="0 0 32 50">
      {(["a", "b", "c", "d", "e", "f", "g"] as const).map((s) => (
        <path
          key={s}
          d={SEG_PATHS[s]}
          stroke={isSegOn(byte, s) ? "#ef4444" : "#3b1010"}
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            filter: isSegOn(byte, s) ? "drop-shadow(0 0 3px #ef4444)" : undefined,
          }}
        />
      ))}
      <circle cx={31} cy={47} r={2.5} fill={dp ? "#ef4444" : "#3b1010"} />
    </svg>
  );
}

export function StopwatchPlayer() {
  const [snap, setSnap] = useState<Snapshot>(INITIAL);

  useEffect(() => {
    const id = setInterval(() => {
      setSnap((s) => step(s, { type: "tick" }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const bcd = toBcd(snap.hundredths);
  const bytes = bcd.digits.map((d) => DIGIT_TABLE[d]);
  // demonstration of MINUS export — used by the legend
  void MINUS;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Stopwatch FSM</h2>
        <p className="text-sm text-foreground/70">
          ENGS 31 Lab 3 — a hundredths-of-a-second stopwatch on a Basys-3 FPGA.
          Two-state Moore FSM (<span className="font-mono">STOPPED ⇄ RUNNING</span>),
          with a clear button that&apos;s ignored while running. The 100 Hz tick comes
          from a clock-divider counter (same pattern as the sampling counter).
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 flex flex-col items-center gap-3 bg-black">
        <div className="flex items-end gap-1">
          <SevenSegDigit byte={bytes[0]} dp={false} />
          <SevenSegDigit byte={bytes[1]} dp={true} />
          <SevenSegDigit byte={bytes[2]} dp={false} />
          <SevenSegDigit byte={bytes[3]} dp={false} />
        </div>
        <div className="font-mono text-sm text-foreground/80">{formatDisplay(snap.hundredths)} s</div>
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          buttons
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSnap((s) => step(s, { type: "start_stop" }))}
            className={`rounded px-4 py-1 text-sm font-medium ${
              snap.state === "RUNNING"
                ? "bg-amber-500 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {snap.state === "RUNNING" ? "STOP" : "START"}
          </button>
          <button
            onClick={() => setSnap((s) => step(s, { type: "clear" }))}
            disabled={snap.state === "RUNNING"}
            className="rounded border border-foreground/30 px-4 py-1 text-sm disabled:opacity-50"
          >
            CLEAR
          </button>
        </div>
        <div className="text-xs text-foreground/60">
          state: <span className="font-mono">{snap.state}</span> · clear is disabled
          while RUNNING (matches the lab spec).
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          BCD digits sent to display
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          {bcd.digits.map((d, i) => (
            <div key={i} className="rounded border border-foreground/15 p-2">
              <div className="text-foreground/60 text-[10px]">
                pos {i} {i === 1 ? "(dp)" : ""}
              </div>
              <div className="text-base">{d}</div>
              <div className="text-[10px] text-foreground/60">
                seg = 0x{bytes[i].toString(16).padStart(2, "0").toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
