"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { lonLatToXY } from "@/lib/projects/cities/cityProjection";
import type { City } from "@/lib/projects/cities/compareCities";
import { comparePopulation } from "@/lib/projects/cities/compareCities";
import { publicPath } from "@/lib/site/publicPath";

const MAP_WIDTH = 720;
const MAP_HEIGHT = 360;
const TOTAL_TO_PLOT = 200;
const REVEAL_INTERVAL_MS = 80;

function applyComparator(cities: City[]): City[] {
  return [...cities].sort((a, b) => {
    if (comparePopulation(a, b)) return -1;
    if (comparePopulation(b, a)) return 1;
    return 0;
  });
}

function colorForPopulation(p: number): string {
  if (p >= 10_000_000) return "#ef4444";
  if (p >= 5_000_000) return "#f59e0b";
  if (p >= 2_000_000) return "#eab308";
  if (p >= 1_000_000) return "#84cc16";
  return "#38bdf8";
}

export function VisualizeCitiesPlayer() {
  const [cities, setCities] = useState<City[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(publicPath("/data/intro-to-programming/cities/top-cities.json"))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: City[]) => {
        if (!cancelled) setCities(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    if (!cities) return [];
    return applyComparator(cities).slice(0, TOTAL_TO_PLOT);
  }, [cities]);

  useEffect(() => {
    if (!isPlaying || sorted.length === 0 || revealed >= sorted.length) return;
    intervalRef.current = window.setInterval(() => {
      setRevealed((r) => Math.min(r + 1, sorted.length));
    }, REVEAL_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, sorted.length, revealed]);

  const dots = sorted.slice(0, revealed);

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">World map</h2>
        <span className="text-sm tabular-nums text-foreground/60">
          {revealed} / {sorted.length || TOTAL_TO_PLOT} cities
        </span>
      </div>

      {loadError && (
        <p className="text-sm text-red-500">
          Could not load city data: {loadError}
        </p>
      )}

      <div className="relative w-full overflow-hidden rounded-xl border border-foreground/10 bg-background">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label={`World map with ${revealed} of ${sorted.length} most populous cities plotted`}
          className="block w-full"
        >
          <image
            href={publicPath("/images/intro-to-programming/cities/earthicefree.jpg")}
            x={0}
            y={0}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            preserveAspectRatio="none"
          />
          {dots.map((c) => {
            const { x, y } = lonLatToXY({
              lon: c.longitude,
              lat: c.latitude,
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
            });
            return (
              <circle
                key={`${c.name}-${c.latitude}-${c.longitude}`}
                cx={x}
                cy={y}
                r={Math.max(2, Math.log10(Math.max(c.population, 10)) - 3)}
                fill={colorForPopulation(c.population)}
                fillOpacity="0.85"
                stroke="white"
                strokeOpacity="0.6"
                strokeWidth="0.5"
              >
                <title>
                  {c.name} — {c.population.toLocaleString()} (
                  {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°)
                </title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRevealed(0);
            setIsPlaying(true);
          }}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Restart
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          disabled={revealed >= sorted.length}
          className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRevealed(sorted.length);
            setIsPlaying(false);
          }}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Show all
        </button>
        <span className="ml-auto text-xs text-foreground/60">
          Cities revealed in descending order of population.
        </span>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        <li><span className="inline-block size-3 rounded-full bg-[#ef4444] align-middle" /> 10M+</li>
        <li><span className="inline-block size-3 rounded-full bg-[#f59e0b] align-middle" /> 5M+</li>
        <li><span className="inline-block size-3 rounded-full bg-[#eab308] align-middle" /> 2M+</li>
        <li><span className="inline-block size-3 rounded-full bg-[#84cc16] align-middle" /> 1M+</li>
        <li><span className="inline-block size-3 rounded-full bg-[#38bdf8] align-middle" /> &lt; 1M</li>
      </ul>
    </section>
  );
}
