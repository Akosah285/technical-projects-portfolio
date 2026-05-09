export interface QuicksortStep {
  array: number[];
  pivotIndex: number | null;
  iIndex: number | null;
  jIndex: number | null;
  partitionRange: [number, number] | null;
  sortedRanges: Array<[number, number]>;
  label: string;
}

export function quicksortTrace(input: number[]): QuicksortStep[] {
  const arr = [...input];
  const steps: QuicksortStep[] = [];

  if (arr.length <= 1) {
    return [
      {
        array: [...arr],
        pivotIndex: null,
        iIndex: null,
        jIndex: null,
        partitionRange: null,
        sortedRanges: arr.length === 1 ? [[0, 0]] : [],
        label: arr.length === 0 ? "empty" : "trivially sorted",
      },
    ];
  }

  const sortedRanges: Array<[number, number]> = [];

  steps.push({
    array: [...arr],
    pivotIndex: null,
    iIndex: null,
    jIndex: null,
    partitionRange: null,
    sortedRanges: [],
    label: "initial array",
  });

  function snapshot(
    pivotIndex: number,
    iIndex: number,
    jIndex: number,
    partitionRange: [number, number],
    label: string,
  ) {
    steps.push({
      array: [...arr],
      pivotIndex,
      iIndex,
      jIndex,
      partitionRange,
      sortedRanges: sortedRanges.map(([a, b]) => [a, b] as [number, number]),
      label,
    });
  }

  function partition(p: number, r: number): number {
    let i = p - 1;
    let j = p;
    snapshot(r, i, j, [p, r], `partition [${p}..${r}], pivot = ${arr[r]}`);
    while (j < r) {
      if (arr[j] < arr[r]) {
        [arr[j], arr[i + 1]] = [arr[i + 1], arr[j]];
        i = i + 1;
        snapshot(r, i, j, [p, r], `${arr[j]} < ${arr[r]}: swap into low side`);
      } else {
        snapshot(r, i, j, [p, r], `${arr[j]} ≥ ${arr[r]}: leave on high side`);
      }
      j = j + 1;
    }
    [arr[r], arr[i + 1]] = [arr[i + 1], arr[r]];
    snapshot(i + 1, i, j, [p, r], `place pivot at index ${i + 1}`);
    return i + 1;
  }

  function quicksort(p: number, r: number) {
    if (r > p) {
      const pivotPos = partition(p, r);
      sortedRanges.push([pivotPos, pivotPos]);
      quicksort(p, pivotPos - 1);
      quicksort(pivotPos + 1, r);
    } else if (r === p) {
      sortedRanges.push([p, p]);
    }
  }

  quicksort(0, arr.length - 1);

  steps.push({
    array: [...arr],
    pivotIndex: null,
    iIndex: null,
    jIndex: null,
    partitionRange: null,
    sortedRanges: [[0, arr.length - 1]],
    label: "sorted",
  });

  return steps;
}
