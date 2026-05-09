"use client";

import { useState } from "react";
import {
  G_RAW,
  SEG,
  accelToDeciDeg,
  accelToTiltDeg,
  formatAngleSegments,
  isSegOn,
} from "@/lib/projects/tiltSevenSeg/tiltSevenSeg";

const DIG_W = 60;
const DIG_H = 100;
const STROKE = 12;
const SPACING = 14;

const RED_OFF = "#3f0a0a";
const RED_ON = "#ef4444";

interface SegPathProps {
  byte: number;
  name: keyof typeof SEG;
  d: string;
}

function Segment({ byte, name, d }: SegPathProps) {
  const on = isSegOn(byte, name);
  return (
    <path
      d={d}
      fill={on ? RED_ON : RED_OFF}
      stroke={on ? RED_ON : RED_OFF}
      strokeWidth={1}
      style={{
        filter: on ? "drop-shadow(0 0 4px #ef444466)" : "none",
        transition: "fill 80ms",
      }}
    />
  );
}

function SevenSegDigit({ byte }: { byte: number }) {
  const w = DIG_W;
  const h = DIG_H;
  const s = STROKE;
  const pad = 4;
  const top = pad;
  const mid = h / 2;
  const bot = h - pad;
  const left = pad;
  const right = w - pad;

  const a = `M${left + s},${top} H${right - s} L${right - s - s / 2},${top + s / 2} L${left + s + s / 2},${top + s / 2} Z`;
  const d = `M${left + s},${bot} H${right - s} L${right - s - s / 2},${bot - s / 2} L${left + s + s / 2},${bot - s / 2} Z`;
  const g = `M${left + s},${mid} H${right - s} L${right - s - s / 2},${mid + s / 2} L${left + s + s / 2},${mid + s / 2} L${right - s - s / 2},${mid - s / 2} Z`;

  const b = `M${right},${top + s} V${mid - s / 2} L${right - s / 2},${mid - s} L${right - s / 2},${top + s + s / 2} Z`;
  const c = `M${right},${mid + s} V${bot - s} L${right - s / 2},${bot - s - s / 2} L${right - s / 2},${mid + s + s / 2} Z`;
  const f = `M${left},${top + s} V${mid - s / 2} L${left + s / 2},${mid - s} L${left + s / 2},${top + s + s / 2} Z`;
  const e = `M${left},${mid + s} V${bot - s} L${left + s / 2},${bot - s - s / 2} L${left + s + s / 2 - s / 2},${mid + s + s / 2} Z`;

  return (
    <g>
      <Segment byte={byte} name="a" d={a} />
      <Segment byte={byte} name="g" d={g} />
      <Segment byte={byte} name="d" d={d} />
      <Segment byte={byte} name="b" d={b} />
      <Segment byte={byte} name="c" d={c} />
      <Segment byte={byte} name="e" d={e} />
      <Segment byte={byte} name="f" d={f} />
      {/* decimal point */}
      <circle
        cx={right + 6}
        cy={bot}
        r={4}
        fill={isSegOn(byte, "dp") ? RED_ON : RED_OFF}
      />
    </g>
  );
}

export function TiltSevenSegPlayer() {
  const [ax, setAx] = useState(0);
  const tilt = accelToTiltDeg(ax);
  const deci = accelToDeciDeg(ax);
  const display = formatAngleSegments(deci);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Tilt → 7-segment display</h2>
        <p className="text-sm text-foreground/70">
          Tilt the virtual phone left/right (or drag the slider). The simulator runs the
          exact same trig the firmware does — <code>tilt = asin(Ax / g)</code> — converts
          to deci-degrees, and packs the value into four 7-segment bytes via
          <code> SevenSeg_angle()</code>. The SVG below renders each segment from the byte
          values that would have been pushed to the HT16K33 over I2C.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <div
          className="mx-auto"
          style={{
            width: 200,
            height: 320,
            transform: `rotate(${-tilt}deg)`,
            transformOrigin: "center",
            transition: "transform 80ms",
          }}
        >
          <div className="flex h-full w-full flex-col items-stretch rounded-2xl border-4 border-foreground/30 bg-foreground/5 p-3">
            <div className="h-1 w-12 self-center rounded bg-foreground/40" />
            <div className="my-3 flex-1 rounded bg-black p-3 text-center font-mono text-xs text-green-400">
              tilt: {tilt.toFixed(1)}°
              <br />
              deci: {deci}
              <br />
              Ax: {ax}
            </div>
            <div className="h-2 w-2 self-center rounded-full bg-foreground/40" />
          </div>
        </div>

        <label className="block">
          <span className="text-sm">
            accelerometer X reading{" "}
            <span className="font-mono">{ax} sensor units (±{G_RAW} = ±1g)</span>
          </span>
          <input
            type="range"
            min={-1500}
            max={1500}
            step={10}
            value={ax}
            onChange={(e) => setAx(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-foreground/60">
            <span>−1.5g (over)</span>
            <span>level</span>
            <span>+1.5g (over)</span>
          </div>
        </label>
      </section>

      <section className="rounded-md border border-foreground/15 p-4">
        <div className="text-xs uppercase tracking-wide text-foreground/60 mb-2">
          HT16K33 display
        </div>
        <div className="flex justify-center bg-black p-4 rounded">
          <svg
            width={4 * (DIG_W + SPACING)}
            height={DIG_H}
            viewBox={`0 0 ${4 * (DIG_W + SPACING)} ${DIG_H}`}
          >
            {display.digits.map((b, i) => (
              <g key={i} transform={`translate(${i * (DIG_W + SPACING)}, 0)`}>
                <SevenSegDigit byte={b} />
              </g>
            ))}
          </svg>
        </div>
        <div className="mt-2 text-center text-xs font-mono text-foreground/70">
          {display.inRange
            ? `${(deci / 10).toFixed(1)}°`
            : "EEEE — out of range (|tilt| > 99.9°)"}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          {display.digits.map((b, i) => (
            <div key={i} className="rounded border border-foreground/15 p-1">
              <div className="text-foreground/50">d{i}</div>
              <div>0x{b.toString(16).padStart(2, "0").toUpperCase()}</div>
              <div>0b{b.toString(2).padStart(8, "0")}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
