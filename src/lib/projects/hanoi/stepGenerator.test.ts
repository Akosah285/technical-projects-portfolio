import { describe, it, expect } from "vitest";
import { generateHanoiSteps, type HanoiMove, type Peg } from "./stepGenerator";

type PegState = Record<Peg, number[]>;

function startState(n: number, source: Peg): PegState {
  const empty: PegState = { A: [], B: [], C: [] };
  empty[source] = Array.from({ length: n }, (_, i) => n - i);
  return empty;
}

function applyMove(state: PegState, move: HanoiMove): PegState {
  const fromStack = [...state[move.from]];
  const toStack = [...state[move.to]];
  const disk = fromStack.pop();
  if (disk === undefined) {
    throw new Error(`Illegal move: source peg ${move.from} is empty`);
  }
  if (disk !== move.disk) {
    throw new Error(
      `Illegal move: top of ${move.from} is ${disk}, move expected ${move.disk}`,
    );
  }
  const top = toStack[toStack.length - 1];
  if (top !== undefined && top < disk) {
    throw new Error(
      `Illegal move: cannot place disk ${disk} on smaller disk ${top} (peg ${move.to})`,
    );
  }
  toStack.push(disk);
  return { ...state, [move.from]: fromStack, [move.to]: toStack };
}

function simulate(n: number, source: Peg, moves: HanoiMove[]): PegState {
  return moves.reduce(applyMove, startState(n, source));
}

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
