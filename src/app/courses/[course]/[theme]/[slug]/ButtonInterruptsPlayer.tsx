"use client";

import { useState } from "react";
import {
  flipSwitch,
  initialIsrState,
  pressButton,
  type IsrState,
} from "@/lib/projects/buttonInterrupts/buttonInterrupts";

const BTN_LABELS = ["BTN0", "BTN1", "BTN2", "BTN3"] as const;
const SW_LABELS = ["SW0", "SW1", "SW2", "SW3"] as const;

function Led({ on, label }: { on: boolean; label: string }) {
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

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition hover:opacity-90"
    >
      <div
        className={`relative h-9 w-5 rounded-full border border-white/20 transition ${
          on ? "bg-emerald-500/30" : "bg-slate-800"
        }`}
      >
        <div
          className={`absolute left-0.5 right-0.5 h-4 rounded-full bg-white/80 transition-all ${
            on ? "top-0.5" : "bottom-0.5"
          }`}
        />
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
        {label}
      </span>
    </button>
  );
}

export function ButtonInterruptsPlayer() {
  const [state, setState] = useState<IsrState>(() => initialIsrState());

  function press(idx: number) {
    setState((s) => pressButton(s, 1 << idx));
  }
  function toggleSwitch(idx: number) {
    setState((s) => flipSwitch(s, s.prevSwitches ^ (1 << idx)));
  }
  function reset() {
    setState(initialIsrState());
  }

  const switchOn = (i: number) => Boolean(state.prevSwitches & (1 << i));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">
          GIC: button & switch interrupts
        </h2>
        <p className="text-sm text-white/60">
          The same dispatcher pattern from <code>io.c</code>. Each push-button
          fires an interrupt that resolves to a single index by matching the
          one-hot bitmask. Each switch flip is decoded by XOR-ing the new
          reading against the previous one to find the changed bit. Both
          handlers toggle the matching board LED.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* CONTROL PANEL */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-white/40">
              ZYBO-Z7 buttons & switches
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
              ISRs: {state.isrCount}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-wider text-white/40">
                LED bank (LD0–LD3)
              </p>
              <div className="flex justify-around">
                {state.ledBank.map((on, i) => (
                  <Led key={i} on={on} label={`LD${i}`} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] uppercase tracking-wider text-white/40">
                Push-buttons (one-hot raw bits)
              </p>
              <div className="flex justify-around">
                {BTN_LABELS.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => press(i)}
                    className="flex flex-col items-center gap-2 transition hover:opacity-80"
                  >
                    <div className="h-10 w-10 rounded-full border border-white/30 bg-gradient-to-b from-slate-700 to-slate-900 shadow-inner active:from-slate-900 active:to-slate-700" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[11px] uppercase tracking-wider text-white/40">
                DIP switches (XOR edge detect)
              </p>
              <div className="flex justify-around">
                {SW_LABELS.map((label, i) => (
                  <Switch key={label} on={switchOn(i)} label={label} onClick={() => toggleSwitch(i)} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={reset}
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              ↻ reset
            </button>
          </div>
        </div>

        {/* ISR LOG */}
        <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-emerald-200">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-xs uppercase tracking-wider text-white/40">
            <span>ISR log</span>
            <span>prev_switches = 0x{state.prevSwitches.toString(16)}</span>
          </div>
          <div className="h-72 overflow-y-auto pr-1">
            {state.log.length === 0 ? (
              <div className="text-white/30">{"// no interrupts yet — click a button or switch."}</div>
            ) : (
              state.log.map((entry, i) => (
                <div key={i}>
                  <span className="text-white/40">[{entry.count.toString().padStart(3, " ")}]</span>{" "}
                  <span className="text-blue-300">{entry.source.padEnd(7, " ")}</span>{" "}
                  <span className="text-emerald-300">→ idx={entry.index}</span>{" "}
                  <span className="text-white/40">{`// led_toggle(${entry.index})`}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
