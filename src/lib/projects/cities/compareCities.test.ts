import { describe, it, expect } from "vitest";
import {
  compareLexically,
  comparePopulation,
  compareLatitude,
  type City,
} from "./compareCities";

const A: City = { name: "Alpha", population: 100, latitude: 10, longitude: 20 };
const B: City = { name: "beta", population: 200, latitude: 5, longitude: 30 };

describe("compareLexically", () => {
  it("compares case-insensitively, mirroring str.lower in the FA18 source", () => {
    expect(compareLexically(A, B)).toBe(true);
    expect(compareLexically(B, A)).toBe(false);
  });

  it("returns false for identical names", () => {
    const x: City = { ...A, name: "Lima" };
    const y: City = { ...A, name: "lima" };
    expect(compareLexically(x, y)).toBe(false);
  });
});

describe("comparePopulation", () => {
  it("orders larger populations first (>= matches the FA18 source)", () => {
    expect(comparePopulation(B, A)).toBe(true);
    expect(comparePopulation(A, B)).toBe(false);
  });

  it("returns true for equal populations (>= comparison)", () => {
    expect(comparePopulation(A, { ...A, name: "Other" })).toBe(true);
  });
});

describe("compareLatitude", () => {
  it("orders smaller latitudes first (<= matches the FA18 source)", () => {
    expect(compareLatitude(B, A)).toBe(true);
    expect(compareLatitude(A, B)).toBe(false);
  });
});
