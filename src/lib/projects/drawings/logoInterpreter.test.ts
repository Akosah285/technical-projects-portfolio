import { describe, expect, it } from "vitest";
import { runLogoProgram } from "./logoInterpreter";

describe("runLogoProgram", () => {
  it("returns no segments for an empty program", () => {
    expect(runLogoProgram("").segments.length).toBe(0);
  });

  it("FORWARD 100 draws a single segment from origin straight up", () => {
    const r = runLogoProgram("FORWARD 100");
    expect(r.segments.length).toBe(1);
    expect(r.segments[0].x1).toBeCloseTo(0);
    expect(r.segments[0].y1).toBeCloseTo(0);
    expect(r.segments[0].x2).toBeCloseTo(0);
    expect(r.segments[0].y2).toBeCloseTo(-100);
  });

  it("RIGHT 90 then FORWARD 50 draws horizontally to the east", () => {
    const r = runLogoProgram("RIGHT 90 FORWARD 50");
    expect(r.segments.length).toBe(1);
    expect(r.segments[0].x2).toBeCloseTo(50);
    expect(r.segments[0].y2).toBeCloseTo(0);
  });

  it("LEFT 90 then FORWARD 50 draws horizontally to the west", () => {
    const r = runLogoProgram("LEFT 90 FORWARD 50");
    expect(r.segments[0].x2).toBeCloseTo(-50);
    expect(r.segments[0].y2).toBeCloseTo(0);
  });

  it("REPEAT 4 [ FORWARD 50 RIGHT 90 ] draws a closed square (4 segments back to origin)", () => {
    const r = runLogoProgram("REPEAT 4 [ FORWARD 50 RIGHT 90 ]");
    expect(r.segments.length).toBe(4);
    const last = r.segments[r.segments.length - 1];
    expect(last.x2).toBeCloseTo(0, 3);
    expect(last.y2).toBeCloseTo(0, 3);
  });

  it("PENUP suspends drawing — FORWARD still moves but emits no segment", () => {
    const r = runLogoProgram("PENUP FORWARD 100 PENDOWN FORWARD 50");
    expect(r.segments.length).toBe(1);
    expect(r.segments[0].y1).toBeCloseTo(-100);
    expect(r.segments[0].y2).toBeCloseTo(-150);
  });

  it("supports the short aliases FD, RT, LT, PU, PD", () => {
    const r = runLogoProgram("FD 50 RT 90 FD 50 LT 90 FD 50");
    expect(r.segments.length).toBe(3);
  });

  it("HOME resets position and heading", () => {
    const r = runLogoProgram("FORWARD 50 RIGHT 45 FORWARD 50 HOME FORWARD 30");
    const last = r.segments[r.segments.length - 1];
    expect(last.x1).toBeCloseTo(0);
    expect(last.y1).toBeCloseTo(0);
    expect(last.x2).toBeCloseTo(0);
    expect(last.y2).toBeCloseTo(-30);
  });

  it("REPEAT can be nested", () => {
    const r = runLogoProgram("REPEAT 3 [ REPEAT 4 [ FORWARD 30 RIGHT 90 ] RIGHT 120 ]");
    expect(r.segments.length).toBe(12);
  });

  it("returns a parse error for malformed REPEAT (missing closing bracket)", () => {
    const r = runLogoProgram("REPEAT 4 [ FORWARD 50");
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it("ignores comments starting with ;", () => {
    const r = runLogoProgram("; this is a comment\nFORWARD 50");
    expect(r.errors.length).toBe(0);
    expect(r.segments.length).toBe(1);
  });
});
