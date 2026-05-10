import { describe, it, expect } from "vitest";

import {
  initialWifiState,
  pressButton,
  receivePingResponse,
  receiveUpdateResponse,
  potToPercent,
  percentToDuty,
  LOW_DUTY,
  HIGH_DUTY,
  ID,
} from "./wifiStation";

describe("potToPercent", () => {
  it("0 V → 0%", () => {
    expect(potToPercent(0)).toBe(0);
  });
  it("2.88 V (max) → 100%", () => {
    expect(potToPercent(2.88)).toBe(100);
  });
  it("1.44 V → 50%", () => {
    expect(potToPercent(1.44)).toBe(50);
  });
});

describe("percentToDuty (inverse maps a remote percent into local PWM)", () => {
  it("0% → LOW_DUTY", () => {
    expect(percentToDuty(0)).toBeCloseTo(LOW_DUTY, 5);
  });
  it("100% → HIGH_DUTY", () => {
    expect(percentToDuty(100)).toBeCloseTo(HIGH_DUTY, 5);
  });
  it("50% → midpoint 7.75%", () => {
    expect(percentToDuty(50)).toBeCloseTo(7.75, 5);
  });
});

describe("pressButton dispatches modes + outbox messages", () => {
  it("button 0 enters CONFIGURE mode", () => {
    const next = pressButton(initialWifiState, 0);
    expect(next.mode).toBe("CONFIGURE");
    expect(next.log[next.log.length - 1]).toMatch(/wifi cmd mode/);
  });

  it("button 1 enters PING mode and posts a ping_t to the outbox", () => {
    const next = pressButton(initialWifiState, 1);
    expect(next.mode).toBe("PING");
    expect(next.outbox).toEqual([{ type: "PING", id: ID }]);
  });

  it("button 2 reads pot and posts an update_request_t with the percent", () => {
    const next = pressButton(initialWifiState, 2, 1.44);
    expect(next.mode).toBe("UPDATE");
    expect(next.outbox).toEqual([{ type: "UPDATE", id: ID, value: 50 }]);
    expect(next.log[next.log.length - 1]).toMatch(/value=50/);
  });

  it("button 3 marks done", () => {
    const next = pressButton(initialWifiState, 3);
    expect(next.done).toBe(true);
  });

  it("any other button defaults to CONFIGURE", () => {
    const next = pressButton(initialWifiState, 7);
    expect(next.mode).toBe("CONFIGURE");
  });

  it("buttons after done are no-ops", () => {
    const done = pressButton(initialWifiState, 3);
    const next = pressButton(done, 1);
    expect(next.outbox).toEqual([]);
  });
});

describe("incoming responses on UART0", () => {
  it("ping response logs the remote id", () => {
    const next = receivePingResponse(initialWifiState, 7);
    expect(next.log[next.log.length - 1]).toBe("[PING, id=7]");
  });

  it("update response sets duty from values[id]", () => {
    const values = Array(30).fill(0);
    values[ID] = 100;
    const next = receiveUpdateResponse(initialWifiState, {
      type: "UPDATE_RESPONSE",
      id: ID,
      average: 50,
      values,
    });
    expect(next.duty).toBeCloseTo(HIGH_DUTY, 5);
  });

  it("update response logs id + average", () => {
    const next = receiveUpdateResponse(initialWifiState, {
      type: "UPDATE_RESPONSE",
      id: ID,
      average: 50,
      values: Array(30).fill(50),
    });
    expect(next.log[next.log.length - 1]).toMatch(/id=1/);
    expect(next.log[next.log.length - 1]).toMatch(/average=50/);
  });
});
