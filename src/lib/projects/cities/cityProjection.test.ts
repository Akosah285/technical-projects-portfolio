import { describe, it, expect } from "vitest";
import { lonLatToXY } from "./cityProjection";

describe("lonLatToXY", () => {
  it("maps the prime meridian and equator to the center of the canvas", () => {
    const { x, y } = lonLatToXY({ lon: 0, lat: 0, width: 720, height: 360 });
    expect(x).toBeCloseTo(360);
    expect(y).toBeCloseTo(180);
  });

  it("maps lon = -180 to x = 0 (left edge)", () => {
    const { x } = lonLatToXY({ lon: -180, lat: 0, width: 720, height: 360 });
    expect(x).toBeCloseTo(0);
  });

  it("maps lon = 180 to x = width (right edge)", () => {
    const { x } = lonLatToXY({ lon: 180, lat: 0, width: 720, height: 360 });
    expect(x).toBeCloseTo(720);
  });

  it("maps lat = 90 (north pole) to y = 0 (top edge)", () => {
    const { y } = lonLatToXY({ lon: 0, lat: 90, width: 720, height: 360 });
    expect(y).toBeCloseTo(0);
  });

  it("maps lat = -90 (south pole) to y = height (bottom edge)", () => {
    const { y } = lonLatToXY({ lon: 0, lat: -90, width: 720, height: 360 });
    expect(y).toBeCloseTo(360);
  });

  it("scales to arbitrary canvas dimensions", () => {
    const { x, y } = lonLatToXY({
      lon: 90,
      lat: 45,
      width: 1000,
      height: 500,
    });
    expect(x).toBeCloseTo(750);
    expect(y).toBeCloseTo(125);
  });
});
