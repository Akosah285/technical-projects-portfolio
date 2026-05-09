import { describe, expect, it } from "vitest";
import {
  circleIntersectsRectangle,
  PointQuadtree,
  pointInCircle,
} from "./quadtree";

describe("pointInCircle", () => {
  it("includes the center", () => {
    expect(pointInCircle(5, 5, 5, 5, 3)).toBe(true);
  });

  it("includes points on the circle boundary", () => {
    expect(pointInCircle(5, 0, 0, 0, 5)).toBe(true);
  });

  it("excludes points outside the radius", () => {
    expect(pointInCircle(10, 10, 0, 0, 5)).toBe(false);
  });
});

describe("circleIntersectsRectangle", () => {
  it("intersects when circle center lies inside rectangle", () => {
    expect(circleIntersectsRectangle(50, 50, 5, 0, 0, 100, 100)).toBe(true);
  });

  it("intersects when circle clips an edge", () => {
    expect(circleIntersectsRectangle(105, 50, 10, 0, 0, 100, 100)).toBe(true);
  });

  it("does not intersect when the circle is far outside", () => {
    expect(circleIntersectsRectangle(200, 200, 10, 0, 0, 100, 100)).toBe(false);
  });
});

describe("PointQuadtree — single-node behavior", () => {
  it("a brand-new tree has size 1 and returns its anchor point", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    expect(t.size()).toBe(1);
    expect(t.allPoints()).toEqual([{ x: 50, y: 50 }]);
  });

  it("a brand-new tree has no children", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    expect(t.hasChild(1)).toBe(false);
    expect(t.hasChild(2)).toBe(false);
    expect(t.hasChild(3)).toBe(false);
    expect(t.hasChild(4)).toBe(false);
  });
});

describe("PointQuadtree — insert places points in the correct quadrant", () => {
  it("inserts upper-left into quadrant 1", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 25 });
    expect(t.hasChild(1)).toBe(true);
    expect(t.hasChild(2)).toBe(false);
    expect(t.size()).toBe(2);
  });

  it("inserts upper-right into quadrant 2", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 75, y: 25 });
    expect(t.hasChild(2)).toBe(true);
    expect(t.size()).toBe(2);
  });

  it("inserts lower-left into quadrant 3", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 75 });
    expect(t.hasChild(3)).toBe(true);
    expect(t.size()).toBe(2);
  });

  it("inserts lower-right into quadrant 4", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 75, y: 75 });
    expect(t.hasChild(4)).toBe(true);
    expect(t.size()).toBe(2);
  });

  it("ignores points exactly on a dividing line (strict inequality)", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 50, y: 25 });
    t.insert({ x: 25, y: 50 });
    expect(t.size()).toBe(1);
    expect(t.allPoints().length).toBe(1);
  });

  it("recursively descends when the same quadrant already has a child", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 25 });
    t.insert({ x: 10, y: 10 });
    expect(t.size()).toBe(3);
    const c1 = t.getChild(1)!;
    expect(c1.hasChild(1)).toBe(true);
  });

  it("each child rectangle is bounded by parent x1/y1/x2/y2 and the parent anchor", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 25 });
    expect(t.getChild(1)!.getBounds()).toEqual({ x1: 0, y1: 0, x2: 50, y2: 50 });
    t.insert({ x: 75, y: 75 });
    expect(t.getChild(4)!.getBounds()).toEqual({ x1: 50, y1: 50, x2: 100, y2: 100 });
  });
});

describe("PointQuadtree — allPoints", () => {
  it("returns every point in the tree", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 25 });
    t.insert({ x: 75, y: 25 });
    t.insert({ x: 25, y: 75 });
    t.insert({ x: 75, y: 75 });
    const xs = t.allPoints().map((p) => p.x).sort((a, b) => a - b);
    expect(xs).toEqual([25, 25, 50, 75, 75]);
  });
});

describe("PointQuadtree — findInCircle", () => {
  it("returns only points within the circle", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 60, y: 60 });
    t.insert({ x: 10, y: 10 });
    t.insert({ x: 90, y: 90 });

    const found = t.findInCircle(55, 55, 10);
    const xs = found.map((p) => p.x).sort((a, b) => a - b);
    expect(xs).toEqual([50, 60]);
  });

  it("returns an empty list when nothing is in range", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 60, y: 60 });
    expect(t.findInCircle(95, 95, 2)).toEqual([]);
  });

  it("includes a point exactly on the boundary of the search circle", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 60, y: 60 });
    // Distance from (50,50) to (60,60) is sqrt(200) ~= 14.14
    expect(t.findInCircle(50, 50, Math.sqrt(200))).toContainEqual({ x: 60, y: 60 });
  });
});

describe("PointQuadtree — walk", () => {
  it("visits every node, root first", () => {
    const t = new PointQuadtree({ x: 50, y: 50 }, 0, 0, 100, 100);
    t.insert({ x: 25, y: 25 });
    t.insert({ x: 75, y: 75 });

    const visited: Array<{ x: number; y: number }> = [];
    t.walk((node) => visited.push(node.getPoint()));
    expect(visited[0]).toEqual({ x: 50, y: 50 });
    expect(visited.length).toBe(3);
  });
});
