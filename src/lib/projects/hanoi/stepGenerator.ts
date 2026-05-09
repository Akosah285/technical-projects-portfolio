export type Peg = "A" | "B" | "C";

export interface HanoiMove {
  disk: number;
  from: Peg;
  to: Peg;
}

export function generateHanoiSteps(
  n: number,
  from: Peg,
  to: Peg,
  via: Peg,
): HanoiMove[] {
  if (n <= 0) return [];

  return [
    ...generateHanoiSteps(n - 1, from, via, to),
    { disk: n, from, to },
    ...generateHanoiSteps(n - 1, via, to, from),
  ];
}
