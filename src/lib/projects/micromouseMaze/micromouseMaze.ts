/**
 * Mechatronics M05 — Right-hand wall-following micromouse on an 8×8 grid.
 *
 * Faithful re-implementation of the choose_direction / update_direction /
 * update_position state machine in decision_making.ino (ENGS 147 final
 * project, SP21).
 *
 * The robot prefers turns in this order:
 *   1) right
 *   2) forward
 *   3) left
 *   4) backward
 *
 * which is the right-hand wall-following rule. Walls are pre-mapped per
 * cell (NORTH / SOUTH / EAST / WEST booleans). The robot doesn't sense —
 * it consults the maze definition directly, just as the firmware does once
 * it has wall detections from the IR sensors.
 */

export const GRID_SIZE = 8;

export type Heading = "UP" | "RIGHT" | "DOWN" | "LEFT";
export type Action = "RIGHT" | "FORWARD" | "LEFT" | "BACKWARD";

export interface Cell {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface RobotState {
  position: Position;
  heading: Heading;
}

export interface Maze {
  cells: Cell[][];
  width: number;
  height: number;
  start: Position;
  startHeading: Heading;
  goal: Position;
}

export interface StepLog {
  step: number;
  before: RobotState;
  action: Action;
  after: RobotState;
  reachedGoal: boolean;
}

/**
 * Look up the wall the robot is facing on its right-hand side, given a
 * cell and a heading. Mirrors the inner switch in choose_direction.
 */
export function rightWall(cell: Cell, heading: Heading): boolean {
  switch (heading) {
    case "UP":
      return cell.E;
    case "RIGHT":
      return cell.S;
    case "DOWN":
      return cell.W;
    case "LEFT":
      return cell.N;
  }
}

export function forwardWall(cell: Cell, heading: Heading): boolean {
  switch (heading) {
    case "UP":
      return cell.N;
    case "RIGHT":
      return cell.E;
    case "DOWN":
      return cell.S;
    case "LEFT":
      return cell.W;
  }
}

export function leftWall(cell: Cell, heading: Heading): boolean {
  switch (heading) {
    case "UP":
      return cell.W;
    case "RIGHT":
      return cell.N;
    case "DOWN":
      return cell.E;
    case "LEFT":
      return cell.S;
  }
}

/**
 * choose_direction(). Right-hand wall follower preference:
 * right > forward > left > backward.
 */
export function chooseAction(cell: Cell, heading: Heading): Action {
  if (!rightWall(cell, heading)) return "RIGHT";
  if (!forwardWall(cell, heading)) return "FORWARD";
  if (!leftWall(cell, heading)) return "LEFT";
  return "BACKWARD";
}

/**
 * update_direction(): apply a turn to the heading. Forward leaves
 * heading unchanged.
 */
export function applyTurn(heading: Heading, action: Action): Heading {
  if (action === "FORWARD") return heading;
  const order: Heading[] = ["UP", "RIGHT", "DOWN", "LEFT"];
  const idx = order.indexOf(heading);
  if (action === "RIGHT") return order[(idx + 1) % 4];
  if (action === "LEFT") return order[(idx + 3) % 4];
  // BACKWARD
  return order[(idx + 2) % 4];
}

/**
 * update_position(): advance one cell in the (post-turn) heading.
 * Convention: x increases to the right (EAST), y increases UP, matching the
 * lab firmware's curr_position.y += 1 for UP.
 */
export function applyMove(pos: Position, heading: Heading): Position {
  switch (heading) {
    case "UP":
      return { x: pos.x, y: pos.y + 1 };
    case "DOWN":
      return { x: pos.x, y: pos.y - 1 };
    case "RIGHT":
      return { x: pos.x + 1, y: pos.y };
    case "LEFT":
      return { x: pos.x - 1, y: pos.y };
  }
}

/**
 * Take one full step: choose the action for the current cell + heading,
 * apply the turn, then move forward one cell. (In the lab firmware, every
 * choice is followed by an exit-the-cell motion regardless of which turn
 * happened — including BACKWARD.)
 */
export function step(maze: Maze, state: RobotState): {
  action: Action;
  next: RobotState;
} {
  const cell = maze.cells[state.position.x][state.position.y];
  const action = chooseAction(cell, state.heading);
  const newHeading = applyTurn(state.heading, action);
  const newPos = applyMove(state.position, newHeading);
  const clamped = clampToGrid(newPos, maze);
  return {
    action,
    next: { position: clamped, heading: newHeading },
  };
}

function clampToGrid(p: Position, maze: Maze): Position {
  return {
    x: Math.max(0, Math.min(maze.width - 1, p.x)),
    y: Math.max(0, Math.min(maze.height - 1, p.y)),
  };
}

/**
 * Run the wall-follower until the goal is reached or maxSteps elapses.
 * Returns the per-step log; goalReached is true if the goal cell was
 * entered before maxSteps.
 */
export function runMicromouse(maze: Maze, maxSteps = 200): {
  log: StepLog[];
  goalReached: boolean;
} {
  let state: RobotState = {
    position: { ...maze.start },
    heading: maze.startHeading,
  };
  const log: StepLog[] = [];
  for (let s = 0; s < maxSteps; s += 1) {
    const before = { position: { ...state.position }, heading: state.heading };
    const { action, next } = step(maze, state);
    state = next;
    const reachedGoal =
      state.position.x === maze.goal.x && state.position.y === maze.goal.y;
    log.push({ step: s, before, action, after: state, reachedGoal });
    if (reachedGoal) {
      return { log, goalReached: true };
    }
  }
  return { log, goalReached: false };
}

/* ------------------------------------------------------------------ */
/* Preset mazes                                                        */
/* ------------------------------------------------------------------ */

/**
 * Build an empty grid (all walls present on the perimeter, no internal walls).
 */
export function emptyMaze(): Cell[][] {
  const grid: Cell[][] = [];
  for (let x = 0; x < GRID_SIZE; x += 1) {
    const col: Cell[] = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      col.push({
        N: y === GRID_SIZE - 1,
        S: y === 0,
        E: x === GRID_SIZE - 1,
        W: x === 0,
      });
    }
    grid.push(col);
  }
  return grid;
}

/**
 * Add a wall between two adjacent cells (sets both sides for consistency).
 */
export function addWallBetween(
  cells: Cell[][],
  ax: number,
  ay: number,
  bx: number,
  by: number,
): void {
  if (bx === ax + 1 && by === ay) {
    cells[ax][ay].E = true;
    cells[bx][by].W = true;
  } else if (bx === ax - 1 && by === ay) {
    cells[ax][ay].W = true;
    cells[bx][by].E = true;
  } else if (bx === ax && by === ay + 1) {
    cells[ax][ay].N = true;
    cells[bx][by].S = true;
  } else if (bx === ax && by === ay - 1) {
    cells[ax][ay].S = true;
    cells[bx][by].N = true;
  }
}

/**
 * Open maze: only the perimeter walls. Useful as a baseline — the right-hand
 * follower will hug the south wall going east, then the east wall going up.
 */
export function openMaze(): Maze {
  return {
    cells: emptyMaze(),
    width: GRID_SIZE,
    height: GRID_SIZE,
    start: { x: 0, y: 0 },
    startHeading: "UP",
    goal: { x: 7, y: 7 },
  };
}

/**
 * A simple corridor maze — narrow zig-zag from (0,0) to (7,7) along the
 * south then east edges, with internal walls forcing the robot through.
 */
export function corridorMaze(): Maze {
  const c = emptyMaze();
  // Wall off everything above row 0 except the rightmost column,
  // forming an L-shape corridor.
  for (let x = 0; x < GRID_SIZE - 1; x += 1) {
    addWallBetween(c, x, 0, x, 1);
  }
  return {
    cells: c,
    width: GRID_SIZE,
    height: GRID_SIZE,
    start: { x: 0, y: 0 },
    startHeading: "RIGHT",
    goal: { x: 7, y: 7 },
  };
}

/**
 * A small loop maze: walls split the grid into an outer ring and inner
 * 4×4 square, with a single opening into the inner area. The right-hand
 * follower will trace the outer ring all the way around, never entering
 * the inner square — a famous failure mode of the rule.
 */
export function ringMaze(): Maze {
  const c = emptyMaze();
  // Inner 4×4 box from (2,2) to (5,5)
  for (let x = 2; x <= 5; x += 1) {
    addWallBetween(c, x, 1, x, 2); // bottom edge
    addWallBetween(c, x, 5, x, 6); // top edge
  }
  for (let y = 2; y <= 5; y += 1) {
    addWallBetween(c, 1, y, 2, y); // left edge
    addWallBetween(c, 5, y, 6, y); // right edge
  }
  return {
    cells: c,
    width: GRID_SIZE,
    height: GRID_SIZE,
    start: { x: 0, y: 0 },
    startHeading: "RIGHT",
    goal: { x: 4, y: 4 },
  };
}
