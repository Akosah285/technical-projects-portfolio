"use client";

import { useMemo, useState } from "react";
import {
  findRegions,
  largestRegion,
  recolorImage,
  type Color,
  type Image,
} from "@/lib/projects/regionFinder/regionFinder";

const PIXEL = 14;

const PALETTE = {
  WHITE: { r: 245, g: 245, b: 245 },
  BLACK: { r: 25, g: 25, b: 25 },
  RED: { r: 220, g: 50, b: 50 },
  GREEN: { r: 50, g: 180, b: 80 },
  BLUE: { r: 60, g: 110, b: 220 },
  YELLOW: { r: 245, g: 210, b: 70 },
  PURPLE: { r: 160, g: 90, b: 200 },
  ORANGE: { r: 230, g: 140, b: 60 },
} as const;

interface Scene {
  slug: string;
  name: string;
  description: string;
  image: Image;
  defaultTargetSlug: string;
}

function fill(width: number, height: number, c: Color): Image {
  const pixels: Color[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Color[] = [];
    for (let x = 0; x < width; x++) row.push({ ...c });
    pixels.push(row);
  }
  return { width, height, pixels };
}

function paintRect(img: Image, x: number, y: number, w: number, h: number, c: Color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      if (py >= 0 && py < img.height && px >= 0 && px < img.width) {
        img.pixels[py][px] = { ...c };
      }
    }
  }
}

function paintCircle(img: Image, cx: number, cy: number, r: number, c: Color) {
  for (let py = 0; py < img.height; py++) {
    for (let px = 0; px < img.width; px++) {
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= r * r) img.pixels[py][px] = { ...c };
    }
  }
}

function makeShapesScene(): Image {
  const img = fill(24, 18, PALETTE.WHITE);
  paintCircle(img, 5, 6, 3, PALETTE.RED);
  paintRect(img, 11, 3, 6, 5, PALETTE.GREEN);
  paintCircle(img, 19, 12, 3, PALETTE.BLUE);
  paintRect(img, 3, 13, 4, 3, PALETTE.YELLOW);
  return img;
}

function makeShirtScene(): Image {
  const img = fill(20, 20, PALETTE.WHITE);
  paintRect(img, 2, 3, 16, 12, PALETTE.RED);
  paintRect(img, 0, 5, 4, 6, PALETTE.RED);
  paintRect(img, 16, 5, 4, 6, PALETTE.RED);
  paintCircle(img, 10, 2, 3, PALETTE.BLUE);
  paintRect(img, 4, 15, 12, 4, PALETTE.PURPLE);
  return img;
}

function makeSpotsScene(): Image {
  const img = fill(24, 16, PALETTE.BLACK);
  const spots: Array<[number, number, number, Color]> = [
    [3, 3, 2, PALETTE.RED],
    [9, 4, 2, PALETTE.RED],
    [15, 3, 2, PALETTE.RED],
    [20, 5, 2, PALETTE.RED],
    [5, 11, 2, PALETTE.GREEN],
    [12, 12, 2, PALETTE.GREEN],
    [18, 11, 2, PALETTE.GREEN],
    [8, 8, 1, PALETTE.YELLOW],
    [14, 9, 1, PALETTE.ORANGE],
  ];
  for (const [x, y, r, c] of spots) paintCircle(img, x, y, r, c);
  return img;
}

const SCENES: Scene[] = [
  {
    slug: "shapes",
    name: "Color shapes",
    description: "Four distinct shapes on a white background — a quick sanity-check for the flood-fill.",
    image: makeShapesScene(),
    defaultTargetSlug: "RED",
  },
  {
    slug: "shirt",
    name: "Dartmouth shirt",
    description: "A red shirt with a blue cap and purple trim — modeled on the original Java RecoloredDartmouthShirt test image.",
    image: makeShirtScene(),
    defaultTargetSlug: "RED",
  },
  {
    slug: "spots",
    name: "Color spots",
    description: "Many small spots across two color families — exercises the minRegion threshold.",
    image: makeSpotsScene(),
    defaultTargetSlug: "RED",
  },
];

const REGION_COLORS: Color[] = [
  { r: 250, g: 80, b: 100 },
  { r: 80, g: 200, b: 120 },
  { r: 80, g: 130, b: 240 },
  { r: 250, g: 200, b: 60 },
  { r: 200, g: 90, b: 220 },
  { r: 60, g: 200, b: 220 },
  { r: 240, g: 130, b: 60 },
  { r: 130, g: 80, b: 200 },
];

function colorToCSS(c: Color): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

interface ImageGridProps {
  image: Image;
  highlight?: Set<string> | null;
  onPick?: (x: number, y: number, color: Color) => void;
}

function ImageGrid({ image, highlight, onPick }: ImageGridProps) {
  return (
    <div
      className="inline-block border border-zinc-300 dark:border-zinc-700"
      style={{ lineHeight: 0 }}
    >
      {image.pixels.map((row, y) => (
        <div key={y} style={{ display: "flex" }}>
          {row.map((c, x) => {
            const isHighlighted = highlight?.has(`${x},${y}`);
            return (
              <button
                key={x}
                type="button"
                aria-label={`pixel (${x}, ${y})`}
                disabled={!onPick}
                onClick={() => onPick?.(x, y, c)}
                className={onPick ? "cursor-crosshair" : "cursor-default"}
                style={{
                  width: PIXEL,
                  height: PIXEL,
                  background: colorToCSS(c),
                  border: "none",
                  padding: 0,
                  outline: isHighlighted ? "2px solid #facc15" : "none",
                  outlineOffset: -2,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function RegionFinderPlayer() {
  const [sceneSlug, setSceneSlug] = useState(SCENES[0].slug);
  const [target, setTarget] = useState<Color>(PALETTE.RED);
  const [maxColorDiff, setMaxColorDiff] = useState(20);
  const [minRegion, setMinRegion] = useState(5);

  const scene = SCENES.find((s) => s.slug === sceneSlug) ?? SCENES[0];

  const regions = useMemo(
    () => findRegions(scene.image, target, { maxColorDiff, minRegion }),
    [scene, target, maxColorDiff, minRegion],
  );

  const recolored = useMemo(
    () => recolorImage(scene.image, regions, (i) => REGION_COLORS[i % REGION_COLORS.length]),
    [scene, regions],
  );

  const biggest = useMemo(() => largestRegion(regions), [regions]);

  const biggestPoints: Set<string> | null = useMemo(() => {
    if (!biggest) return null;
    return new Set(biggest.map((p) => `${p.x},${p.y}`));
  }, [biggest]);

  function handlePickFromSource(_x: number, _y: number, color: Color) {
    setTarget(color);
  }

  function handleSceneChange(slug: string) {
    const next = SCENES.find((s) => s.slug === slug);
    if (!next) return;
    setSceneSlug(slug);
    const defaultColor = (PALETTE as Record<string, Color>)[next.defaultTargetSlug] ?? PALETTE.RED;
    setTarget(defaultColor);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Scene</span>
          <select
            value={sceneSlug}
            onChange={(e) => handleSceneChange(e.target.value)}
            className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
          >
            {SCENES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Color tolerance: {maxColorDiff}</span>
          <input
            type="range"
            min={5}
            max={120}
            step={1}
            value={maxColorDiff}
            onChange={(e) => setMaxColorDiff(Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Min region: {minRegion}</span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={minRegion}
            onChange={(e) => setMinRegion(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="text-sm text-foreground/70">{scene.description}</p>

      <div className="flex flex-wrap gap-8">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Source — click a pixel to set target color</div>
          <ImageGrid image={scene.image} onPick={handlePickFromSource} />
          <div className="flex items-center gap-2 text-xs text-foreground/70">
            <span>target color</span>
            <span
              className="inline-block h-4 w-4 border border-zinc-400"
              style={{ background: colorToCSS(target) }}
            />
            <span className="font-mono">
              ({target.r}, {target.g}, {target.b})
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Regions — each painted a unique color</div>
          <ImageGrid image={recolored} highlight={biggestPoints} />
          <div className="text-xs text-foreground/70">
            <strong>{regions.length}</strong> region{regions.length === 1 ? "" : "s"} found
            {biggest && (
              <>
                ; largest is <strong>{biggest.length}</strong> pixel
                {biggest.length === 1 ? "" : "s"} (highlighted in yellow)
              </>
            )}
          </div>
        </div>
      </div>

      <details className="rounded border border-zinc-200 px-4 py-3 text-sm text-foreground/80 dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">How the algorithm works</summary>
        <div className="mt-3 space-y-2">
          <p>
            For every pixel in scan order, if it&apos;s not yet visited and its color matches the target
            within the tolerance, we start a new region: an iterative flood-fill walks the
            8-neighborhood, marking each newly-discovered matching pixel and queueing it for further
            expansion. When the queue empties, the region is complete.
          </p>
          <p>
            Regions smaller than the minimum size are dropped. Each surviving region is then
            recolored a unique color, so disjoint groups of similar-colored pixels become visible.
          </p>
        </div>
      </details>
    </section>
  );
}
