import { describe, expect, it } from "vitest";
import {
  averageSeparation,
  bfs,
  getPath,
  Graph,
  missingVertices,
} from "./kevinBacon";

function tinyActorGraph(): Graph<string, Set<string>> {
  const g = new Graph<string, Set<string>>();
  for (const a of ["Kevin Bacon", "Alice", "Bob", "Charlie", "Dartmouth (Earl thereof)", "Nobody", "Nobody's Friend"]) {
    g.insertVertex(a);
  }
  g.insertUndirected("Kevin Bacon", "Bob", new Set(["A movie"]));
  g.insertUndirected("Kevin Bacon", "Alice", new Set(["A movie"]));
  g.insertUndirected("Alice", "Bob", new Set(["A movie"]));
  g.insertUndirected("Bob", "Charlie", new Set(["C movie"]));
  g.insertUndirected("Charlie", "Dartmouth (Earl thereof)", new Set(["B movie"]));
  g.insertUndirected("Nobody", "Nobody's Friend", new Set(["F movie"]));
  return g;
}

describe("Graph", () => {
  it("starts empty", () => {
    const g = new Graph<string, number>();
    expect(g.numVertices()).toBe(0);
    expect(g.allVertices()).toEqual([]);
  });

  it("insertVertex is idempotent", () => {
    const g = new Graph<string, number>();
    g.insertVertex("a");
    g.insertVertex("a");
    expect(g.numVertices()).toBe(1);
  });

  it("insertUndirected links both directions with the same label", () => {
    const g = new Graph<string, string>();
    g.insertVertex("a");
    g.insertVertex("b");
    g.insertUndirected("a", "b", "edge");
    expect(g.hasEdge("a", "b")).toBe(true);
    expect(g.hasEdge("b", "a")).toBe(true);
    expect(g.getLabel("a", "b")).toBe("edge");
    expect(g.getLabel("b", "a")).toBe("edge");
  });

  it("insertUndirected throws when an endpoint is missing", () => {
    const g = new Graph<string, string>();
    g.insertVertex("a");
    expect(() => g.insertUndirected("a", "b", "x")).toThrow();
  });

  it("neighbors returns only directly-linked vertices", () => {
    const g = new Graph<string, string>();
    g.insertVertex("a");
    g.insertVertex("b");
    g.insertVertex("c");
    g.insertUndirected("a", "b", "x");
    g.insertUndirected("a", "c", "y");
    expect(g.neighbors("a").sort()).toEqual(["b", "c"]);
    expect(g.neighbors("b")).toEqual(["a"]);
  });
});

describe("bfs", () => {
  it("returns an empty map when the start isn't a vertex", () => {
    const g = new Graph<string, number>();
    expect(bfs(g, "missing").size).toBe(0);
  });

  it("the start vertex maps to null", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    expect(parents.get("Kevin Bacon")).toBe(null);
  });

  it("reaches every vertex in the connected component", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    expect(parents.has("Alice")).toBe(true);
    expect(parents.has("Bob")).toBe(true);
    expect(parents.has("Charlie")).toBe(true);
    expect(parents.has("Dartmouth (Earl thereof)")).toBe(true);
  });

  it("does not reach vertices in other components", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    expect(parents.has("Nobody")).toBe(false);
    expect(parents.has("Nobody's Friend")).toBe(false);
  });
});

describe("getPath", () => {
  it("returns null when the target was never reached", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    expect(getPath(parents, "Nobody")).toBeNull();
  });

  it("returns a single-element path for the root", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    expect(getPath(parents, "Kevin Bacon")).toEqual(["Kevin Bacon"]);
  });

  it("returns the shortest path from target to root", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    const path = getPath(parents, "Dartmouth (Earl thereof)");
    expect(path?.[0]).toBe("Dartmouth (Earl thereof)");
    expect(path?.[path.length - 1]).toBe("Kevin Bacon");
    // Bacon number is 3 (Dartmouth → Charlie → Bob → Kevin Bacon)
    expect(path?.length).toBe(4);
  });
});

describe("missingVertices", () => {
  it("returns vertices not in the BFS tree", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    const missing = missingVertices(g, parents).sort();
    expect(missing).toEqual(["Nobody", "Nobody's Friend"]);
  });
});

describe("averageSeparation", () => {
  it("is 0 for a singleton component", () => {
    const g = new Graph<string, number>();
    g.insertVertex("a");
    const parents = bfs(g, "a");
    expect(averageSeparation(parents, "a")).toBe(0);
  });

  it("matches the known Kevin Bacon test data", () => {
    const g = tinyActorGraph();
    const parents = bfs(g, "Kevin Bacon");
    // Depths from Kevin Bacon: Alice=1, Bob=1, Charlie=2, Dartmouth=3
    // average = (1+1+2+3)/4 = 1.75
    expect(averageSeparation(parents, "Kevin Bacon")).toBeCloseTo(1.75, 5);
  });
});
