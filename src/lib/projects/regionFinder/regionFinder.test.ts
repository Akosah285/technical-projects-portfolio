import { describe, expect, it } from "vitest";
import {
  colorDistance,
  colorMatch,
  findRegions,
  largestRegion,
  recolorImage,
  type Color,
  type Image,
} from "./regionFinder";

const RED: Color = { r: 255, g: 0, b: 0 };
const GREEN: Color = { r: 0, g: 255, b: 0 };
const BLUE: Color = { r: 0, g: 0, b: 255 };
const NEAR_RED: Color = { r: 250, g: 5, b: 3 };
const BLACK: Color = { r: 0, g: 0, b: 0 };

function makeImage(rows: Color[][]): Image {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  return { width, height, pixels: rows };
}

function fill(width: number, height: number, c: Color): Image {
  const rows: Color[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Color[] = [];
    for (let x = 0; x < width; x++) row.push(c);
    rows.push(row);
  }
  return makeImage(rows);
}

describe("colorDistance", () => {
  it("returns 0 for identical colors", () => {
    expect(colorDistance(RED, RED)).toBe(0);
  });

  it("returns the Euclidean distance in RGB space", () => {
    // sqrt(255^2 + 255^2 + 0^2) ≈ 360.6
    expect(colorDistance(RED, GREEN)).toBeCloseTo(Math.sqrt(255 * 255 * 2), 5);
  });
});

describe("colorMatch", () => {
  it("treats identical colors as a match", () => {
    expect(colorMatch(RED, RED, 20)).toBe(true);
  });

  it("treats near-identical colors as a match within the threshold", () => {
    expect(colorMatch(RED, NEAR_RED, 20)).toBe(true);
  });

  it("treats wildly different colors as no match", () => {
    expect(colorMatch(RED, GREEN, 20)).toBe(false);
  });
});

describe("findRegions", () => {
  it("returns no regions for a blank image of the wrong color", () => {
    const img = fill(5, 5, BLUE);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    expect(regions).toEqual([]);
  });

  it("finds a single full-image region when every pixel matches", () => {
    const img = fill(3, 3, RED);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    expect(regions.length).toBe(1);
    expect(regions[0].length).toBe(9);
  });

  it("finds two disjoint regions of the same target color", () => {
    const img = makeImage([
      [RED, RED, BLACK, RED, RED],
      [RED, RED, BLACK, RED, RED],
      [BLACK, BLACK, BLACK, BLACK, BLACK],
    ]);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    expect(regions.length).toBe(2);
    expect(regions.map((r) => r.length).sort()).toEqual([4, 4]);
  });

  it("respects the minRegion threshold by dropping small regions", () => {
    const img = makeImage([
      [RED, BLACK, RED, RED, RED],
      [BLACK, BLACK, RED, RED, RED],
      [BLACK, BLACK, RED, RED, RED],
    ]);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 5 });
    expect(regions.length).toBe(1);
    expect(regions[0].length).toBe(9);
  });

  it("treats colors close to target as part of the region", () => {
    const img = makeImage([
      [RED, NEAR_RED, RED],
      [RED, NEAR_RED, RED],
    ]);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    expect(regions.length).toBe(1);
    expect(regions[0].length).toBe(6);
  });

  it("treats diagonally adjacent matching pixels as connected (8-neighborhood)", () => {
    const img = makeImage([
      [RED, BLACK, BLACK],
      [BLACK, RED, BLACK],
      [BLACK, BLACK, RED],
    ]);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    expect(regions.length).toBe(1);
    expect(regions[0].length).toBe(3);
  });
});

describe("largestRegion", () => {
  it("returns null when there are no regions", () => {
    expect(largestRegion([])).toBeNull();
  });

  it("returns the region with the most points", () => {
    const small = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    const big = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ];
    expect(largestRegion([small, big])).toBe(big);
  });
});

describe("recolorImage", () => {
  it("paints each region a single new color, leaving non-region pixels unchanged", () => {
    const img = makeImage([
      [RED, RED, BLACK],
      [RED, RED, BLACK],
    ]);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    const colors = [{ r: 1, g: 2, b: 3 }];
    const recolored = recolorImage(img, regions, () => colors[0]);

    // Region pixels were repainted
    expect(recolored.pixels[0][0]).toEqual(colors[0]);
    expect(recolored.pixels[1][1]).toEqual(colors[0]);
    // Non-region pixel is untouched
    expect(recolored.pixels[0][2]).toEqual(BLACK);
    expect(recolored.pixels[1][2]).toEqual(BLACK);
  });

  it("does not mutate the source image", () => {
    const img = fill(2, 2, RED);
    const regions = findRegions(img, RED, { maxColorDiff: 20, minRegion: 1 });
    recolorImage(img, regions, () => GREEN);
    // original is still red
    expect(img.pixels[0][0]).toEqual(RED);
    expect(img.pixels[1][1]).toEqual(RED);
  });
});
