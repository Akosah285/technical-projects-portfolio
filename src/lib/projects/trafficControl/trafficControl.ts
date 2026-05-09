/**
 * IoT traffic-control FSM (Lab 8 of E85, WI21).
 *
 * Reproduces the firmware in `AIO_MQTT_traffic_control.ino` as a
 * pure reducer over events from MQTT subscriptions + the system tick.
 *
 * Real-world layout:
 *   - Adafruit Airlift WiFi shield drives an RGB LED for the signal
 *   - SG92R servo on PWM pin 9 raises/lowers the crossing gate
 *   - TMP36 on A0 publishes temperature to Adafruit IO
 *   - Two MQTT feeds: `maintenance` (ON/OFF), `train_sig` (pressed)
 *
 * The FSM is the brain: the normal RED → YELLOW_1 → GREEN → YELLOW_2
 * cycle pre-empts to MAINTENANCE on a maintenance ON, and to
 * TRAIN_ARRIVAL on a press; both close the gate. Clearing returns
 * to RED with the gate open.
 */

export const STATES = [
  "RED",
  "YELLOW_1",
  "GREEN",
  "YELLOW_2",
  "MAINTENANCE",
  "TRAIN_ARRIVAL",
] as const;
export type State = (typeof STATES)[number];

export type Event =
  | { type: "tick" }
  | { type: "maintenance_on" }
  | { type: "maintenance_off" }
  | { type: "train_press" };

export interface Snapshot {
  state: State;
  /** Whether a train is currently considered "arrived" — toggled by every press. */
  trainArrived: boolean;
  /** Most recent event in the message log (for the dashboard). */
  log: LogEntry[];
}

export interface LogEntry {
  at: number;
  text: string;
}

export const INITIAL: Snapshot = {
  state: "RED",
  trainArrived: false,
  log: [],
};

const NORMAL_NEXT: Partial<Record<State, State>> = {
  RED: "YELLOW_1",
  YELLOW_1: "GREEN",
  GREEN: "YELLOW_2",
  YELLOW_2: "RED",
};

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const COLORS: Record<State, RGB> = {
  RED: { r: 250, g: 0, b: 0 },
  YELLOW_1: { r: 250, g: 250, b: 0 },
  GREEN: { r: 0, g: 250, b: 0 },
  YELLOW_2: { r: 250, g: 250, b: 0 },
  MAINTENANCE: { r: 0, g: 0, b: 250 },
  TRAIN_ARRIVAL: { r: 250, g: 0, b: 0 },
};

export const GATE_OPEN_DEG = 15;
export const GATE_CLOSE_DEG = 165;

export function colorFor(s: State): RGB {
  return COLORS[s];
}

export function gateAngleFor(s: State): number {
  return s === "MAINTENANCE" || s === "TRAIN_ARRIVAL"
    ? GATE_CLOSE_DEG
    : GATE_OPEN_DEG;
}

const MAX_LOG = 16;

function pushLog(snap: Snapshot, text: string, now: number): Snapshot {
  const log = [{ at: now, text }, ...snap.log].slice(0, MAX_LOG);
  return { ...snap, log };
}

export function step(snap: Snapshot, evt: Event, now = Date.now()): Snapshot {
  switch (evt.type) {
    case "maintenance_on":
      if (snap.state === "MAINTENANCE") return snap;
      return pushLog(
        { ...snap, state: "MAINTENANCE" },
        "MQTT maintenance/ON → MAINTENANCE",
        now,
      );
    case "maintenance_off":
      if (snap.state !== "MAINTENANCE") return snap;
      return pushLog(
        { ...snap, state: "RED" },
        "MQTT maintenance/OFF → gate open, RED",
        now,
      );
    case "train_press": {
      // Press toggles arrived/cleared
      if (!snap.trainArrived) {
        return pushLog(
          { ...snap, state: "TRAIN_ARRIVAL", trainArrived: true },
          "MQTT train_sig pressed → TRAIN_ARRIVAL",
          now,
        );
      }
      return pushLog(
        { ...snap, state: "RED", trainArrived: false },
        "MQTT train_sig pressed → train clear, RED",
        now,
      );
    }
    case "tick": {
      // Tick only advances the normal cycle. Pre-empted states
      // (MAINTENANCE, TRAIN_ARRIVAL) wait for an external clear.
      const next = NORMAL_NEXT[snap.state];
      if (!next) return snap;
      return pushLog({ ...snap, state: next }, `tick → ${next}`, now);
    }
  }
}

/** Run a sequence of events from INITIAL — useful for tests/debugging. */
export function run(events: Event[]): Snapshot {
  let snap = INITIAL;
  for (let i = 0; i < events.length; i++) {
    snap = step(snap, events[i], i);
  }
  return snap;
}
