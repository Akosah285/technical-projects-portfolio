/**
 * Single-client sketch editor — faithful TypeScript port of the PS_6 Java
 * editor (COSC 10, WI19), without the networking layer.
 *
 * The Java solution had Editor + EditorCommunicator + SketchServer +
 * SketchServerCommunicator wiring together a multi-client whiteboard.
 * Stripped of the network, the core stays: a list of shapes, a tool palette,
 * and four interaction modes (DRAW / MOVE / RECOLOR / DELETE).
 *
 * Each shape implements:
 *   - `contains(x, y)` — hit-test for picking
 *   - `moveBy(dx, dy)` — drag translation
 *   - `setCorners(x1, y1, x2, y2)` — re-anchor while drawing
 *   - `setColor(color)` — recolor in place
 *
 * Shapes are stored in a render-order array; later items draw on top, so
 * `topMost` walks the array from the back to find the topmost hit.
 */

export type ShapeType = "ellipse" | "rectangle" | "segment";

export interface BaseShape {
  id: number;
  type: ShapeType;
  color: string;
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
  /** upper-left corner */
  x1: number;
  y1: number;
  /** lower-right corner */
  x2: number;
  y2: number;
}

export interface RectangleShape extends BaseShape {
  type: "rectangle";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SegmentShape extends BaseShape {
  type: "segment";
  /** start endpoint */
  x1: number;
  y1: number;
  /** end endpoint */
  x2: number;
  y2: number;
}

export type Shape = EllipseShape | RectangleShape | SegmentShape;

let nextId = 1;
function allocId() {
  return nextId++;
}

/** Mostly for tests — make ids deterministic. */
export function resetIdCounter(seed = 1) {
  nextId = seed;
}

export function createShape(
  type: ShapeType,
  x: number,
  y: number,
  color: string,
): Shape {
  switch (type) {
    case "ellipse":
      return { id: allocId(), type, color, x1: x, y1: y, x2: x, y2: y };
    case "rectangle":
      return { id: allocId(), type, color, x1: x, y1: y, x2: x, y2: y };
    case "segment":
      return { id: allocId(), type, color, x1: x, y1: y, x2: x, y2: y };
  }
}

/**
 * Re-anchors a shape's defining corners.
 *
 * Ellipses and rectangles normalise so x1<=x2 and y1<=y2. Segments preserve
 * direction so endpoints are kept literally.
 */
export function setCorners(shape: Shape, x1: number, y1: number, x2: number, y2: number): Shape {
  if (shape.type === "segment") {
    return { ...shape, x1, y1, x2, y2 };
  }
  return {
    ...shape,
    x1: Math.min(x1, x2),
    y1: Math.min(y1, y2),
    x2: Math.max(x1, x2),
    y2: Math.max(y1, y2),
  };
}

export function moveBy(shape: Shape, dx: number, dy: number): Shape {
  return {
    ...shape,
    x1: shape.x1 + dx,
    y1: shape.y1 + dy,
    x2: shape.x2 + dx,
    y2: shape.y2 + dy,
  };
}

export function setColor(shape: Shape, color: string): Shape {
  return { ...shape, color };
}

/**
 * Pixel-level hit-test for picking. Mirrors the Java contains() per shape:
 *  - rectangle: bounding-box check
 *  - ellipse: standard (x/a)^2 + (y/b)^2 <= 1
 *  - segment: distance from point to segment <= 3
 */
export function contains(shape: Shape, x: number, y: number): boolean {
  switch (shape.type) {
    case "rectangle": {
      return x >= shape.x1 && x <= shape.x2 && y >= shape.y1 && y <= shape.y2;
    }
    case "ellipse": {
      const a = (shape.x2 - shape.x1) / 2;
      const b = (shape.y2 - shape.y1) / 2;
      if (a === 0 || b === 0) {
        return x === shape.x1 && y === shape.y1;
      }
      const dx = x - (shape.x1 + a);
      const dy = y - (shape.y1 + b);
      return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1;
    }
    case "segment": {
      return pointToSegmentDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2) <= 3;
    }
  }
}

export function pointToSegmentDistance(
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(x - x1, y - y1);
  let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * (x2 - x1);
  const py = y1 + t * (y2 - y1);
  return Math.hypot(x - px, y - py);
}

/**
 * Sketch — append-only ordered list of shapes plus a few mutators.
 *
 * Operations return a new Sketch; callers can keep a stack of past sketches
 * for undo (the Java original did not support undo, but the immutable shape
 * here makes it trivial for the demo).
 */
export class Sketch {
  readonly shapes: ReadonlyArray<Shape>;

  constructor(shapes: ReadonlyArray<Shape> = []) {
    this.shapes = shapes;
  }

  add(shape: Shape): Sketch {
    return new Sketch([...this.shapes, shape]);
  }

  /** Topmost shape at (x, y), or undefined if none. */
  topMost(x: number, y: number): Shape | undefined {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (contains(this.shapes[i], x, y)) return this.shapes[i];
    }
    return undefined;
  }

  removeById(id: number): Sketch {
    return new Sketch(this.shapes.filter((s) => s.id !== id));
  }

  updateById(id: number, update: (shape: Shape) => Shape): Sketch {
    return new Sketch(this.shapes.map((s) => (s.id === id ? update(s) : s)));
  }

  size(): number {
    return this.shapes.length;
  }
}
