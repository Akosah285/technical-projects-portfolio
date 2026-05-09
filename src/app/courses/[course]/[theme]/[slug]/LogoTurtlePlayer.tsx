"use client";

import { useMemo, useState } from "react";
import { runLogoProgram } from "@/lib/projects/drawings/logoInterpreter";

const PRESETS: Record<string, string> = {
  Square: "REPEAT 4 [ FORWARD 80 RIGHT 90 ]",
  Triangle: "REPEAT 3 [ FORWARD 100 RIGHT 120 ]",
  Pentagon: "REPEAT 5 [ FORWARD 70 RIGHT 72 ]",
  Star: "REPEAT 5 [ FORWARD 100 RIGHT 144 ]",
  Spiral:
    "REPEAT 36 [ FORWARD 5 RIGHT 10 FORWARD 10 RIGHT 10 FORWARD 15 RIGHT 10 ]",
  Polygon: "REPEAT 12 [ FORWARD 40 RIGHT 30 ]",
};

const VIEW = 400;
const CENTER = VIEW / 2;

export function LogoTurtlePlayer() {
  const [program, setProgram] = useState(PRESETS.Square);

  const result = useMemo(() => runLogoProgram(program), [program]);

  const turtleAngle = result.finalState.heading;

  return (
    <section className="space-y-4">
      <p className="text-sm text-foreground/70">
        A small in-browser Logo turtle. Type commands and the turtle draws live —
        same spirit as the FA18 submission, but with an interactive canvas. Supports{" "}
        <code>FORWARD</code>/<code>FD</code>, <code>BACK</code>/<code>BK</code>,{" "}
        <code>RIGHT</code>/<code>RT</code>, <code>LEFT</code>/<code>LT</code>,{" "}
        <code>PENUP</code>/<code>PU</code>, <code>PENDOWN</code>/<code>PD</code>,{" "}
        <code>HOME</code>, and <code>REPEAT n [ ... ]</code> (which can nest).
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-foreground/15 bg-zinc-50 p-2">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            width={VIEW}
            height={VIEW}
            style={{ maxWidth: "100%", height: "auto" }}
            className="block"
            role="img"
            aria-label="Logo turtle drawing canvas"
          >
            <line x1={CENTER} y1={0} x2={CENTER} y2={VIEW} stroke="#e5e5e5" strokeWidth={1} />
            <line x1={0} y1={CENTER} x2={VIEW} y2={CENTER} stroke="#e5e5e5" strokeWidth={1} />
            <g transform={`translate(${CENTER}, ${CENTER})`}>
              {result.segments.map((s, i) => (
                <line
                  key={i}
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke="#1f2937"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              ))}
              <g transform={`translate(${result.finalState.x}, ${result.finalState.y}) rotate(${turtleAngle})`}>
                <polygon
                  points="0,-10 7,8 -7,8"
                  fill="#10b981"
                  stroke="#065f46"
                  strokeWidth={1.5}
                />
              </g>
            </g>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setProgram(PRESETS[name])}
                className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5"
              >
                {name}
              </button>
            ))}
          </div>

          <textarea
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="h-48 w-full rounded-md border border-foreground/20 bg-zinc-950 p-3 font-mono text-xs text-emerald-300"
            spellCheck={false}
          />

          {result.errors.length > 0 ? (
            <ul className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
              {result.errors.map((err, i) => (
                <li key={i}>⚠ {err}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-foreground/60">
              {result.segments.length} segment{result.segments.length === 1 ? "" : "s"} drawn ·
              turtle at ({result.finalState.x.toFixed(1)}, {result.finalState.y.toFixed(1)}),
              heading {result.finalState.heading.toFixed(0)}°
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
