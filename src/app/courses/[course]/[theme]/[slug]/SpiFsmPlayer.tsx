"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COUNT_TC,
  INITIAL,
  STATES,
  outputsFor,
  runTrace,
  type Outputs,
  type Snapshot,
  type State,
} from "@/lib/projects/spiFsm/spiFsm";

const TICK_MS = 350;

const STATE_DESCRIPTIONS: Record<State, string> = {
  SWait: "Idle. spi_cs HIGH. Waiting for take_sample.",
  Shift: "Active transfer. spi_cs LOW, shift_en HIGH, counter advancing.",
  Load: "Capture. load_en HIGH — parallel-load receiver register.",
};

export function SpiFsmPlayer() {
  const [running, setRunning] = useState(false);
  const [snap, setSnap] = useState<Snapshot>(INITIAL);
  const [pulseTakeSample, setPulseTakeSample] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSnap((s) => {
        const trace = runTrace(s, [pulseTakeSample ? 1 : 0]);
        return trace[trace.length - 1];
      });
      // pulse is one-shot
      setPulseTakeSample(false);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, pulseTakeSample]);

  const reset = () => setSnap(INITIAL);
  const stepOnce = () => {
    setSnap((s) => runTrace(s, [pulseTakeSample ? 1 : 0]).at(-1)!);
    setPulseTakeSample(false);
  };

  const fillCount = (snap.state === "Shift" ? snap.count + 1 : 0) / (COUNT_TC + 1);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">SPI controller FSM</h2>
        <p className="text-sm text-foreground/70">
          From <span className="font-mono">Controller_lab4.vhd</span>. Three states drive
          the SPI transaction:{" "}
          <span className="font-mono">SWait → Shift → Load → SWait</span>. The Shift
          state holds for 15 sclk cycles (count 0…14, then TC asserts), giving a 16-bit
          SPI transfer (15 Shifts + 1 Load = 16 sclk pulses).
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="rounded bg-foreground px-3 py-1 text-sm text-background"
          >
            {running ? "Pause sclk" : "Run sclk"}
          </button>
          <button
            onClick={stepOnce}
            className="rounded border border-foreground/30 px-3 py-1 text-sm"
          >
            Single tick
          </button>
          <button
            onClick={() => setPulseTakeSample(true)}
            disabled={pulseTakeSample}
            className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
          >
            pulse take_sample
          </button>
          <button onClick={reset} className="rounded border border-foreground/30 px-3 py-1 text-sm">
            Reset
          </button>
        </div>
        <div className="text-xs text-foreground/60">
          take_sample queued: <span className="font-mono">{pulseTakeSample ? "1" : "0"}</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            state diagram
          </div>
          <svg width="100%" viewBox="0 0 360 180">
            {/* state nodes */}
            {STATES.map((s, i) => {
              const cx = 80 + i * 100;
              const cy = 90;
              const isCurrent = s === snap.state;
              return (
                <g key={s}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={32}
                    fill={isCurrent ? "#3b82f6" : "#222"}
                    stroke={isCurrent ? "#fff" : "#666"}
                    strokeWidth={isCurrent ? 3 : 1}
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontFamily="monospace"
                    fill="#fff"
                  >
                    {s}
                  </text>
                </g>
              );
            })}
            {/* arrows */}
            <defs>
              <marker
                id="arr"
                markerWidth={10}
                markerHeight={10}
                refX={9}
                refY={3}
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#888" />
              </marker>
            </defs>
            <line x1={112} y1={85} x2={148} y2={85} stroke="#888" markerEnd="url(#arr)" />
            <text x={130} y={75} fontSize={9} fill="#888" textAnchor="middle">
              take_sample=1
            </text>
            <line x1={212} y1={85} x2={248} y2={85} stroke="#888" markerEnd="url(#arr)" />
            <text x={230} y={75} fontSize={9} fill="#888" textAnchor="middle">
              TC=1
            </text>
            <path
              d="M 248 100 Q 180 160 112 100"
              fill="none"
              stroke="#888"
              markerEnd="url(#arr)"
            />
            <text x={180} y={155} fontSize={9} fill="#888" textAnchor="middle">
              unconditional
            </text>
          </svg>
          <div className="text-xs text-foreground/70">{STATE_DESCRIPTIONS[snap.state]}</div>
        </div>

        <OutputPanel snap={snap} />
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          shift counter (0 → {COUNT_TC} → TC)
        </div>
        <div className="h-4 rounded bg-foreground/10 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${fillCount * 100}%` }}
          />
        </div>
        <div className="text-xs font-mono text-foreground/70">count = {snap.count}</div>
      </section>
    </div>
  );
}

function OutputRow({
  label,
  val,
  invertHigh = false,
}: {
  label: string;
  val: 0 | 1;
  invertHigh?: boolean;
}) {
  const active = invertHigh ? val === 0 : val === 1;
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="w-24 text-right">{label}</span>
      <div
        className={`h-4 w-12 rounded text-center ${
          active ? "bg-emerald-500 text-white" : "bg-foreground/10 text-foreground/60"
        }`}
      >
        {val}
      </div>
      <span className="text-foreground/50">{active ? "ASSERTED" : "—"}</span>
    </div>
  );
}

function OutputPanel({ snap }: { snap: Snapshot }) {
  const o: Outputs = useMemo(() => outputsFor(snap.state), [snap.state]);
  return (
    <div className="rounded-md border border-foreground/15 p-4 space-y-2">
      <div className="text-xs uppercase tracking-wide text-foreground/60">outputs</div>
      <OutputRow label="spi_cs" val={o.spi_cs} invertHigh />
      <OutputRow label="shift_en" val={o.shift_en} />
      <OutputRow label="load_en" val={o.load_en} />
      <OutputRow label="CE (counter)" val={o.CE} />
      <div className="pt-2 text-[10px] text-foreground/50">
        spi_cs is active-LOW (asserted = 0). All others active-HIGH.
      </div>
    </div>
  );
}
