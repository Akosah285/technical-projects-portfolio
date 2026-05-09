import { describe, it, expect } from "vitest";
import { scanTrace } from "./scanTrace";

describe("scanTrace — inclusive plus", () => {
  it("the final step's array is the inclusive prefix sum of the input", () => {
    const trace = scanTrace([3, 6, 2, 1, 4, 7], "plus", "inclusive");

    expect(trace[trace.length - 1].array).toEqual([3, 9, 11, 12, 16, 23]);
  });

  it("the first step shows the input array unchanged", () => {
    const trace = scanTrace([3, 6, 2, 1, 4, 7], "plus", "inclusive");

    expect(trace[0].array).toEqual([3, 6, 2, 1, 4, 7]);
  });
});

describe("scanTrace — inclusive times", () => {
  it("the final step's array is the inclusive prefix product", () => {
    const trace = scanTrace([2, 4, 2, 6, 2], "times", "inclusive");

    expect(trace[trace.length - 1].array).toEqual([2, 8, 16, 96, 192]);
  });
});

describe("scanTrace — exclusive plus", () => {
  it("first cell becomes the identity (0) and subsequent cells are exclusive prefix sums", () => {
    const trace = scanTrace([3, 6, 2, 1, 4, 7], "plus", "exclusive");

    expect(trace[trace.length - 1].array).toEqual([0, 3, 9, 11, 12, 16]);
  });
});

describe("scanTrace — exclusive times", () => {
  it("first cell becomes the identity (1) and subsequent cells are exclusive prefix products", () => {
    const trace = scanTrace([2, 4, 2, 6, 2], "times", "exclusive");

    expect(trace[trace.length - 1].array).toEqual([1, 2, 8, 16, 96]);
  });
});

describe("scanTrace — invariants", () => {
  it("every step preserves the input length", () => {
    const input = [3, 6, 2, 1, 4, 7];
    const trace = scanTrace(input, "plus", "inclusive");

    for (const step of trace) {
      expect(step.array).toHaveLength(input.length);
    }
  });

  it("an empty input yields a single trivial step with the empty array", () => {
    const trace = scanTrace([], "plus", "inclusive");

    expect(trace).toHaveLength(1);
    expect(trace[0].array).toEqual([]);
  });

  it("a singleton input is unchanged for inclusive scan", () => {
    const trace = scanTrace([42], "plus", "inclusive");

    expect(trace[trace.length - 1].array).toEqual([42]);
  });
});
