"use client";

import { useEffect, useRef, useState } from "react";

import {
  initialWifiState,
  pressButton,
  receivePingResponse,
  receiveUpdateResponse,
  potToPercent,
  percentToDuty,
  POT_MAX,
  ID,
  type WifiState,
} from "@/lib/projects/wifiStation/wifiStation";

const BUTTONS = [
  { idx: 0, label: "BTN0 — CONFIGURE", color: "bg-amber-500/30" },
  { idx: 1, label: "BTN1 — PING", color: "bg-cyan-500/30" },
  { idx: 2, label: "BTN2 — UPDATE", color: "bg-emerald-500/30" },
  { idx: 3, label: "BTN3 — quit", color: "bg-rose-500/30" },
];

interface RemoteState {
  pot: number;
  history: number[];
}

const initialRemote: RemoteState = {
  pot: 1.44,
  history: [],
};

export function WifiStationPlayer() {
  const [state, setState] = useState<WifiState>(initialWifiState);
  const [pot, setPot] = useState(1.44);
  const [remote, setRemote] = useState<RemoteState>(initialRemote);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  useEffect(() => {
    if (state.outbox.length === 0) return;
    const msg = state.outbox[state.outbox.length - 1];
    const id = window.setTimeout(() => {
      if (msg.type === "PING") {
        setState((s) => receivePingResponse(s, msg.id));
      } else if (msg.type === "UPDATE") {
        const newHistory = [msg.value, ...remote.history].slice(0, 30);
        setRemote({ ...remote, history: newHistory });
        const values = Array(30).fill(0);
        for (let i = 0; i < newHistory.length; i++) values[i] = newHistory[i];
        const sum = newHistory.reduce((a, b) => a + b, 0);
        const average = newHistory.length ? Math.trunc(sum / newHistory.length) : 0;
        values[ID] = average;
        setState((s) =>
          receiveUpdateResponse(s, {
            type: "UPDATE_RESPONSE",
            id: ID,
            average,
            values,
          }),
        );
      }
    }, 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.outbox.length]);

  const angle = ((state.duty - 5.25) / (10.25 - 5.25)) * 180;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">ESP8266 wireless link</h2>
        <p className="text-sm text-white/60">
          PS-UART0 talks to a remote ESP8266 substation; PS-UART1 is the local console. Each button
          fires a different message: PING checks the link, UPDATE samples the local pot and sends a
          percent value, and the remote replies with an aggregate that drives the local servo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-black/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/60">
              <span>local pot voltage</span>
              <span className="text-white">
                {pot.toFixed(2)} V · {potToPercent(pot)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={POT_MAX}
              step="0.01"
              value={pot}
              onChange={(e) => setPot(parseFloat(e.target.value))}
              className="w-full accent-pink-400"
            />
            <div className="text-[10px] font-mono text-white/40">
              mode = <span className="text-pink-300">{state.mode}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BUTTONS.map((b) => (
              <button
                key={b.idx}
                type="button"
                disabled={state.done}
                onClick={() => setState((s) => pressButton(s, b.idx, pot))}
                className={`rounded-md border border-white/15 ${b.color} px-3 py-3 text-xs font-mono text-white/90 hover:brightness-125 disabled:opacity-40`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setState(initialWifiState);
              setRemote(initialRemote);
              setPot(1.44);
            }}
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

          <div className="rounded-md border border-white/10 bg-black/60 p-3 space-y-2">
            <div className="text-xs font-mono text-white/60">
              remote substation history (last 30)
            </div>
            <div className="flex gap-1 h-12 items-end">
              {Array.from({ length: 30 }, (_, i) => remote.history[i] ?? 0).map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-cyan-400/60 rounded-t"
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>local servo (driven by remote average)</span>
              <span className="text-white">
                {state.duty.toFixed(2)}% · {angle.toFixed(0)}°
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-fuchsia-400 transition-all"
                style={{ width: `${(percentToDuty(0) === state.duty ? 0 : ((state.duty - 5.25) / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
