"use client";

import { useEffect, useState } from "react";
import {
  INITIAL,
  OUTPUT_MASK,
  OUTPUT_WIDTH,
  SHIFT_WIDTH,
  bitsFromString,
  tick,
  toBinary,
  toHex,
  type DatapathState,
} from "@/lib/projects/spiDatapath/spiDatapath";

const SHIFT_MS = 220;

function defaultPattern() {
  return "1010" + "0101" + "1100" + "0011"; // 0xA5C3
}

export function SpiDatapathPlayer() {
  const [state, setState] = useState<DatapathState>(INITIAL);
  const [pattern, setPattern] = useState<string>(defaultPattern());
  const [pendingBits, setPendingBits] = useState<(0 | 1)[]>([]);
  const [shifted, setShifted] = useState<(0 | 1)[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || pendingBits.length === 0) return;
    const id = setTimeout(() => {
      const [b, ...rest] = pendingBits;
      setState((s) => tick(s, { shift_en: 1, load_en: 0, spi_sdata: b }));
      setShifted((sh) => [...sh, b]);
      setPendingBits(rest);
      if (rest.length === 0) setRunning(false);
    }, SHIFT_MS);
    return () => clearTimeout(id);
  }, [running, pendingBits]);

  const startShift = () => {
    let bits: (0 | 1)[];
    try {
      bits = bitsFromString(pattern.padStart(SHIFT_WIDTH, "0").slice(0, SHIFT_WIDTH));
    } catch {
      return;
    }
    setState(INITIAL);
    setShifted([]);
    setPendingBits(bits);
    setRunning(true);
  };

  const doLoad = () => {
    setState((s) => tick(s, { shift_en: 0, load_en: 1, spi_sdata: 0 }));
  };

  const reset = () => {
    setState(INITIAL);
    setPendingBits([]);
    setShifted([]);
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">SPI receiver datapath</h2>
        <p className="text-sm text-foreground/70">
          From <span className="font-mono">lab4_datapath.vhd</span>. A 16-bit shift
          register absorbs <span className="font-mono">spi_sdata</span> bits
          MSB-first while <span className="font-mono">shift_en</span> is high; a single{" "}
          <span className="font-mono">load_en</span> pulse latches the lower 12 bits
          into the parallel output register that drives{" "}
          <span className="font-mono">ad_data</span>.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <label className="block">
          <span className="text-sm">spi_sdata pattern (16 bits, MSB-first)</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value.replace(/[^01]/g, "").slice(0, 16))}
            className="mt-1 w-full rounded border border-foreground/20 bg-transparent px-2 py-1 font-mono"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={startShift}
            disabled={running}
            className="rounded bg-foreground px-3 py-1 text-sm text-background disabled:opacity-60"
          >
            Shift in {pattern.padStart(16, "0").slice(0, 16).length} bits
          </button>
          <button
            onClick={doLoad}
            disabled={running}
            className="rounded bg-emerald-600 px-3 py-1 text-sm text-white disabled:opacity-60"
          >
            Pulse load_en
          </button>
          <button
            onClick={reset}
            className="rounded border border-foreground/30 px-3 py-1 text-sm"
          >
            Reset
          </button>
        </div>
        <div className="text-xs text-foreground/60">
          {pendingBits.length > 0
            ? `streaming bit ${shifted.length + 1} of 16…`
            : shifted.length === 16
            ? "all 16 bits shifted — pulse load_en to capture the low 12 bits"
            : "ready"}
        </div>
      </section>

      <ShiftRegisterView state={state} shifted={shifted} pending={pendingBits} />
      <OutputView state={state} />
    </div>
  );
}

function ShiftRegisterView({
  state,
  shifted,
  pending,
}: {
  state: DatapathState;
  shifted: (0 | 1)[];
  pending: (0 | 1)[];
}) {
  const bits = toBinary(state.shiftRegister, SHIFT_WIDTH).split("");
  return (
    <section className="rounded-md border border-foreground/15 p-4 space-y-3">
      <div className="text-xs uppercase tracking-wide text-foreground/60">
        shift_register [15..0]
      </div>
      <div className="flex flex-wrap gap-1 font-mono">
        {bits.map((b, i) => {
          const isLow12 = i >= SHIFT_WIDTH - OUTPUT_WIDTH;
          return (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded border text-sm ${
                b === "1"
                  ? "border-blue-500 bg-blue-500/30 text-blue-100"
                  : "border-foreground/20 bg-foreground/5 text-foreground/40"
              } ${isLow12 ? "ring-1 ring-emerald-500/60" : ""}`}
              title={`bit ${SHIFT_WIDTH - 1 - i}`}
            >
              {b}
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-foreground/50">
        Green ring marks bits [11..0] that load_en will latch.
      </div>
      <div className="text-xs font-mono text-foreground/70">
        value = {toHex(state.shiftRegister, SHIFT_WIDTH)} ({state.shiftRegister})
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded bg-foreground/5 p-2">
          <div className="font-mono text-foreground/60 text-[10px]">SHIFTED IN ({shifted.length})</div>
          <div className="font-mono break-all">
            {shifted.length === 0 ? "—" : shifted.join("")}
          </div>
        </div>
        <div className="rounded bg-foreground/5 p-2">
          <div className="font-mono text-foreground/60 text-[10px]">QUEUED ({pending.length})</div>
          <div className="font-mono break-all">
            {pending.length === 0 ? "—" : pending.join("")}
          </div>
        </div>
      </div>
    </section>
  );
}

function OutputView({ state }: { state: DatapathState }) {
  const out = state.outputRegister & OUTPUT_MASK;
  const bits = toBinary(out, OUTPUT_WIDTH).split("");
  return (
    <section className="rounded-md border border-foreground/15 p-4 space-y-3">
      <div className="text-xs uppercase tracking-wide text-foreground/60">
        output_register [11..0] → ad_data
      </div>
      <div className="flex flex-wrap gap-1 font-mono">
        {bits.map((b, i) => (
          <div
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded border text-sm ${
              b === "1"
                ? "border-emerald-500 bg-emerald-500/30 text-emerald-100"
                : "border-foreground/20 bg-foreground/5 text-foreground/40"
            }`}
          >
            {b}
          </div>
        ))}
      </div>
      <div className="text-xs font-mono text-foreground/70">
        value = {toHex(out, OUTPUT_WIDTH)} ({out})
      </div>
    </section>
  );
}
