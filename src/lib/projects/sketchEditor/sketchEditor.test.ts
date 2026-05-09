import { describe, it, expect, beforeEach } from "vitest";
import {
  Sketch,
  contains,
  createShape,
  moveBy,
  pointToSegmentDistance,
  resetIdCounter,
  setColor,
  setCorners,
} from "./sketchEditor";

beforeEach(() => resetIdCounter(1));

describe("createShape", () => {
  it("starts every shape as a zero-extent point at (x, y)", () => {
    const e = createShape("ellipse", 10, 20, "#f00");
    expect(e).toMatchObject({ x1: 10, y1: 20, x2: 10, y2: 20, color: "#f00" });
  });

  it("assigns sequential ids", () => {
    const a = createShape("ellipse", 0, 0, "#000");
    const b = createShape("rectangle", 0, 0, "#000");
    expect(b.id).toBe(a.id + 1);
  });
});

describe("setCorners", () => {
  it("normalises ellipse corners so x1<=x2 and y1<=y2", () => {
    const e = setCorners(createShape("ellipse", 0, 0, "#000"), 50, 60, 10, 20);
    expect(e).toMatchObject({ x1: 10, y1: 20, x2: 50, y2: 60 });
  });

  it("normalises rectangle corners", () => {
    const r = setCorners(createShape("rectangle", 0, 0, "#000"), 50, 0, 10, 30);
    expect(r).toMatchObject({ x1: 10, y1: 0, x2: 50, y2: 30 });
  });

  it("preserves segment endpoint order (so direction stays)", () => {
    const s = setCorners(createShape("segment", 0, 0, "#000"), 50, 60, 10, 20);
    expect(s).toMatchObject({ x1: 50, y1: 60, x2: 10, y2: 20 });
  });
});

describe("contains (hit-testing)", () => {
  it("rectangle uses bounding-box test", () => {
    const r = setCorners(createShape("rectangle", 0, 0, "#000"), 10, 10, 50, 30);
    expect(contains(r, 30, 20)).toBe(true);
    expect(contains(r, 5, 20)).toBe(false);
    expect(contains(r, 60, 20)).toBe(false);
  });

  it("ellipse uses (x/a)^2 + (y/b)^2 <= 1", () => {
    const e = setCorners(createShape("ellipse", 0, 0, "#000"), 0, 0, 100, 50);
    // Centre is (50, 25); a=50, b=25
    expect(contains(e, 50, 25)).toBe(true);
    expect(contains(e, 50, 50)).toBe(true); // on boundary
    expect(contains(e, 0, 50)).toBe(false); // outside
  });

  it("segment requires the click within 3 px of the line", () => {
    const s = setCorners(createShape("segment", 0, 0, "#000"), 0, 0, 100, 0);
    expect(contains(s, 50, 0)).toBe(true);
    expect(contains(s, 50, 2)).toBe(true);
    expect(contains(s, 50, 5)).toBe(false);
  });

  it("zero-length segment falls back to point distance", () => {
    const s = setCorners(createShape("segment", 0, 0, "#000"), 50, 50, 50, 50);
    expect(contains(s, 50, 50)).toBe(true);
    expect(contains(s, 60, 60)).toBe(false);
  });
});

describe("pointToSegmentDistance", () => {
  it("clamps the projection so endpoints win for points beyond the segment", () => {
    expect(pointToSegmentDistance(-10, 0, 0, 0, 100, 0)).toBe(10);
    expect(pointToSegmentDistance(110, 0, 0, 0, 100, 0)).toBe(10);
  });
});

describe("moveBy / setColor", () => {
  it("translates every coordinate", () => {
    const r = setCorners(createShape("rectangle", 0, 0, "#000"), 10, 10, 30, 30);
    const moved = moveBy(r, 5, -2);
    expect(moved).toMatchObject({ x1: 15, y1: 8, x2: 35, y2: 28 });
  });

  it("setColor returns a new shape with the new color", () => {
    const r = createShape("rectangle", 0, 0, "#abc");
    const recoloured = setColor(r, "#def");
    expect(recoloured.color).toBe("#def");
    expect(r.color).toBe("#abc"); // unchanged
  });
});

describe("Sketch", () => {
  it("starts empty", () => {
    expect(new Sketch().size()).toBe(0);
  });

  it("preserves insertion order when shapes are added", () => {
    const s = new Sketch()
      .add(createShape("rectangle", 0, 0, "#a"))
      .add(createShape("ellipse", 0, 0, "#b"));
    expect(s.shapes.map((x) => x.type)).toEqual(["rectangle", "ellipse"]);
  });

  it("topMost picks the most-recently-added shape under the cursor", () => {
    const back = setCorners(createShape("rectangle", 0, 0, "#a"), 0, 0, 100, 100);
    const front = setCorners(createShape("ellipse", 0, 0, "#b"), 20, 20, 80, 80);
    const s = new Sketch().add(back).add(front);
    expect(s.topMost(50, 50)?.type).toBe("ellipse");
  });

  it("topMost returns undefined when nothing is hit", () => {
    const r = setCorners(createShape("rectangle", 0, 0, "#a"), 0, 0, 10, 10);
    expect(new Sketch().add(r).topMost(50, 50)).toBeUndefined();
  });

  it("removeById removes only the matching shape", () => {
    const a = createShape("rectangle", 0, 0, "#a");
    const b = createShape("rectangle", 0, 0, "#b");
    const s = new Sketch().add(a).add(b);
    expect(s.removeById(a.id).shapes).toEqual([b]);
  });

  it("updateById applies the update only to the matching shape", () => {
    const a = setCorners(createShape("rectangle", 0, 0, "#a"), 0, 0, 10, 10);
    const b = setCorners(createShape("rectangle", 0, 0, "#b"), 20, 20, 40, 40);
    const s = new Sketch().add(a).add(b);
    const moved = s.updateById(a.id, (sh) => moveBy(sh, 100, 100));
    expect(moved.shapes[0]).toMatchObject({ x1: 100, y1: 100 });
    expect(moved.shapes[1]).toMatchObject({ x1: 20, y1: 20 });
  });
});
