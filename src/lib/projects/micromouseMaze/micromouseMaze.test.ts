import { describe, expect, it } from "vitest";
import {
  GRID_SIZE,
  applyMove,
  applyTurn,
  chooseAction,
  corridorMaze,
  emptyMaze,
  forwardWall,
  leftWall,
  openMaze,
  rightWall,
  ringMaze,
  runMicromouse,
  step,
} from "./micromouseMaze";

describe("rightWall / forwardWall / leftWall", () => {
  const open = { N: false, S: false, E: false, W: false };
  const allWalled = { N: true, S: true, E: true, W: true };

  it("UP heading: right=E, forward=N, left=W", () => {
    const c = { ...open, E: true, N: false, W: false };
    expect(rightWall(c, "UP")).toBe(true);
    expect(forwardWall(c, "UP")).toBe(false);
    expect(leftWall(c, "UP")).toBe(false);
  });

  it("RIGHT heading: right=S, forward=E, left=N", () => {
    const c = { ...open, S: true, E: false, N: false };
    expect(rightWall(c, "RIGHT")).toBe(true);
    expect(forwardWall(c, "RIGHT")).toBe(false);
    expect(leftWall(c, "RIGHT")).toBe(false);
  });

  it("DOWN heading: right=W, forward=S, left=E", () => {
    const c = { ...open, W: true, S: false, E: false };
    expect(rightWall(c, "DOWN")).toBe(true);
    expect(forwardWall(c, "DOWN")).toBe(false);
    expect(leftWall(c, "DOWN")).toBe(false);
  });

  it("LEFT heading: right=N, forward=W, left=S", () => {
    const c = { ...open, N: true, W: false, S: false };
    expect(rightWall(c, "LEFT")).toBe(true);
    expect(forwardWall(c, "LEFT")).toBe(false);
    expect(leftWall(c, "LEFT")).toBe(false);
  });

  it("all walls are visible from any heading", () => {
    for (const h of ["UP", "RIGHT", "DOWN", "LEFT"] as const) {
      expect(rightWall(allWalled, h)).toBe(true);
      expect(forwardWall(allWalled, h)).toBe(true);
      expect(leftWall(allWalled, h)).toBe(true);
    }
  });
});

describe("chooseAction (right-hand rule)", () => {
  it("turns right when right is open", () => {
    const c = { N: true, S: true, E: false, W: true };
    expect(chooseAction(c, "UP")).toBe("RIGHT");
  });

  it("goes forward when right is blocked but forward open", () => {
    const c = { N: false, S: true, E: true, W: true };
    expect(chooseAction(c, "UP")).toBe("FORWARD");
  });

  it("turns left when right and forward both blocked", () => {
    const c = { N: true, S: true, E: true, W: false };
    expect(chooseAction(c, "UP")).toBe("LEFT");
  });

  it("turns backward when totally walled in", () => {
    const c = { N: true, S: true, E: true, W: true };
    expect(chooseAction(c, "UP")).toBe("BACKWARD");
  });

  it("right preference fires even if forward is also open", () => {
    const c = { N: false, S: true, E: false, W: false };
    // UP heading: E open (right), N open (forward), W open (left) — pick RIGHT
    expect(chooseAction(c, "UP")).toBe("RIGHT");
  });
});

describe("applyTurn", () => {
  it("RIGHT cycles UP→RIGHT→DOWN→LEFT→UP", () => {
    expect(applyTurn("UP", "RIGHT")).toBe("RIGHT");
    expect(applyTurn("RIGHT", "RIGHT")).toBe("DOWN");
    expect(applyTurn("DOWN", "RIGHT")).toBe("LEFT");
    expect(applyTurn("LEFT", "RIGHT")).toBe("UP");
  });

  it("LEFT cycles UP→LEFT→DOWN→RIGHT→UP", () => {
    expect(applyTurn("UP", "LEFT")).toBe("LEFT");
    expect(applyTurn("LEFT", "LEFT")).toBe("DOWN");
    expect(applyTurn("DOWN", "LEFT")).toBe("RIGHT");
    expect(applyTurn("RIGHT", "LEFT")).toBe("UP");
  });

  it("BACKWARD flips heading 180°", () => {
    expect(applyTurn("UP", "BACKWARD")).toBe("DOWN");
    expect(applyTurn("DOWN", "BACKWARD")).toBe("UP");
    expect(applyTurn("LEFT", "BACKWARD")).toBe("RIGHT");
    expect(applyTurn("RIGHT", "BACKWARD")).toBe("LEFT");
  });

  it("FORWARD does not rotate", () => {
    expect(applyTurn("UP", "FORWARD")).toBe("UP");
    expect(applyTurn("RIGHT", "FORWARD")).toBe("RIGHT");
  });
});

describe("applyMove", () => {
  it("moves +y for UP, -y for DOWN, +x for RIGHT, -x for LEFT", () => {
    const p = { x: 3, y: 4 };
    expect(applyMove(p, "UP")).toEqual({ x: 3, y: 5 });
    expect(applyMove(p, "DOWN")).toEqual({ x: 3, y: 3 });
    expect(applyMove(p, "RIGHT")).toEqual({ x: 4, y: 4 });
    expect(applyMove(p, "LEFT")).toEqual({ x: 2, y: 4 });
  });
});

describe("step", () => {
  it("turns then moves: in an open cell facing UP, turns RIGHT and moves east", () => {
    const maze = openMaze();
    // At (0,0) facing UP, walls: S (perimeter), W (perimeter); right (E) open.
    const result = step(maze, { position: { x: 0, y: 0 }, heading: "UP" });
    expect(result.action).toBe("RIGHT");
    expect(result.next.heading).toBe("RIGHT");
    expect(result.next.position).toEqual({ x: 1, y: 0 });
  });

  it("clamps to grid (cannot leave the maze)", () => {
    // Build a corner cell with all walls so the only legal move is BACKWARD,
    // then check we stay inside the grid.
    const c = emptyMaze();
    // (0,0) only opening is to the east
    c[0][0].N = true; // close north, perimeter already closes S and W
    const maze = {
      cells: c,
      width: GRID_SIZE,
      height: GRID_SIZE,
      start: { x: 0, y: 0 },
      startHeading: "UP" as const,
      goal: { x: 7, y: 7 },
    };
    // Facing UP at (0,0): right=E (open), so turns RIGHT and goes east
    const r = step(maze, { position: { x: 0, y: 0 }, heading: "UP" });
    expect(r.next.position.x).toBeGreaterThanOrEqual(0);
    expect(r.next.position.x).toBeLessThan(GRID_SIZE);
  });
});

describe("runMicromouse", () => {
  it("openMaze: right-hand follower reaches the goal at (7,7)", () => {
    const result = runMicromouse(openMaze(), 200);
    expect(result.goalReached).toBe(true);
    const last = result.log[result.log.length - 1];
    expect(last.after.position).toEqual({ x: 7, y: 7 });
  });

  it("corridorMaze: reaches the goal", () => {
    const result = runMicromouse(corridorMaze(), 200);
    expect(result.goalReached).toBe(true);
  });

  it("ringMaze: classic right-hand failure — never enters the inner ring", () => {
    const result = runMicromouse(ringMaze(), 200);
    // The inner ring is at x in [2..5], y in [2..5]; right-hand follower
    // should never enter it from (0,0) start because it hugs the outer wall.
    for (const entry of result.log) {
      const p = entry.after.position;
      const insideInner =
        p.x >= 2 && p.x <= 5 && p.y >= 2 && p.y <= 5;
      expect(insideInner).toBe(false);
    }
    expect(result.goalReached).toBe(false);
  });

  it("logs include a sensible action sequence (no NaN)", () => {
    const result = runMicromouse(openMaze(), 200);
    for (const entry of result.log) {
      expect(["RIGHT", "FORWARD", "LEFT", "BACKWARD"]).toContain(entry.action);
      expect(Number.isFinite(entry.after.position.x)).toBe(true);
      expect(Number.isFinite(entry.after.position.y)).toBe(true);
    }
  });

  it("respects maxSteps even if goal never reached", () => {
    const result = runMicromouse(ringMaze(), 50);
    expect(result.log.length).toBeLessThanOrEqual(50);
  });
});

describe("emptyMaze", () => {
  it("creates an 8×8 grid with perimeter walls only", () => {
    const c = emptyMaze();
    expect(c.length).toBe(GRID_SIZE);
    expect(c[0].length).toBe(GRID_SIZE);

    // Corner (0,0): S + W walls present
    expect(c[0][0].S).toBe(true);
    expect(c[0][0].W).toBe(true);
    expect(c[0][0].N).toBe(false);
    expect(c[0][0].E).toBe(false);

    // Corner (7,7): N + E walls
    expect(c[7][7].N).toBe(true);
    expect(c[7][7].E).toBe(true);
    expect(c[7][7].S).toBe(false);
    expect(c[7][7].W).toBe(false);
  });
});
