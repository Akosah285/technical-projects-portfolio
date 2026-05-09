"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COUNT_PROGRAM,
  LED_PINS,
  SEQ_PROGRAM,
  isPinLit,
  runProgram,
} from "@/lib/projects/blinky/blinky";

type Mode = "seq" | "count";

const MODE_LABEL: Record<Mode, string> = {
  seq: "blinkySEQ.c — sequence",
  count: "blinkyCNT.c — 3-bit counter",
};

function bitsBinary(value: number): string {
  return value.toString(2).padStart(8, "0");
}

export function BlinkyPlayer() {
  const [mode, setMode] = useState<Mode>("seq");
  const [speed, setSpeed] = useState(2); // playback rate; 2 = 2× real-time
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = useMemo(() => {
    return runProgram(mode === "seq" ? SEQ_PROGRAM : COUNT_PROGRAM);
  }, [mode]);

  useEffect(() => {
    const t = setTimeout(() => setFrameIdx(0), 0);
    return () => clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    if (frames.length === 0) return;
    const current = frames[frameIdx % frames.length];
    const wait = Math.max(40, current.durationMs / speed);
    timerRef.current = setTimeout(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, wait);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, frameIdx, frames, speed]);

  const current = frames[frameIdx % frames.length];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Blinky — virtual AVR registers</h2>
        <p className="text-sm text-foreground/70">
          A faithful in-browser simulation of Lab 1. Two 8-bit registers — DDRD (data
          direction) and PORTD (output) — are driven by the exact same bit-twiddling
          idioms (<code>|=</code>, <code>&amp;= ~</code>, <code>^=</code>) the C source
          uses. An LED is &ldquo;lit&rdquo; only when its DDRD bit AND its PORTD bit are
          both 1.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["seq", "count"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded border px-3 py-1 text-xs ${
                mode === m
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20"
              }`}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded bg-foreground px-3 py-1 text-sm text-background"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setFrameIdx((i) => (i + 1) % frames.length);
          }}
          className="rounded border border-foreground/20 px-3 py-1 text-sm"
        >
          Step
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setFrameIdx(0);
          }}
          className="rounded border border-foreground/20 px-3 py-1 text-sm"
        >
          Reset
        </button>
        <label className="flex items-center gap-2 text-sm">
          speed
          <input
            type="range"
            min={0.25}
            max={8}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="w-12 font-mono">{speed.toFixed(2)}×</span>
        </label>
      </section>

      <section className="rounded-md border border-foreground/15 p-4">
        <div className="flex items-end justify-around">
          {LED_PINS.map((pin) => {
            const lit = isPinLit(current.state, pin.bit);
            return (
              <div key={pin.bit} className="flex flex-col items-center gap-2">
                <div
                  className="h-16 w-16 rounded-full border-4 transition-shadow"
                  style={{
                    background: lit ? "#fde047" : "#1f1f1f",
                    borderColor: lit ? "#facc15" : "#3f3f3f",
                    boxShadow: lit
                      ? "0 0 28px 6px rgba(253, 224, 71, 0.7)"
                      : "none",
                  }}
                />
                <div className="text-xs font-mono">{pin.label} (bit {pin.bit})</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">DDRD</div>
          <div className="font-mono text-base">
            0b{bitsBinary(current.state.DDRD)}
            <span className="ml-2 text-foreground/60">
              0x{current.state.DDRD.toString(16).padStart(2, "0").toUpperCase()}
            </span>
          </div>
          <div className="mt-1 text-xs text-foreground/60">
            Pins configured as outputs.
          </div>
        </div>
        <div className="rounded-md border border-foreground/15 p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">PORTD</div>
          <div className="font-mono text-base">
            0b{bitsBinary(current.state.PORTD)}
            <span className="ml-2 text-foreground/60">
              0x{current.state.PORTD.toString(16).padStart(2, "0").toUpperCase()}
            </span>
          </div>
          <div className="mt-1 text-xs text-foreground/60">
            Output values; only matters where DDRD bit is set.
          </div>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-3 text-sm">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          current instruction (t = {current.timeMs} ms)
        </div>
        <pre className="mt-1 overflow-x-auto font-mono text-sm">
          {current.description}
        </pre>
      </section>

      <details className="text-xs">
        <summary className="cursor-pointer font-medium">show full program trace</summary>
        <ol className="mt-2 max-h-64 overflow-y-auto font-mono">
          {frames.map((f, i) => (
            <li
              key={i}
              className={`px-2 py-0.5 ${i === frameIdx ? "bg-foreground/15" : ""}`}
            >
              <span className="inline-block w-12 text-right text-foreground/50">
                {f.timeMs}ms
              </span>{" "}
              {f.description}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
