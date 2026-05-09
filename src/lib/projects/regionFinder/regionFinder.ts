/**
 * Region-growing image processing — faithful TypeScript port of the Java
 * PS_1 RegionFinder class from Dartmouth COSC 10 (Winter 2019).
 *
 * Original Java by Sylvester Elorm Coch and Akwasi Akosah, modified for
 * submission. This port preserves the algorithm: an iterative flood-fill
 * over an 8-neighborhood that walks every pixel in scan order and grows a
 * region from each unvisited matching seed.
 */

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Pixel {
  x: number;
  y: number;
}

export interface Image {
  width: number;
  height: number;
  pixels: Color[][];
}

export interface FindOptions {
  maxColorDiff: number;
  minRegion: number;
}

export type Region = Pixel[];

export function colorDistance(a: Color, b: Color): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function colorMatch(a: Color, b: Color, threshold: number): boolean {
  return colorDistance(a, b) < threshold;
}

export function findRegions(
  image: Image,
  target: Color,
  options: FindOptions,
): Region[] {
  const { maxColorDiff, minRegion } = options;
  const { width, height, pixels } = image;
  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false),
  );
  const regions: Region[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y][x]) continue;
      if (!colorMatch(pixels[y][x], target, maxColorDiff)) continue;

      const region: Region = [];
      const toVisit: Pixel[] = [{ x, y }];
      visited[y][x] = true;

      while (toVisit.length > 0) {
        const p = toVisit.pop()!;
        region.push(p);

        for (let py = Math.max(0, p.y - 1); py <= Math.min(height - 1, p.y + 1); py++) {
          for (let px = Math.max(0, p.x - 1); px <= Math.min(width - 1, p.x + 1); px++) {
            if (visited[py][px]) continue;
            visited[py][px] = true;
            if (colorMatch(pixels[py][px], target, maxColorDiff)) {
              toVisit.push({ x: px, y: py });
            }
          }
        }
      }

      if (region.length >= minRegion) {
        regions.push(region);
      }
    }
  }

  return regions;
}

export function largestRegion(regions: Region[]): Region | null {
  if (regions.length === 0) return null;
  let best = regions[0];
  for (const r of regions) {
    if (r.length > best.length) best = r;
  }
  return best;
}

export function recolorImage(
  image: Image,
  regions: Region[],
  pickColor: (regionIndex: number) => Color,
): Image {
  const newPixels: Color[][] = image.pixels.map((row) => row.map((c) => ({ ...c })));
  for (let i = 0; i < regions.length; i++) {
    const color = pickColor(i);
    for (const p of regions[i]) {
      newPixels[p.y][p.x] = { ...color };
    }
  }
  return { width: image.width, height: image.height, pixels: newPixels };
}
