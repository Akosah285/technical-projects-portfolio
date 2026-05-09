export type ScanOp = "plus" | "times";
export type ScanMode = "inclusive" | "exclusive";

export interface ScanStep {
  array: number[];
  activeIndex: number | null;
  sourceIndices: number[];
  label: string;
}

const OPERATIONS: Record<ScanOp, (a: number, b: number) => number> = {
  plus: (a, b) => a + b,
  times: (a, b) => a * b,
};

const IDENTITIES: Record<ScanOp, number> = { plus: 0, times: 1 };
const SYMBOLS: Record<ScanOp, string> = { plus: "+", times: "×" };

export function scanTrace(
  input: number[],
  op: ScanOp,
  mode: ScanMode,
): ScanStep[] {
  const arr = [...input];
  const steps: ScanStep[] = [];
  const apply = OPERATIONS[op];
  const symbol = SYMBOLS[op];

  steps.push({
    array: [...arr],
    activeIndex: null,
    sourceIndices: [],
    label: arr.length === 0 ? "empty input" : `initial ${mode} ${op}-scan`,
  });

  if (arr.length === 0) return steps;

  if (mode === "inclusive") {
    for (let i = 1; i < arr.length; i++) {
      const before = arr[i];
      arr[i] = apply(arr[i - 1], arr[i]);
      steps.push({
        array: [...arr],
        activeIndex: i,
        sourceIndices: [i - 1, i],
        label: `arr[${i}] = arr[${i - 1}] ${symbol} ${before} = ${arr[i]}`,
      });
    }
  } else {
    let previous = arr[0];
    arr[0] = IDENTITIES[op];
    steps.push({
      array: [...arr],
      activeIndex: 0,
      sourceIndices: [],
      label: `arr[0] ← identity (${IDENTITIES[op]})`,
    });
    for (let i = 1; i < arr.length; i++) {
      const newPosition = arr[i];
      arr[i] = apply(previous, arr[i - 1]);
      steps.push({
        array: [...arr],
        activeIndex: i,
        sourceIndices: [i - 1],
        label: `arr[${i}] = ${previous} ${symbol} arr[${i - 1}] = ${arr[i]}`,
      });
      previous = newPosition;
    }
  }

  steps.push({
    array: [...arr],
    activeIndex: null,
    sourceIndices: [],
    label: `complete ${mode} ${op}-scan`,
  });

  return steps;
}
