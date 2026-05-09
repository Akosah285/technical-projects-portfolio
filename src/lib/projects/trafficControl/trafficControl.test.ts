import { describe, it, expect } from "vitest";
import {
  GATE_CLOSE_DEG,
  GATE_OPEN_DEG,
  INITIAL,
  colorFor,
  gateAngleFor,
  run,
  step,
  type State,
} from "./trafficControl";

describe("traffic FSM — normal cycle", () => {
  it("RED → YELLOW_1 → GREEN → YELLOW_2 → RED on tick", () => {
    const path: State[] = [];
    let snap = INITIAL;
    for (let i = 0; i < 5; i++) {
      snap = step(snap, { type: "tick" });
      path.push(snap.state);
    }
    expect(path).toEqual(["YELLOW_1", "GREEN", "YELLOW_2", "RED", "YELLOW_1"]);
  });

  it("starts at RED, gate open", () => {
    expect(INITIAL.state).toBe("RED");
    expect(gateAngleFor(INITIAL.state)).toBe(GATE_OPEN_DEG);
  });
});

describe("maintenance pre-empts", () => {
  it("from any normal state, maintenance_on → MAINTENANCE + gate closed", () => {
    for (const start of ["RED", "YELLOW_1", "GREEN", "YELLOW_2"] as State[]) {
      const snap = step({ ...INITIAL, state: start }, { type: "maintenance_on" });
      expect(snap.state).toBe("MAINTENANCE");
      expect(gateAngleFor(snap.state)).toBe(GATE_CLOSE_DEG);
    }
  });

  it("tick is a no-op while in MAINTENANCE", () => {
    const m = { ...INITIAL, state: "MAINTENANCE" as State };
    expect(step(m, { type: "tick" }).state).toBe("MAINTENANCE");
  });

  it("maintenance_off returns to RED with gate open", () => {
    const m = { ...INITIAL, state: "MAINTENANCE" as State };
    const cleared = step(m, { type: "maintenance_off" });
    expect(cleared.state).toBe("RED");
    expect(gateAngleFor(cleared.state)).toBe(GATE_OPEN_DEG);
  });

  it("redundant maintenance_on is a no-op", () => {
    const m = { ...INITIAL, state: "MAINTENANCE" as State };
    expect(step(m, { type: "maintenance_on" })).toEqual(m);
  });
});

describe("train signal — toggle on press", () => {
  it("first press → TRAIN_ARRIVAL + arrived flag set + gate closed", () => {
    const s = step(INITIAL, { type: "train_press" });
    expect(s.state).toBe("TRAIN_ARRIVAL");
    expect(s.trainArrived).toBe(true);
    expect(gateAngleFor(s.state)).toBe(GATE_CLOSE_DEG);
  });

  it("second press → cleared, back to RED with gate open", () => {
    const s1 = step(INITIAL, { type: "train_press" });
    const s2 = step(s1, { type: "train_press" });
    expect(s2.state).toBe("RED");
    expect(s2.trainArrived).toBe(false);
    expect(gateAngleFor(s2.state)).toBe(GATE_OPEN_DEG);
  });

  it("tick is a no-op during TRAIN_ARRIVAL", () => {
    const t = { ...INITIAL, state: "TRAIN_ARRIVAL" as State, trainArrived: true };
    expect(step(t, { type: "tick" }).state).toBe("TRAIN_ARRIVAL");
  });
});

describe("colors per state", () => {
  it("RED is red, GREEN is green, MAINTENANCE is blue, YELLOWs are yellow", () => {
    expect(colorFor("RED")).toEqual({ r: 250, g: 0, b: 0 });
    expect(colorFor("GREEN")).toEqual({ r: 0, g: 250, b: 0 });
    expect(colorFor("MAINTENANCE")).toEqual({ r: 0, g: 0, b: 250 });
    expect(colorFor("YELLOW_1")).toEqual({ r: 250, g: 250, b: 0 });
    expect(colorFor("YELLOW_2")).toEqual({ r: 250, g: 250, b: 0 });
    expect(colorFor("TRAIN_ARRIVAL")).toEqual({ r: 250, g: 0, b: 0 });
  });
});

describe("event log", () => {
  it("captures latest events first", () => {
    const snap = run([
      { type: "tick" },
      { type: "tick" },
      { type: "maintenance_on" },
    ]);
    expect(snap.state).toBe("MAINTENANCE");
    expect(snap.log[0].text).toMatch(/MAINTENANCE/);
    expect(snap.log.length).toBe(3);
  });

  it("caps the log length", () => {
    const events = Array.from({ length: 50 }, () => ({ type: "tick" as const }));
    const snap = run(events);
    expect(snap.log.length).toBeLessThanOrEqual(16);
  });
});
