"use client";

import { useEffect, useRef, useState } from "react";
import {
  initialReplState,
  processCommand,
  type ReplState,
  type RgbColor,
} from "@/lib/projects/uartLedRepl/uartLedRepl";

const RGB_HEX: Record<RgbColor, string> = {
  red: "#f87171",
  green: "#4ade80",
  blue: "#60a5fa",
  yellow: "#facc15",
  off: "#1f2937",
};

const RGB_GLOW: Record<RgbColor, string> = {
  red: "#f8717155",
  green: "#4ade8055",
  blue: "#60a5fa55",
  yellow: "#facc1555",
  off: "transparent",
};

function BoardLed({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border border-white/20 transition"
        style={{
          background: on ? "#fde047" : "#1f2937",
          boxShadow: on ? "0 0 14px 2px #fde04788" : "none",
        }}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
        {label}
      </span>
    </div>
  );
}

function PsLed({ on }: { on: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border border-white/20 transition"
        style={{
          background: on ? "#86efac" : "#1f2937",
          boxShadow: on ? "0 0 14px 2px #86efac88" : "none",
        }}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
        LD4 (PS)
      </span>
    </div>
  );
}

function RgbLed({ color }: { color: RgbColor }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-8 w-8 rounded-full border border-white/20 transition"
        style={{
          background: RGB_HEX[color],
          boxShadow: `0 0 18px 4px ${RGB_GLOW[color]}`,
        }}
      />
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
        RGB
      </span>
    </div>
  );
}

const COMMAND_HINTS: Array<{ key: string; label: string }> = [
  { key: "0", label: "toggle LD0" },
  { key: "1", label: "toggle LD1" },
  { key: "2", label: "toggle LD2" },
  { key: "3", label: "toggle LD3" },
  { key: "r", label: "RGB red" },
  { key: "g", label: "RGB green" },
  { key: "b", label: "RGB blue" },
  { key: "y", label: "RGB yellow" },
  { key: "q", label: "quit" },
];

export function UartLedReplPlayer() {
  const [state, setState] = useState<ReplState>(() => initialReplState());
  const [buffer, setBuffer] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [state.log]);

  function send(cmd: string) {
    if (state.done) return;
    setState((s) => processCommand(s, cmd));
    setBuffer("");
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      send(buffer.trim());
    }
  }

  function reset() {
    setState(initialReplState());
    setBuffer("");
    inputRef.current?.focus();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">
          ZYBO-Z7 UART REPL
        </h2>
        <p className="text-sm text-white/60">
          The same single-character REPL that runs in <code>blinky.c</code>.
          Type a command (or click a hint) and press Enter to send it over the
          virtual UART. The four AXI-GPIO board LEDs, the PS-MIO LED, and the
          AXI-GPIO RGB LED all react exactly as the firmware drives them.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* TERMINAL */}
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-emerald-200">
            <div className="h-56 overflow-y-auto pr-1">
              {state.log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              <div ref={logEndRef} />
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
              <span className="text-emerald-300">{">"}</span>
              <input
                ref={inputRef}
                value={buffer}
                onChange={(e) => setBuffer(e.target.value)}
                onKeyDown={handleKey}
                disabled={state.done}
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent text-emerald-100 outline-none placeholder:text-emerald-700"
                placeholder={state.done ? "(done)" : "type a command…"}
                aria-label="UART input"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMAND_HINTS.map((c) => (
              <button
                key={c.key}
                onClick={() => send(c.key)}
                disabled={state.done}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:opacity-40"
              >
                <span className="font-mono text-emerald-300">{c.key}</span>
                <span className="ml-2 text-white/50">{c.label}</span>
              </button>
            ))}
            <button
              onClick={reset}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              ↻ reset
            </button>
          </div>
        </div>

        {/* BOARD */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/40">
              ZYBO-Z7 board
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
              {state.done ? "halted" : "running"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-end gap-6">
              {state.boardLeds.map((on, i) => (
                <BoardLed key={i} on={on} label={`LD${i}`} />
              ))}
            </div>
            <div className="flex items-end gap-10">
              <PsLed on={state.psLed} />
              <RgbLed color={state.rgbColor} />
            </div>
          </div>
          <p className="mt-6 text-center text-[11px] text-white/40">
            LD0–LD3 driven via AXI-GPIO_0 · LD4 via PS-GPIO MIO bank · RGB via
            AXI-GPIO_1
          </p>
        </div>
      </div>
    </div>
  );
}
