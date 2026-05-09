import { describe, expect, it } from "vitest";
import {
  nextGeneration,
  emptyGrid,
  countLivingNeighbors,
  PATTERNS,
} from "./gameOfLife";

function gridFromAscii(rows: string[]): boolean[][] {
  return rows.map((r) => r.split("").map((c) => c === "X"));
}

function gridToAscii(g: boolean[][]): string[] {
  return g.map((r) => r.map((c) => (c ? "X" : ".")).join(""));
}

describe("emptyGrid", () => {
  it("returns a grid of the given dimensions, all dead", () => {
    const g = emptyGrid(3, 4);
    expect(g.length).toBe(3);
    expect(g[0].length).toBe(4);
    expect(g.flat().every((c) => c === false)).toBe(true);
  });
});

describe("countLivingNeighbors", () => {
  it("returns 0 for an empty grid", () => {
    expect(countLivingNeighbors(emptyGrid(5, 5), 2, 2)).toBe(0);
  });

  it("counts all 8 neighbors when surrounded", () => {
    const g = gridFromAscii([
      "XXX",
      "X.X",
      "XXX",
    ]);
    expect(countLivingNeighbors(g, 1, 1)).toBe(8);
  });

  it("wraps toroidally — top-left counts bottom-right as neighbor", () => {
    const g = gridFromAscii([
      "X..",
      "...",
      "..X",
    ]);
    expect(countLivingNeighbors(g, 0, 0)).toBe(1);
  });
});

describe("nextGeneration — Conway B3/S23 with toroidal wraparound", () => {
  it("a still life (block) survives unchanged", () => {
    const block = gridFromAscii([
      "....",
      ".XX.",
      ".XX.",
      "....",
    ]);
    expect(gridToAscii(nextGeneration(block))).toEqual(gridToAscii(block));
  });

  it("a blinker oscillates between horizontal and vertical", () => {
    const horizontal = gridFromAscii([
      ".....",
      ".....",
      ".XXX.",
      ".....",
      ".....",
    ]);
    const vertical = gridFromAscii([
      ".....",
      "..X..",
      "..X..",
      "..X..",
      ".....",
    ]);
    expect(gridToAscii(nextGeneration(horizontal))).toEqual(gridToAscii(vertical));
    expect(gridToAscii(nextGeneration(vertical))).toEqual(gridToAscii(horizontal));
  });

  it("an isolated live cell dies of underpopulation", () => {
    const g = gridFromAscii([
      "...",
      ".X.",
      "...",
    ]);
    const next = nextGeneration(g);
    expect(next[1][1]).toBe(false);
  });

  it("a dead cell with exactly 3 living neighbors becomes alive", () => {
    const g = gridFromAscii([
      "XX.",
      "X..",
      "...",
    ]);
    const next = nextGeneration(g);
    expect(next[1][1]).toBe(true);
  });

  it("a glider translates by (1, 1) every 4 generations on a large enough grid", () => {
    let g = emptyGrid(10, 10);
    g[1][2] = true;
    g[2][3] = true;
    g[3][1] = true;
    g[3][2] = true;
    g[3][3] = true;

    for (let i = 0; i < 4; i++) g = nextGeneration(g);

    const target = emptyGrid(10, 10);
    target[2][3] = true;
    target[3][4] = true;
    target[4][2] = true;
    target[4][3] = true;
    target[4][4] = true;

    expect(gridToAscii(g)).toEqual(gridToAscii(target));
  });
});

describe("PATTERNS", () => {
  it("includes at least glider, blinker, and pulsar", () => {
    expect(PATTERNS.glider).toBeDefined();
    expect(PATTERNS.blinker).toBeDefined();
    expect(PATTERNS.pulsar).toBeDefined();
  });

  it("each pattern is a non-empty grid of cell offsets", () => {
    for (const name of Object.keys(PATTERNS)) {
      const cells = PATTERNS[name].cells;
      expect(cells.length).toBeGreaterThan(0);
      for (const [r, c] of cells) {
        expect(typeof r).toBe("number");
        expect(typeof c).toBe("number");
      }
    }
  });
});
