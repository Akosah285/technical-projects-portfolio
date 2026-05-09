"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TCOUNT,
  INITIAL,
  sampleHz,
  tick,
  type CounterState,
} from "@/lib/projects/samplingCounter/samplingCounter";

const TICKS_PER_FRAME_BASE = 50; // simulated sclk pulses per animation frame
const FRAME_MS = 33;

export function SamplingCounterPlayer() {
  const [state, setState] = useState<CounterState>(INITIAL);
  const [tcount, setTcount] = useState<number>(200);
  const [literalVhdl, setLiteralVhdl] = useState(false);
  const [running, setRunning] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [recentPulses, setRecentPulses] = useState<number[]>([]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setState((prev) => {
        let s = prev;
        let pulses = 0;
        const newPulseTimes: number[] = [];
        for (let i = 0; i < TICKS_PER_FRAME_BASE; i++) {
          s = tick(s, tcount, { literalVhdl });
          if (s.takeSample === 1 && s.count === 0) {
            pulses++;
            newPulseTimes.push(Date.now() + i);
          }
        }
        if (pulses > 0) {
          setTimeout(() => {
            setPulseCount((p) => p + pulses);
            setRecentPulses((rp) => [...newPulseTimes, ...rp].slice(0, 30));
          }, 0);
        }
        return s;
      });
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [running, tcount, literalVhdl]);

  const reset = () => {
    setState(INITIAL);
    setPulseCount(0);
    setRecentPulses([]);
  };

  const stepOnce = () => setState((s) => tick(s, tcount, { literalVhdl }));

  const fill = state.count / tcount;
  const sclkHz = 100_000_000;
  const expectedHz = sampleHz(sclkHz, tcount);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Sampling counter (clock divider)</h2>
        <p className="text-sm text-foreground/70">
          From <span className="font-mono">sampling_counter.vhd</span>. A free-running
          counter on the FPGA&apos;s 100 MHz <span className="font-mono">sclk</span>.
          Every <span className="font-mono">TCount + 1</span> sclk ticks the counter
          rolls over and asserts <span className="font-mono">take_sample</span> for one
          cycle — the strobe that triggers the SPI controller to start a fresh ADC
          conversion.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <label className="block text-sm">
          <span>
            TCount = <span className="font-mono">{tcount.toLocaleString()}</span>
          </span>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={tcount}
            onChange={(e) => {
              setTcount(parseInt(e.target.value, 10));
              reset();
            }}
            className="mt-1 w-full"
          />
        </label>
        <div className="text-xs text-foreground/60">
          @ 100 MHz sclk → take_sample fires every {(1000 / expectedHz).toFixed(3)} ms (≈{" "}
          {expectedHz.toFixed(1)} Hz). The lab&apos;s default is{" "}
          <span className="font-mono">TCount = {DEFAULT_TCOUNT.toLocaleString()}</span>.
        </div>

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
            onClick={reset}
            className="rounded border border-foreground/30 px-3 py-1 text-sm"
          >
            Reset
          </button>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={literalVhdl}
              onChange={(e) => setLiteralVhdl(e.target.checked)}
            />
            Literal VHDL mode (latched bug)
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            counter
          </div>
          <div className="font-mono text-3xl">
            {state.count.toLocaleString()} / {tcount.toLocaleString()}
          </div>
          <div className="h-3 rounded bg-foreground/10 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, fill * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-md border border-foreground/15 p-4 space-y-3 flex flex-col items-center">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            take_sample (1-cycle pulse)
          </div>
          <div
            className={`h-20 w-20 rounded-full transition-all ${
              state.takeSample === 1
                ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
                : "bg-foreground/10"
            }`}
          />
          <div className="font-mono text-sm">
            current: {state.takeSample}
          </div>
          <div className="text-xs text-foreground/60">
            total pulses: <span className="font-mono">{pulseCount}</span>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          recent take_sample pulses
        </div>
        <div className="flex h-6 items-end gap-1 overflow-hidden">
          {recentPulses.length === 0 ? (
            <div className="text-xs text-foreground/50">no pulses yet…</div>
          ) : (
            recentPulses.map((t) => (
              <div
                key={t}
                className="w-1 rounded-t bg-emerald-500"
                style={{ height: "100%" }}
                title={new Date(t).toISOString()}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
