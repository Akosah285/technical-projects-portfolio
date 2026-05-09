import { describe, expect, it } from "vitest";
import { josephusTrace, josephusSurvivor } from "./josephusTrace";

describe("josephusSurvivor", () => {
  it("returns 1 when there is only one soldier", () => {
    expect(josephusSurvivor(1, 2)).toBe(1);
  });

  it("matches the classic textbook answer J(5, 2) = 3", () => {
    expect(josephusSurvivor(5, 2)).toBe(3);
  });

  it("matches the famous Flavius Josephus case J(41, 2) = 19", () => {
    expect(josephusSurvivor(41, 2)).toBe(19);
  });

  it("handles k = 1 — kill in straight order, last numbered survives", () => {
    expect(josephusSurvivor(7, 1)).toBe(7);
  });
});

describe("josephusTrace", () => {
  it("emits one snapshot per kill plus a final survivor snapshot", () => {
    const trace = josephusTrace(5, 2);
    const killSteps = trace.filter((s) => s.killed !== null);
    expect(killSteps.length).toBe(4);
    expect(trace[trace.length - 1].survivor).toBe(3);
  });

  it("each kill step removes exactly one soldier from alive[]", () => {
    const trace = josephusTrace(7, 3);
    let prevAlive = 7;
    for (const step of trace) {
      if (step.killed !== null) {
        expect(step.alive.length).toBe(prevAlive - 1);
        prevAlive = step.alive.length;
      }
    }
  });

  it("never kills the same soldier twice", () => {
    const trace = josephusTrace(20, 3);
    const killed = trace.filter((s) => s.killed !== null).map((s) => s.killed);
    expect(new Set(killed).size).toBe(killed.length);
  });

  it("the final survivor matches josephusSurvivor", () => {
    for (let n = 2; n <= 12; n++) {
      for (let k = 1; k <= 5; k++) {
        const trace = josephusTrace(n, k);
        const survivor = trace[trace.length - 1].survivor;
        expect(survivor).toBe(josephusSurvivor(n, k));
      }
    }
  });
});
