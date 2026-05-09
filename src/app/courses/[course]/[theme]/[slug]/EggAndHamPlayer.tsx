"use client";

export function EggAndHamPlayer() {
  return (
    <section className="space-y-4">
      <p className="text-sm text-foreground/70">
        A faithful SVG re-rendering of the original cs1lib drawing — same
        coordinates, same colours, on the same 400×400 canvas the original used.
      </p>

      <div className="rounded-lg border border-foreground/15 bg-foreground/5 p-2">
        <svg
          viewBox="0 0 400 400"
          width={400}
          height={400}
          style={{ maxWidth: "100%", height: "auto" }}
          className="block"
          role="img"
          aria-label="Green eggs and ham drawing on a red background, with a fork and the artist's signature"
        >
          <rect x={0} y={0} width={400} height={400} fill="rgba(255,0,0,0.8)" />

          <polygon
            points="300,30 60,200 340,320"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={2}
          />

          <ellipse cx={247} cy={125} rx={50} ry={35} fill="#00ff00" />
          <circle cx={247} cy={125} r={7} fill="#ffffff" />

          <ellipse
            cx={135}
            cy={195}
            rx={35}
            ry={20}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={2}
          />
          <ellipse
            cx={240}
            cy={245}
            rx={35}
            ry={20}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={2}
          />

          <circle cx={135} cy={195} r={10} fill="#00ff00" />
          <circle cx={240} cy={245} r={10} fill="#00ff00" />

          <g stroke="#0000ff" strokeWidth={2} fill="none">
            <line x1={218} y1={45} x2={218} y2={105} />
            <line x1={210} y1={105} x2={225} y2={105} />
            <line x1={210} y1={105} x2={210} y2={125} />
            <line x1={215} y1={105} x2={215} y2={125} />
            <line x1={220} y1={105} x2={220} y2={125} />
            <line x1={225} y1={105} x2={225} y2={125} />
          </g>

          <text x={10} y={380} fill="#000000" fontFamily="monospace" fontSize={14}>
            Akwasi Akosah
          </text>
        </svg>
      </div>

      <p className="text-xs text-foreground/60">
        Each shape, colour, and coordinate is taken straight from{" "}
        <code>egg_and_ham.py</code> — the SVG <code>polygon</code>, <code>ellipse</code>,{" "}
        <code>circle</code>, and <code>line</code> elements correspond one-to-one with
        the cs1lib <code>draw_triangle</code>, <code>draw_ellipse</code>,{" "}
        <code>draw_circle</code>, and <code>draw_line</code> calls in the original.
      </p>
    </section>
  );
}
