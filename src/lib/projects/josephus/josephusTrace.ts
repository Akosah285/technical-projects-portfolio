export interface JosephusStep {
  alive: number[];
  currentIndex: number | null;
  killed: number | null;
  survivor: number | null;
  label: string;
}

export function josephusTrace(n: number, k: number): JosephusStep[] {
  if (n < 1) return [];
  const steps: JosephusStep[] = [];
  const alive: number[] = [];
  for (let i = 1; i <= n; i++) alive.push(i);

  let currentIdx = n - 1;
  steps.push({
    alive: [...alive],
    currentIndex: currentIdx,
    killed: null,
    survivor: null,
    label: `Initial circle of ${n} soldiers — pointer at soldier ${alive[currentIdx]}`,
  });

  while (alive.length > 1) {
    currentIdx = (currentIdx + k) % alive.length;
    const killedNumber = alive[currentIdx];
    alive.splice(currentIdx, 1);
    let nextIdx = currentIdx - 1;
    if (alive.length > 0) {
      while (nextIdx < 0) nextIdx += alive.length;
    } else {
      nextIdx = 0;
    }
    currentIdx = nextIdx;

    steps.push({
      alive: [...alive],
      currentIndex: alive.length > 0 ? currentIdx : null,
      killed: killedNumber,
      survivor: null,
      label: `Soldier ${killedNumber} was killed`,
    });
  }

  steps.push({
    alive: [...alive],
    currentIndex: alive.length > 0 ? 0 : null,
    killed: null,
    survivor: alive[0] ?? null,
    label: alive.length === 1 ? `The last remaining soldier is ${alive[0]}.` : "No survivors.",
  });

  return steps;
}

export function josephusSurvivor(n: number, k: number): number {
  if (n < 1) return 0;
  const trace = josephusTrace(n, k);
  return trace[trace.length - 1].survivor ?? 0;
}
