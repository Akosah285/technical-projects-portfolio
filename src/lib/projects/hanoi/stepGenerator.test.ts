import { describe, it, expect } from "vitest";
import { generateHanoiSteps } from "./stepGenerator";
import { simulate } from "./pegState";

describe("generateHanoiSteps", () => {
  it("solves n=1 with a single move from source to destination", () => {
    const moves = generateHanoiSteps(1, "A", "C", "B");

    expect(moves).toEqual([{ disk: 1, from: "A", to: "C" }]);
  });

  it("solves n=2 by parking the small disk on the spare peg", () => {
    const moves = generateHanoiSteps(2, "A", "C", "B");

    expect(moves).toEqual([
      { disk: 1, from: "A", to: "B" },
      { disk: 2, from: "A", to: "C" },
      { disk: 1, from: "B", to: "C" },
    ]);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "produces exactly 2^n - 1 moves for n=%i",
    (n) => {
      const moves = generateHanoiSteps(n, "A", "C", "B");
      expect(moves).toHaveLength(2 ** n - 1);
    },
  );

  it.each([1, 2, 3, 4, 5, 6, 7, 8])(
    "produces only legal moves and ends with all disks stacked on destination for n=%i",
    (n) => {
      const moves = generateHanoiSteps(n, "A", "C", "B");
      const finalState = simulate(n, "A", moves);

      expect(finalState.A).toEqual([]);
      expect(finalState.B).toEqual([]);
      expect(finalState.C).toEqual(
        Array.from({ length: n }, (_, i) => n - i),
      );
    },
  );
});
