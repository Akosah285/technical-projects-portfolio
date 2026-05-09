"use client";

import { useMemo, useState } from "react";
import { stringArtLines } from "@/lib/projects/drawings/stringArt";

export function StringArtPlayer() {
  const [n, setN] = useState(30);
  const [stickAx2, setStickAx2] = useState(60);
  const [stickAy2, setStickAy2] = useState(220);
  const [stickBx1, setStickBx1] = useState(300);
  const [stickBy1, setStickBy1] = useState(195);

  const result = useMemo(
    () =>
      stringArtLines({
        stickA: { x1: 30, y1: 40, x2: stickAx2, y2: stickAy2 },
        stickB: { x1: stickBx1, y1: stickBy1, x2: 200, y2: 350 },
        n,
      }),
    [n, stickAx2, stickAy2, stickBx1, stickBy1],
  );

  function reset() {
    setN(30);
    setStickAx2(60);
    setStickAy2(220);
    setStickBx1(300);
    setStickBy1(195);
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-foreground/70">
        Faithful re-rendering of the original cs1lib drawing — two red sticks plus{" "}
        <code>n + 1</code> coloured strings interpolated between them. Adjust the stick
        endpoints and the string count to vary the curve.
      </p>

      <div className="rounded-lg border border-foreground/15 bg-black p-2">
        <svg
          viewBox="0 0 400 400"
          width={400}
          height={400}
          style={{ maxWidth: "100%", height: "auto" }}
          className="block"
          role="img"
          aria-label={`String art: two sticks with ${n + 1} interpolated strings`}
        >
          {result.strings.map((s, i) => (
            <line
              key={`s-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeWidth={1}
            />
          ))}
          {result.sticks.map((s, i) => (
            <line
              key={`st-${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Knob label="Strings (n)" value={n} min={1} max={100} onChange={setN} />
        <Knob label="Stick A end x" value={stickAx2} min={0} max={400} onChange={setStickAx2} />
        <Knob label="Stick A end y" value={stickAy2} min={0} max={400} onChange={setStickAy2} />
        <Knob label="Stick B start x" value={stickBx1} min={0} max={400} onChange={setStickBx1} />
        <Knob label="Stick B start y" value={stickBy1} min={0} max={400} onChange={setStickBy1} />
      </div>

      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5"
      >
        Reset to original
      </button>
    </section>
  );
}

function Knob({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="font-medium">
        {label}: {value}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
