export type LifeGrid = boolean[][];

export function emptyGrid(rows: number, cols: number): LifeGrid {
  const g: LifeGrid = [];
  for (let r = 0; r < rows; r++) {
    g.push(new Array(cols).fill(false));
  }
  return g;
}

export function countLivingNeighbors(g: LifeGrid, row: number, col: number): number {
  const rows = g.length;
  if (rows === 0) return 0;
  const cols = g[0].length;
  let n = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = (row + dr + rows) % rows;
      const c = (col + dc + cols) % cols;
      if (g[r][c]) n++;
    }
  }
  return n;
}

export function nextGeneration(g: LifeGrid): LifeGrid {
  const rows = g.length;
  if (rows === 0) return [];
  const cols = g[0].length;
  const next = emptyGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = countLivingNeighbors(g, r, c);
      if (n === 3) {
        next[r][c] = true;
      } else if (n === 2) {
        next[r][c] = g[r][c];
      } else {
        next[r][c] = false;
      }
    }
  }
  return next;
}

export interface LifePattern {
  cells: Array<[number, number]>;
  description: string;
}

export const PATTERNS: Record<string, LifePattern> = {
  glider: {
    description: "Glider — 5-cell ship that translates diagonally every 4 generations.",
    cells: [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  },
  blinker: {
    description: "Blinker — period-2 oscillator that flips between horizontal and vertical.",
    cells: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  },
  pulsar: {
    description: "Pulsar — 48-cell period-3 oscillator.",
    cells: [
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [2, 0], [2, 5], [2, 7], [2, 12],
      [3, 0], [3, 5], [3, 7], [3, 12],
      [4, 0], [4, 5], [4, 7], [4, 12],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
      [8, 0], [8, 5], [8, 7], [8, 12],
      [9, 0], [9, 5], [9, 7], [9, 12],
      [10, 0], [10, 5], [10, 7], [10, 12],
      [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10],
    ],
  },
  rPentomino: {
    description: "R-pentomino — small chaotic seed that explodes for 1103 generations before stabilizing.",
    cells: [
      [0, 1], [0, 2],
      [1, 0], [1, 1],
      [2, 1],
    ],
  },
};

export function placePattern(grid: LifeGrid, pattern: LifePattern, anchorRow: number, anchorCol: number): LifeGrid {
  const next = grid.map((r) => [...r]);
  const rows = next.length;
  if (rows === 0) return next;
  const cols = next[0].length;
  for (const [dr, dc] of pattern.cells) {
    const r = anchorRow + dr;
    const c = anchorCol + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) next[r][c] = true;
  }
  return next;
}
