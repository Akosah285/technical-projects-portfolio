import { describe, it, expect } from "vitest";
import { quicksortTrace } from "./quicksortTrace";

describe("quicksortTrace", () => {
  it("the final step's array is the input sorted ascending", () => {
    const input = [3, 1, 2];
    const trace = quicksortTrace(input);

    const last = trace[trace.length - 1];
    expect(last.array).toEqual([1, 2, 3]);
  });

  it("the first step shows the input array as-is", () => {
    const trace = quicksortTrace([3, 1, 2]);

    expect(trace[0].array).toEqual([3, 1, 2]);
  });

  it("an empty input produces a single trivial step with the empty array", () => {
    const trace = quicksortTrace([]);

    expect(trace).toHaveLength(1);
    expect(trace[0].array).toEqual([]);
  });

  it("a singleton input produces a single trivial step (nothing to partition)", () => {
    const trace = quicksortTrace([42]);

    expect(trace).toHaveLength(1);
    expect(trace[0].array).toEqual([42]);
  });

  it("every step preserves the input array length", () => {
    const input = [5, 2, 8, 1, 9, 3, 7];
    const trace = quicksortTrace(input);

    for (const step of trace) {
      expect(step.array).toHaveLength(input.length);
    }
  });

  it("every step's array is a permutation of the original input", () => {
    const input = [5, 2, 8, 1, 9, 3, 7];
    const expectedSorted = [...input].sort((a, b) => a - b);
    const trace = quicksortTrace(input);

    for (const step of trace) {
      const stepSorted = [...step.array].sort((a, b) => a - b);
      expect(stepSorted).toEqual(expectedSorted);
    }
  });
});
