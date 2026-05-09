import { describe, expect, it } from "vitest";
import {
  choose,
  simulatePortia,
  simulateRich,
  PORTIA_CONSTANTS,
  RICH_CONSTANTS,
} from "./firstPrograms";

describe("choose (binomial coefficient)", () => {
  it("returns 1 when k is 0", () => {
    expect(choose(5, 0)).toBe(1);
  });

  it("returns 1 when k equals n", () => {
    expect(choose(7, 7)).toBe(1);
  });

  it("returns n choose 1 = n", () => {
    expect(choose(10, 1)).toBe(10);
  });

  it("matches Pascal's triangle for small cases", () => {
    expect(choose(5, 2)).toBe(10);
    expect(choose(6, 3)).toBe(20);
    expect(choose(8, 4)).toBe(70);
  });

  it("matches the value the original choose.py prints — choose(51, 5) = 2349060", () => {
    expect(choose(51, 5)).toBe(2349060);
  });
});

describe("simulatePortia", () => {
  it("returns one entry per year of compounding starting at year 1", () => {
    const log = simulatePortia();
    expect(log[0].year).toBe(1);
    expect(log[0].brutus).toBeCloseTo(PORTIA_CONSTANTS.brutusInitial * (1 + PORTIA_CONSTANTS.brutusRate / 100));
    expect(log[0].portia).toBeCloseTo(PORTIA_CONSTANTS.portiaInitial * (1 + PORTIA_CONSTANTS.portiaRate / 100));
  });

  it("stops at the year Brutus' balance first exceeds Portia's", () => {
    const log = simulatePortia();
    const last = log[log.length - 1];
    expect(last.brutus).toBeGreaterThan(last.portia);
    if (log.length >= 2) {
      const penultimate = log[log.length - 2];
      expect(penultimate.brutus).toBeLessThanOrEqual(penultimate.portia);
    }
  });

  it("crossover happens around year 1206 AD (Brutus' 5% beats Portia's 4% from $1 vs $100k)", () => {
    const log = simulatePortia();
    const last = log[log.length - 1];
    expect(last.year).toBeGreaterThan(1100);
    expect(last.year).toBeLessThan(1300);
  });
});

describe("simulateRich", () => {
  it("returns one entry per year up to and including the current year (2018)", () => {
    const log = simulateRich();
    expect(log[0].year).toBe(1);
    expect(log[log.length - 1].year).toBe(RICH_CONSTANTS.currentYear);
  });

  it("year-2018 balance equals 1.05^2018 (Brutus' $1 grew at 5% per year)", () => {
    const log = simulateRich();
    const last = log[log.length - 1];
    const expected = Math.pow(1 + RICH_CONSTANTS.brutusRate / 100, RICH_CONSTANTS.currentYear);
    expect(last.balance / expected).toBeCloseTo(1, 5);
  });

  it("the number of border walls Brutus could fund is balance // 2.16e10", () => {
    const log = simulateRich();
    const last = log[log.length - 1];
    const expectedWalls = Math.floor(last.balance / RICH_CONSTANTS.wallCost);
    expect(last.walls).toBe(expectedWalls);
    expect(last.walls).toBeGreaterThan(0);
  });
});
