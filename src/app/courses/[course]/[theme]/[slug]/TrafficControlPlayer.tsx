"use client";

import { useEffect, useState } from "react";
import {
  GATE_CLOSE_DEG,
  INITIAL,
  colorFor,
  gateAngleFor,
  step,
  type Snapshot,
} from "@/lib/projects/trafficControl/trafficControl";

const TICK_MS = 2200;

export function TrafficControlPlayer() {
  const [snap, setSnap] = useState<Snapshot>(INITIAL);
  const [autoTick, setAutoTick] = useState(true);

  useEffect(() => {
    if (!autoTick) return;
    const id = setInterval(() => {
      setSnap((s) => step(s, { type: "tick" }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [autoTick]);

  const c = colorFor(snap.state);
  const gate = gateAngleFor(snap.state);
  const gateClosed = gate === GATE_CLOSE_DEG;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">IoT level-crossing dashboard</h2>
        <p className="text-sm text-foreground/70">
          Capstone Lab. An Arduino with an Adafruit Airlift WiFi shield subscribes to
          two MQTT feeds (<span className="font-mono">maintenance</span> ON/OFF and a{" "}
          <span className="font-mono">train_sig</span> push button) and drives an RGB
          stoplight + an SG92R servo crossing gate. The FSM cycles RED →
          YELLOW → GREEN → YELLOW pre-empting on either signal, then
          returns to RED on clear.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-4 flex flex-col items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            stoplight (Airlift RGB)
          </div>
          <div
            className="h-24 w-24 rounded-full border-2 border-foreground/30 transition-colors"
            style={{
              backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})`,
              boxShadow: `0 0 24px rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`,
            }}
          />
          <div className="text-sm font-mono">{snap.state}</div>
          <div className="text-xs text-foreground/60">
            rgb({c.r}, {c.g}, {c.b})
          </div>
        </div>

        <div className="rounded-md border border-foreground/15 p-4 flex flex-col items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            crossing gate (servo)
          </div>
          <svg width={180} height={120} viewBox="0 0 180 120">
            <rect x={0} y={100} width={180} height={20} fill="#666" />
            <line x1={70} y1={20} x2={70} y2={100} stroke="#444" strokeWidth={4} />
            <g transform={`translate(70, 30) rotate(${gateClosed ? 0 : -75})`}>
              <rect x={0} y={-3} width={90} height={6} fill="#ef4444" stroke="#000" />
              <rect x={10} y={-3} width={10} height={6} fill="#fff" />
              <rect x={30} y={-3} width={10} height={6} fill="#fff" />
              <rect x={50} y={-3} width={10} height={6} fill="#fff" />
              <rect x={70} y={-3} width={10} height={6} fill="#fff" />
            </g>
          </svg>
          <div className="text-xs text-foreground/60">
            servo angle: <span className="font-mono">{gate}°</span> ·{" "}
            {gateClosed ? "CLOSED" : "OPEN"}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          MQTT controls
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSnap((s) => step(s, { type: "maintenance_on" }))}
            className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white"
          >
            maintenance/ON
          </button>
          <button
            onClick={() => setSnap((s) => step(s, { type: "maintenance_off" }))}
            className="rounded border border-blue-500 px-3 py-1 text-sm font-medium text-blue-700"
          >
            maintenance/OFF
          </button>
          <button
            onClick={() => setSnap((s) => step(s, { type: "train_press" }))}
            className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-white"
          >
            train_sig press {snap.trainArrived ? "(clear)" : "(arriving)"}
          </button>
          <button
            onClick={() => setAutoTick((a) => !a)}
            className="rounded border border-foreground/30 px-3 py-1 text-sm"
          >
            {autoTick ? "Pause cycle" : "Resume cycle"}
          </button>
          <button
            onClick={() => setSnap((s) => step(s, { type: "tick" }))}
            className="rounded border border-foreground/30 px-3 py-1 text-sm"
          >
            single tick
          </button>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          MQTT message log (latest first)
        </div>
        {snap.log.length === 0 ? (
          <div className="text-xs text-foreground/50">no events yet…</div>
        ) : (
          <ul className="space-y-0.5 font-mono text-xs">
            {snap.log.map((entry) => (
              <li key={entry.at} className="flex gap-2">
                <span className="text-foreground/40">[{entry.at}]</span>
                <span>{entry.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
