/**
 * Undirected graph + BFS — TypeScript port of the Graph and GraphLib classes
 * from the Winter 2019 PS_4 (Kevin Bacon) Java submission.
 *
 * The graph is generic over vertex IDs and edge labels. For Kevin Bacon, the
 * vertex ID is an actor name and the edge label is a Set<string> of shared
 * movies. BFS returns the shortest-path tree as a Map<vertex, parent>; null
 * marks the root.
 */

export class Graph<V, E> {
  private vertices = new Set<V>();
  private edges = new Map<V, Map<V, E>>();

  insertVertex(v: V): void {
    if (!this.vertices.has(v)) {
      this.vertices.add(v);
      this.edges.set(v, new Map());
    }
  }

  hasVertex(v: V): boolean {
    return this.vertices.has(v);
  }

  hasEdge(u: V, v: V): boolean {
    return this.edges.get(u)?.has(v) ?? false;
  }

  /**
   * Insert (or replace) an undirected edge between u and v with the given label.
   * Both endpoints must already exist as vertices.
   */
  insertUndirected(u: V, v: V, label: E): void {
    if (!this.vertices.has(u) || !this.vertices.has(v)) {
      throw new Error("Both endpoints must be vertices");
    }
    this.edges.get(u)!.set(v, label);
    this.edges.get(v)!.set(u, label);
  }

  getLabel(u: V, v: V): E | undefined {
    return this.edges.get(u)?.get(v);
  }

  numVertices(): number {
    return this.vertices.size;
  }

  allVertices(): V[] {
    return [...this.vertices];
  }

  neighbors(v: V): V[] {
    const m = this.edges.get(v);
    return m ? [...m.keys()] : [];
  }
}

/**
 * Run breadth-first search from `start`, returning the shortest-path tree as
 * a Map<vertex, parent>. The start vertex maps to null.
 */
export function bfs<V, E>(g: Graph<V, E>, start: V): Map<V, V | null> {
  const parents = new Map<V, V | null>();
  if (!g.hasVertex(start)) return parents;

  parents.set(start, null);
  const queue: V[] = [start];

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const v of g.neighbors(u)) {
      if (parents.has(v)) continue;
      parents.set(v, u);
      queue.push(v);
    }
  }
  return parents;
}

/**
 * Reconstruct the path from `target` back to the BFS root by following parent
 * pointers. Returns the path with `target` first and the root last, or null
 * if the target was never reached.
 */
export function getPath<V>(parents: Map<V, V | null>, target: V): V[] | null {
  if (!parents.has(target)) return null;
  const path: V[] = [];
  let cur: V | null = target;
  while (cur !== null) {
    path.push(cur);
    cur = parents.get(cur) ?? null;
  }
  return path;
}

/**
 * The vertices in `g` that aren't reachable in the BFS tree.
 */
export function missingVertices<V, E>(g: Graph<V, E>, parents: Map<V, V | null>): V[] {
  const out: V[] = [];
  for (const v of g.allVertices()) {
    if (!parents.has(v)) out.push(v);
  }
  return out;
}

/**
 * Average separation: walk the BFS tree summing the depth of each reachable
 * vertex, and divide by the number of reachable vertices excluding the root.
 * Returns 0 if the only reachable vertex is the root itself.
 */
export function averageSeparation<V>(parents: Map<V, V | null>, root: V): number {
  if (!parents.has(root)) return 0;
  const depth = new Map<V, number>();
  depth.set(root, 0);
  // Compute depths by walking parent chain
  for (const v of parents.keys()) {
    if (depth.has(v)) continue;
    const chain: V[] = [];
    let cur: V | null = v;
    while (cur !== null && !depth.has(cur)) {
      chain.push(cur);
      cur = parents.get(cur) ?? null;
    }
    let baseDepth = cur !== null ? depth.get(cur)! : 0;
    while (chain.length > 0) {
      baseDepth++;
      depth.set(chain.pop()!, baseDepth);
    }
  }
  let sum = 0;
  let count = 0;
  for (const [v, d] of depth.entries()) {
    if (v === root) continue;
    sum += d;
    count++;
  }
  return count === 0 ? 0 : sum / count;
}
