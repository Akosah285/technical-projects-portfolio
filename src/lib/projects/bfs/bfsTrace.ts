export type CampusGraph = Record<string, string[]>;

export interface BfsStep {
  current: string | null;
  visited: string[];
  frontier: string[];
  queue: string[];
  path: string[];
  label: string;
}

export function bfsTrace(graph: CampusGraph, start: string, goal: string): BfsStep[] {
  const steps: BfsStep[] = [];

  if (!(start in graph)) {
    steps.push({ current: null, visited: [], frontier: [], queue: [], path: [], label: `Unknown start vertex "${start}"` });
    return steps;
  }
  if (!(goal in graph)) {
    steps.push({ current: null, visited: [], frontier: [], queue: [], path: [], label: `Unknown goal vertex "${goal}"` });
    return steps;
  }

  const queue: string[] = [start];
  const backPointer = new Map<string, string | null>();
  backPointer.set(start, null);
  const visited: string[] = [];

  steps.push({
    current: null,
    visited: [],
    frontier: [start],
    queue: [...queue],
    path: [],
    label: `Initialize queue with start "${start}"`,
  });

  if (start === goal) {
    steps.push({
      current: start,
      visited: [start],
      frontier: [],
      queue: [],
      path: [start],
      label: `Start equals goal — path is just "${start}"`,
    });
    return steps;
  }

  let goalReached = false;
  while (queue.length > 0 && !goalReached) {
    const vertex = queue.shift()!;
    visited.push(vertex);

    if (vertex === goal) {
      goalReached = true;
      break;
    }

    const neighbors = graph[vertex] ?? [];
    const newlyDiscovered: string[] = [];
    for (const adj of neighbors) {
      if (!backPointer.has(adj)) {
        backPointer.set(adj, vertex);
        queue.push(adj);
        newlyDiscovered.push(adj);
      }
    }

    steps.push({
      current: vertex,
      visited: [...visited],
      frontier: [...queue],
      queue: [...queue],
      path: [],
      label:
        newlyDiscovered.length > 0
          ? `Visit "${vertex}" → discover ${newlyDiscovered.map((n) => `"${n}"`).join(", ")}`
          : `Visit "${vertex}" → no new neighbors`,
    });
  }

  if (!goalReached) {
    steps.push({
      current: null,
      visited: [...visited],
      frontier: [],
      queue: [],
      path: [],
      label: `Goal "${goal}" not reachable from "${start}"`,
    });
    return steps;
  }

  const path: string[] = [];
  let cursor: string | null | undefined = goal;
  while (cursor !== null && cursor !== undefined) {
    path.unshift(cursor);
    cursor = backPointer.get(cursor) ?? null;
    if (cursor === undefined) break;
  }

  if (!visited.includes(goal)) visited.push(goal);

  steps.push({
    current: goal,
    visited: [...visited],
    frontier: [],
    queue: [],
    path,
    label: `Reached goal "${goal}" — shortest path has ${path.length} vertices`,
  });

  return steps;
}
