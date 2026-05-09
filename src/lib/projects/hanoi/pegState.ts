import type { Peg, HanoiMove } from "./stepGenerator";

export type PegState = Record<Peg, number[]>;

export function startState(n: number, source: Peg): PegState {
  const state: PegState = { A: [], B: [], C: [] };
  state[source] = Array.from({ length: n }, (_, i) => n - i);
  return state;
}

export function applyMove(state: PegState, move: HanoiMove): PegState {
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

export function simulate(n: number, source: Peg, moves: HanoiMove[]): PegState {
  return moves.reduce(applyMove, startState(n, source));
}
