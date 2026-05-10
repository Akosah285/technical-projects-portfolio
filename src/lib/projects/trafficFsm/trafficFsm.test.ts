import { describe, it, expect } from "vitest";

import { initialFsmState, step, type FsmState, type Light } from "./trafficFsm";

const tick = (s: FsmState) => step(s, { kind: "tick" });
const press = (s: FsmState) => step(s, { kind: "ped_press" });
const pedDone = (s: FsmState) => step(s, { kind: "ped_done" });
const maint = (s: FsmState) => step(s, { kind: "toggle_maintenance" });
const train = (s: FsmState) => step(s, { kind: "toggle_train" });
const blink = (s: FsmState) => step(s, { kind: "blue_blink" });

const setLight = (s: FsmState, light: Light): FsmState => ({ ...s, light });

describe("traffic FSM normal cycle", () => {
  it("starts at RED", () => {
    expect(initialFsmState.light).toBe("RED");
  });
  it("RED → YELLOW_1 on tick", () => {
    expect(tick(initialFsmState).light).toBe("YELLOW_1");
  });
  it("YELLOW_1 → GREEN on tick", () => {
    expect(tick(tick(initialFsmState)).light).toBe("GREEN");
  });
  it("GREEN → YELLOW_2 on tick", () => {
    expect(tick(tick(tick(initialFsmState))).light).toBe("YELLOW_2");
  });
  it("YELLOW_2 → RED closes the cycle", () => {
    expect(tick(tick(tick(tick(initialFsmState)))).light).toBe("RED");
  });
});

describe("pedestrian crossing", () => {
  it("ped_press at RED → TF_PED_CROSS", () => {
    expect(press(initialFsmState).light).toBe("TF_PED_CROSS");
  });
  it("ped_press at GREEN is ignored (only RED enables it)", () => {
    const green = setLight(initialFsmState, "GREEN");
    expect(press(green).light).toBe("GREEN");
  });
  it("ped_done at TF_PED_CROSS → RED", () => {
    const cross = press(initialFsmState);
    expect(pedDone(cross).light).toBe("RED");
  });
});

describe("maintenance mode", () => {
  it("toggle_maintenance from RED → BLUE_STATE_ON", () => {
    expect(maint(initialFsmState).light).toBe("BLUE_STATE_ON");
  });
  it("blue blink toggles BLUE_STATE_ON ↔ BLUE_STATE_OFF", () => {
    const blue = maint(initialFsmState);
    expect(blink(blue).light).toBe("BLUE_STATE_OFF");
    expect(blink(blink(blue)).light).toBe("BLUE_STATE_ON");
  });
  it("toggle_maintenance again leaves blue → TF_PED_CROSS", () => {
    const blue = maint(initialFsmState);
    const cleared = maint(blue);
    expect(cleared.light).toBe("TF_PED_CROSS");
    expect(cleared.maintenanceMode).toBe(false);
  });
  it("ticks are ignored while in maintenance", () => {
    const blue = maint(initialFsmState);
    expect(tick(blue).light).toBe("BLUE_STATE_ON");
  });
});

describe("level-crossing gate", () => {
  it("toggle_train from RED → GATE_CLOSE", () => {
    expect(train(initialFsmState).light).toBe("GATE_CLOSE");
  });
  it("toggle_train again → GATE_OPEN", () => {
    const closed = train(initialFsmState);
    expect(train(closed).light).toBe("GATE_OPEN");
  });
  it("ticks are ignored while train is at the gate", () => {
    const closed = train(initialFsmState);
    expect(tick(closed).light).toBe("GATE_CLOSE");
  });
  it("ped_done at GATE_OPEN → RED (resumes normal cycle)", () => {
    const closed = train(initialFsmState);
    const open = train(closed);
    expect(pedDone(open).light).toBe("RED");
  });
});

describe("logging", () => {
  it("each transition adds a line", () => {
    const next = tick(initialFsmState);
    expect(next.log[next.log.length - 1]).toMatch(/RED → YELLOW_1/);
  });
});
