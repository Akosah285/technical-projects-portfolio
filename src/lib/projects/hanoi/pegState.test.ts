import { describe, it, expect } from "vitest";
import { startState, applyMove, simulate, type PegState } from "./pegState";

describe("startState", () => {
  it("places n disks on the source peg, largest at the bottom", () => {
    const state = startState(3, "A");

    expect(state).toEqual<PegState>({
      A: [3, 2, 1],
      B: [],
      C: [],
    });
  });

  it("supports starting on a different source peg", () => {
    const state = startState(2, "B");

    expect(state).toEqual<PegState>({
      A: [],
      B: [2, 1],
      C: [],
    });
  });
});

describe("applyMove", () => {
  it("moves the top disk from source to destination", () => {
    const state = startState(2, "A");
    const next = applyMove(state, { disk: 1, from: "A", to: "B" });

    expect(next).toEqual<PegState>({ A: [2], B: [1], C: [] });
  });

  it("throws when the source peg is empty", () => {
    const state = startState(1, "A");
    expect(() =>
      applyMove(state, { disk: 1, from: "B", to: "C" }),
    ).toThrow(/empty/);
  });

  it("throws when the move's disk does not match the top of the source", () => {
    const state = startState(2, "A");
    expect(() =>
      applyMove(state, { disk: 2, from: "A", to: "C" }),
    ).toThrow(/top of A is 1, move expected 2/);
  });

  it("throws when placing a larger disk on a smaller one", () => {
    const state: PegState = { A: [3], B: [1], C: [] };
    expect(() =>
      applyMove(state, { disk: 3, from: "A", to: "B" }),
    ).toThrow(/cannot place disk 3 on smaller disk 1/);
  });
});

describe("simulate", () => {
  it("applies a sequence of moves and returns the final state", () => {
    const final = simulate(2, "A", [
      { disk: 1, from: "A", to: "B" },
      { disk: 2, from: "A", to: "C" },
      { disk: 1, from: "B", to: "C" },
    ]);

    expect(final).toEqual<PegState>({ A: [], B: [], C: [2, 1] });
  });
});
