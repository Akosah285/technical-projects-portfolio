"use client";

import { useEffect, useMemo, useState } from "react";
import {
  compareLatitude,
  compareLexically,
  comparePopulation,
  type City,
} from "@/lib/projects/cities/compareCities";
import { publicPath } from "@/lib/site/publicPath";

type SortAxis = "alphabetical" | "population" | "latitude";

const VISIBLE_COUNT = 30;
const ROW_HEIGHT = 32;

const COMPARATORS: Record<SortAxis, (a: City, b: City) => boolean> = {
  alphabetical: compareLexically,
  population: comparePopulation,
  latitude: compareLatitude,
};

function applyComparator(
  cities: City[],
  comparator: (a: City, b: City) => boolean,
): City[] {
  // The FA18 comparator returns true when `a` should come before `b`.
  // Translate that into the (-1, 0, 1) shape Array.prototype.sort expects.
  return [...cities].sort((a, b) => {
    if (comparator(a, b)) return -1;
    if (comparator(b, a)) return 1;
    return 0;
  });
}

export function SortCitiesPlayer() {
  const [axis, setAxis] = useState<SortAxis>("alphabetical");
  const [cities, setCities] = useState<City[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    return applyComparator(cities, COMPARATORS[axis]);
  }, [cities, axis]);

  const visible = sorted.slice(0, VISIBLE_COUNT);
  const positions = new Map<string, number>();
  visible.forEach((c, i) => positions.set(`${c.name}-${c.latitude}-${c.longitude}`, i));

  return (
    <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Sort visualization</h2>
        <span className="text-sm text-foreground/60">
          {cities ? `${cities.length} cities loaded` : loadError ? "load failed" : "loading…"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          Sort by
          <select
            value={axis}
            onChange={(e) => setAxis(e.target.value as SortAxis)}
            className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm"
          >
            <option value="alphabetical">name (A→Z)</option>
            <option value="population">population (largest first)</option>
            <option value="latitude">latitude (south→north)</option>
          </select>
        </label>
        <span className="text-xs text-foreground/60">
          Showing the top {VISIBLE_COUNT} after sorting on the chosen axis.
        </span>
      </div>

      {loadError && (
        <p className="text-sm text-red-500">
          Could not load city data: {loadError}
        </p>
      )}

      <div
        className="relative overflow-hidden rounded-xl border border-foreground/10 bg-background"
        style={{ height: VISIBLE_COUNT * ROW_HEIGHT }}
      >
        {sorted.map((city) => {
          const key = `${city.name}-${city.latitude}-${city.longitude}`;
          const idx = positions.get(key);
          if (idx === undefined) return null;
          return (
            <div
              key={key}
              className="absolute left-0 right-0 grid grid-cols-[2.5rem_1fr_7rem_5rem] items-center gap-2 px-3 text-sm tabular-nums"
              style={{
                top: 0,
                height: ROW_HEIGHT,
                transform: `translateY(${idx * ROW_HEIGHT}px)`,
                transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <span className="text-xs text-foreground/50">#{idx + 1}</span>
              <span className="truncate font-medium">{city.name}</span>
              <span className="text-right text-foreground/70">
                {city.population.toLocaleString()}
              </span>
              <span className="text-right text-foreground/60">
                {city.latitude.toFixed(2)}°
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
