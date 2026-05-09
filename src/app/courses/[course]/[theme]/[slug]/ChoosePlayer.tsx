"use client";

import { useState } from "react";
import { choose } from "@/lib/projects/firstPrograms/firstPrograms";

export function ChoosePlayer() {
  const [n, setN] = useState(51);
  const [k, setK] = useState(5);

  const safe = n >= 0 && k >= 0 && k <= n && n <= 30;
  const value = safe ? choose(n, k) : null;

  return (
    <section className="space-y-4">
      <p className="text-sm text-foreground/70">
        Compute the binomial coefficient <code>C(n, k)</code> recursively, exactly the
        way the original <code>choose.py</code> does — base cases <code>k = 0</code> and{" "}
        <code>k = n</code> return 1, otherwise{" "}
        <code>choose(n, k) = choose(n−1, k) + choose(n−1, k−1)</code>.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">n: {n}</span>
          <input
            type="range"
            min={0}
            max={30}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (k > v) setK(v);
            }}
            className="w-full"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">k: {k}</span>
          <input
            type="range"
            min={0}
            max={n}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="rounded-md border border-foreground/15 bg-foreground/5 p-4 text-center font-mono">
        {value !== null ? (
          <>
            <div className="text-sm text-foreground/60">
              choose({n}, {k}) =
            </div>
            <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
          </>
        ) : (
          <div className="text-sm text-amber-600">Out of range — try smaller values.</div>
        )}
      </div>

      <p className="rounded-md bg-foreground/5 px-3 py-2 text-xs text-foreground/60">
        The original program prints <code>choose(51, 5) = 2,349,060</code>. Here that
        same call is capped to <code>n ≤ 30</code> because the unmemoised recursion
        used by both the original Python and this faithful port grows exponentially:
        <code>choose(51, 5)</code> spawns about 2.3 million function calls before
        returning.
      </p>
    </section>
  );
}
