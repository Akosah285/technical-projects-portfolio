import { describe, expect, it } from "vitest";
import { bfsTrace, type CampusGraph } from "./bfsTrace";

const tinyGraph: CampusGraph = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D"],
  D: ["B", "C", "E"],
  E: ["D"],
};

describe("bfsTrace", () => {
  it("returns a single-step trace with the trivial path when start equals goal", () => {
    const trace = bfsTrace(tinyGraph, "A", "A");
    const last = trace[trace.length - 1];
    expect(last.path).toEqual(["A"]);
  });

  it("finds a shortest path of length 2 between adjacent vertices", () => {
    const trace = bfsTrace(tinyGraph, "A", "B");
    const last = trace[trace.length - 1];
    expect(last.path).toEqual(["A", "B"]);
  });

  it("finds the shortest path A → D (length 3, not 4)", () => {
    const trace = bfsTrace(tinyGraph, "A", "D");
    const last = trace[trace.length - 1];
    expect(last.path.length).toBe(3);
    expect(last.path[0]).toBe("A");
    expect(last.path[2]).toBe("D");
    expect(["B", "C"]).toContain(last.path[1]);
  });

  it("finds A → E across the diamond (length 4)", () => {
    const trace = bfsTrace(tinyGraph, "A", "E");
    const last = trace[trace.length - 1];
    expect(last.path.length).toBe(4);
    expect(last.path[0]).toBe("A");
    expect(last.path[last.path.length - 1]).toBe("E");
  });

  it("returns an empty path when goal is unreachable", () => {
    const disconnected: CampusGraph = { A: ["B"], B: ["A"], X: ["Y"], Y: ["X"] };
    const trace = bfsTrace(disconnected, "A", "X");
    const last = trace[trace.length - 1];
    expect(last.path).toEqual([]);
  });

  it("expands the frontier in BFS order — A is visited first", () => {
    const trace = bfsTrace(tinyGraph, "A", "E");
    const firstVisit = trace.find((s) => s.current !== null);
    expect(firstVisit?.current).toBe("A");
    expect(firstVisit?.visited).toContain("A");
  });

  it("never visits a vertex twice across the trace", () => {
    const trace = bfsTrace(tinyGraph, "A", "E");
    const last = trace[trace.length - 1];
    const uniqueVisited = new Set(last.visited);
    expect(uniqueVisited.size).toBe(last.visited.length);
  });

  it("includes the goal in visited once it is reached", () => {
    const trace = bfsTrace(tinyGraph, "A", "E");
    const last = trace[trace.length - 1];
    expect(last.visited).toContain("E");
  });

  it("each step's frontier is a subset of vertices not yet visited", () => {
    const trace = bfsTrace(tinyGraph, "A", "E");
    for (const step of trace) {
      const visitedSet = new Set(step.visited);
      for (const f of step.frontier) {
        expect(visitedSet.has(f)).toBe(false);
      }
    }
  });
});
