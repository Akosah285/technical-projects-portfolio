import { describe, it, expect } from "vitest";
import { Pollock } from "./pollock";

// Deterministic RNG that walks through a fixed sequence (loops if exhausted).
function seqRng(seq: number[]): () => number {
  let i = 0;
  return () => {
    const v = seq[i % seq.length];
    i++;
    return v;
  };
}

describe("Pollock", () => {
  it("rejects non-positive canvas dimensions", () => {
    expect(() => new Pollock({ width: 0, height: 10, pixelCount: 1 })).toThrow();
    expect(() => new Pollock({ width: 10, height: -1, pixelCount: 1 })).toThrow();
  });

  it("spawns the requested number of pixels with valid coordinates", () => {
    const p = new Pollock({ width: 50, height: 50, pixelCount: 12 });
    expect(p.pixels).toHaveLength(12);
    for (const px of p.pixels) {
      expect(px.x).toBeGreaterThanOrEqual(0);
      expect(px.x).toBeLessThan(50);
      expect(px.y).toBeGreaterThanOrEqual(0);
      expect(px.y).toBeLessThan(50);
      expect(px.color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    }
  });

  it("paints the trail at each pixel's location when stepped", () => {
    const p = new Pollock({
      width: 10,
      height: 10,
      pixelCount: 1,
      // spawn at (5, 5), then on step: pick pixel 0, dx=-1, dy=-1 → moves to (4, 4)
      rng: seqRng([0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0]),
    });
    expect(p.pixels[0]).toMatchObject({ x: 5, y: 5 });
    p.step(1);
    // Trail painted at original (5, 5)
    expect(p.trail[5 * 10 + 5]).not.toBeNull();
  });

  it("clamps moves to stay inside the canvas", () => {
    // Spawn at (0, 0), step would try to go to (-1, -1) → clamped to (0, 0).
    const p = new Pollock({
      width: 5,
      height: 5,
      pixelCount: 1,
      rng: seqRng([0, 0, 0, 0, 0, 0]),
    });
    p.step(10);
    expect(p.pixels[0].x).toBeGreaterThanOrEqual(0);
    expect(p.pixels[0].y).toBeGreaterThanOrEqual(0);
    expect(p.pixels[0].x).toBeLessThan(5);
    expect(p.pixels[0].y).toBeLessThan(5);
  });

  it("never paints a cell outside the canvas after many steps", () => {
    const p = new Pollock({ width: 20, height: 15, pixelCount: 30 });
    for (let i = 0; i < 1000; i++) p.step(20);
    expect(p.trail).toHaveLength(20 * 15);
    // All non-null cells are within the array bounds by construction.
    expect(p.paintedCells()).toBeGreaterThan(0);
  });

  it("eventually paints multiple cells when many steps are run", () => {
    const p = new Pollock({ width: 30, height: 30, pixelCount: 50 });
    p.step(2000);
    expect(p.paintedCells()).toBeGreaterThan(20);
  });

  it("reset clears the trail and respawns pixels", () => {
    const p = new Pollock({ width: 20, height: 20, pixelCount: 5 });
    p.step(500);
    expect(p.paintedCells()).toBeGreaterThan(0);
    p.reset(10);
    expect(p.paintedCells()).toBe(0);
    expect(p.pixels).toHaveLength(10);
  });
});
