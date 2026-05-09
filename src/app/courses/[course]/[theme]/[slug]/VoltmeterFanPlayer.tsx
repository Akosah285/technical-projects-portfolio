"use client";

import { useEffect, useRef, useState } from "react";
import {
  HIGH_C,
  INITIAL_CONTROLLER,
  LOW_C,
  measureAndControl,
  type ControllerState,
} from "@/lib/projects/voltmeterFan/voltmeterFan";

const TICK_MS = 1000; // matches the original 1 Hz TIMER1 interrupt
const TRACE_LEN = 60;

interface Sample {
  t: number;
  c: number;
  fanOn: boolean;
}

export function VoltmeterFanPlayer() {
  const [ambient, setAmbient] = useState(22);
  const [outputs, setOutputs] = useState<ControllerState>(INITIAL_CONTROLLER);
  const [trace, setTrace] = useState<Sample[]>([]);
  const [running, setRunning] = useState(true);
  const tRef = useRef(0);

  const reading = measureAndControl(ambient, outputs);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      setOutputs((prev) => {
        const r = measureAndControl(ambient, prev);
        // Defer the trace update to avoid nested setState during a state-updater callback.
        setTimeout(() => {
          setTrace((tr) =>
            [...tr, { t, c: r.recoveredCelsius, fanOn: r.outputs.fanOn }].slice(-TRACE_LEN),
          );
        }, 0);
        return r.outputs;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, ambient]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Voltmeter + temperature → fan controller</h2>
        <p className="text-sm text-foreground/70">
          A TMP36 sensor (V = 10·°C + 500 mV) feeds the AVR&apos;s 10-bit ADC, sampled at
          1 Hz by a TIMER1 interrupt. Below {LOW_C}°C the green LED comes on; at or above
          {" "}{HIGH_C}°C the red LED turns on AND a fan runs to cool things down. Between
          the two thresholds the controller holds its previous decision — the classic
          hysteresis deadband — so the fan doesn&apos;t chatter on and off near the
          setpoint.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <label className="block space-y-1">
          <span className="text-sm">
            ambient temperature{" "}
            <span className="font-mono">{ambient.toFixed(1)} °C</span>
          </span>
          <input
            type="range"
            min={-10}
            max={50}
            step={0.1}
            value={ambient}
            onChange={(e) => setAmbient(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-foreground/60">
            <span>−10°C</span>
            <span>cool / {LOW_C}°C</span>
            <span>hot / {HIGH_C}°C</span>
            <span>50°C</span>
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="rounded bg-foreground px-3 py-1 text-sm text-background"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => {
              setOutputs(INITIAL_CONTROLLER);
              setTrace([]);
              tRef.current = 0;
            }}
            className="rounded border border-foreground/20 px-3 py-1 text-sm"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            measured
          </div>
          <ul className="mt-1 space-y-0.5 font-mono text-xs">
            <li>TMP36 voltage: {reading.voltageMv.toFixed(0)} mV</li>
            <li>ADC code: {reading.adc} / 1023</li>
            <li>recovered T: {reading.recoveredCelsius.toFixed(2)} °C</li>
            <li>fahrenheit: {reading.fahrenheit.toFixed(2)} °F</li>
          </ul>
        </div>
        <div className="rounded-md border border-foreground/15 p-3 flex items-center justify-around">
          {/* Red LED */}
          <div className="flex flex-col items-center">
            <div
              className="h-12 w-12 rounded-full border-4"
              style={{
                background: outputs.redOn ? "#ef4444" : "#1f1f1f",
                borderColor: outputs.redOn ? "#dc2626" : "#3f3f3f",
                boxShadow: outputs.redOn ? "0 0 24px 4px #ef444466" : "none",
              }}
            />
            <span className="mt-1 text-xs font-mono">RED (B0)</span>
          </div>
          {/* Green LED */}
          <div className="flex flex-col items-center">
            <div
              className="h-12 w-12 rounded-full border-4"
              style={{
                background: outputs.greenOn ? "#10b981" : "#1f1f1f",
                borderColor: outputs.greenOn ? "#059669" : "#3f3f3f",
                boxShadow: outputs.greenOn ? "0 0 24px 4px #10b98166" : "none",
              }}
            />
            <span className="mt-1 text-xs font-mono">GREEN (B1)</span>
          </div>
          {/* Fan */}
          <div className="flex flex-col items-center">
            <svg
              width={64}
              height={64}
              viewBox="0 0 64 64"
              style={{
                animation: outputs.fanOn ? "spin 0.5s linear infinite" : "none",
              }}
            >
              <circle cx="32" cy="32" r="6" fill="#666" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <ellipse
                  key={deg}
                  cx="32"
                  cy="14"
                  rx="6"
                  ry="14"
                  fill={outputs.fanOn ? "#3b82f6" : "#6b7280"}
                  transform={`rotate(${deg} 32 32)`}
                />
              ))}
            </svg>
            <span className="mt-1 text-xs font-mono">FAN (B2)</span>
            <style>{`@keyframes spin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-3">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          temperature trace (last {TRACE_LEN}s, fan = blue band)
        </div>
        <svg width="100%" viewBox="0 0 600 160" className="mt-2">
          {/* deadband */}
          <rect
            x={0}
            y={(160 * (50 - HIGH_C)) / 60}
            width={600}
            height={(160 * (HIGH_C - LOW_C)) / 60}
            fill="rgba(251, 191, 36, 0.10)"
          />
          {/* threshold lines */}
          <line
            x1={0}
            x2={600}
            y1={(160 * (50 - HIGH_C)) / 60}
            y2={(160 * (50 - HIGH_C)) / 60}
            stroke="#ef4444"
            strokeDasharray="4 4"
          />
          <line
            x1={0}
            x2={600}
            y1={(160 * (50 - LOW_C)) / 60}
            y2={(160 * (50 - LOW_C)) / 60}
            stroke="#10b981"
            strokeDasharray="4 4"
          />
          {/* fan-on bands */}
          {trace.map(
            (s, i) =>
              s.fanOn && (
                <rect
                  key={`fan-${i}`}
                  x={(i / TRACE_LEN) * 600}
                  width={600 / TRACE_LEN + 1}
                  y={150}
                  height={6}
                  fill="#3b82f6"
                  opacity={0.7}
                />
              ),
          )}
          {/* temperature line */}
          {trace.length > 1 && (
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              points={trace
                .map((s, i) => {
                  const x = (i / TRACE_LEN) * 600;
                  const y = (160 * (50 - s.c)) / 60;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          )}
        </svg>
      </section>
    </div>
  );
}
