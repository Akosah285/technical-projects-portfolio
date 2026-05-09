/**
 * Geometry helpers — faithful TypeScript port of Geometry.java from
 * Dartmouth COSC 10 (Winter 2019) PS_2.
 */

export function pointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  cr: number,
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= cr * cr;
}

export function circleIntersectsRectangle(
  cx: number,
  cy: number,
  cr: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
  const closestX = Math.min(Math.max(cx, x1), x2);
  const closestY = Math.min(Math.max(cy, y1), y2);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

/**
 * Point quadtree — port of PointQuadtree.java from PS_2. Each node anchors a
 * single point at (point.x, point.y). The four children partition the rectangle
 * around that anchor:
 *
 *   1: upper-left   (x < anchor.x, y < anchor.y)
 *   2: upper-right  (x > anchor.x, y < anchor.y)
 *   3: lower-left   (x < anchor.x, y > anchor.y)
 *   4: lower-right  (x > anchor.x, y > anchor.y)
 *
 * Points exactly on a dividing line are not inserted (matches the original
 * behavior, which uses strict inequalities).
 */
export interface QuadPoint {
  x: number;
  y: number;
}

export class PointQuadtree<P extends QuadPoint> {
  private c1: PointQuadtree<P> | null = null;
  private c2: PointQuadtree<P> | null = null;
  private c3: PointQuadtree<P> | null = null;
  private c4: PointQuadtree<P> | null = null;

  constructor(
    private readonly point: P,
    private readonly x1: number,
    private readonly y1: number,
    private readonly x2: number,
    private readonly y2: number,
  ) {}

  getPoint(): P {
    return this.point;
  }

  getBounds(): { x1: number; y1: number; x2: number; y2: number } {
    return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 };
  }

  getChild(quadrant: 1 | 2 | 3 | 4): PointQuadtree<P> | null {
    if (quadrant === 1) return this.c1;
    if (quadrant === 2) return this.c2;
    if (quadrant === 3) return this.c3;
    return this.c4;
  }

  hasChild(quadrant: 1 | 2 | 3 | 4): boolean {
    return this.getChild(quadrant) !== null;
  }

  /**
   * Insert a point. Points on a dividing line (x == anchor.x or y == anchor.y)
   * are silently ignored, matching the Java original's strict-inequality logic.
   */
  insert(p: P): void {
    if (p.x < this.point.x && p.y < this.point.y) {
      if (this.c1) this.c1.insert(p);
      else this.c1 = new PointQuadtree(p, this.x1, this.y1, this.point.x, this.point.y);
    } else if (p.x > this.point.x && p.y < this.point.y) {
      if (this.c2) this.c2.insert(p);
      else this.c2 = new PointQuadtree(p, this.point.x, this.y1, this.x2, this.point.y);
    } else if (p.x < this.point.x && p.y > this.point.y) {
      if (this.c3) this.c3.insert(p);
      else this.c3 = new PointQuadtree(p, this.x1, this.point.y, this.point.x, this.y2);
    } else if (p.x > this.point.x && p.y > this.point.y) {
      if (this.c4) this.c4.insert(p);
      else this.c4 = new PointQuadtree(p, this.point.x, this.point.y, this.x2, this.y2);
    }
  }

  size(): number {
    let n = 1;
    if (this.c1) n += this.c1.size();
    if (this.c2) n += this.c2.size();
    if (this.c3) n += this.c3.size();
    if (this.c4) n += this.c4.size();
    return n;
  }

  allPoints(): P[] {
    const acc: P[] = [];
    this.collect(acc);
    return acc;
  }

  private collect(acc: P[]): void {
    acc.push(this.point);
    if (this.c1) this.c1.collect(acc);
    if (this.c2) this.c2.collect(acc);
    if (this.c3) this.c3.collect(acc);
    if (this.c4) this.c4.collect(acc);
  }

  findInCircle(cx: number, cy: number, cr: number): P[] {
    const acc: P[] = [];
    this.findInCircleHelper(acc, cx, cy, cr);
    return acc;
  }

  private findInCircleHelper(acc: P[], cx: number, cy: number, cr: number): void {
    if (!circleIntersectsRectangle(cx, cy, cr, this.x1, this.y1, this.x2, this.y2)) return;
    if (pointInCircle(this.point.x, this.point.y, cx, cy, cr)) acc.push(this.point);
    if (this.c1) this.c1.findInCircleHelper(acc, cx, cy, cr);
    if (this.c2) this.c2.findInCircleHelper(acc, cx, cy, cr);
    if (this.c3) this.c3.findInCircleHelper(acc, cx, cy, cr);
    if (this.c4) this.c4.findInCircleHelper(acc, cx, cy, cr);
  }

  /**
   * Walk every node in the tree (root first), invoking the visitor with the
   * node so callers can read its anchor and bounds. Used by the player UI to
   * draw the rectangle subdivisions.
   */
  walk(visitor: (node: PointQuadtree<P>) => void): void {
    visitor(this);
    if (this.c1) this.c1.walk(visitor);
    if (this.c2) this.c2.walk(visitor);
    if (this.c3) this.c3.walk(visitor);
    if (this.c4) this.c4.walk(visitor);
  }
}
