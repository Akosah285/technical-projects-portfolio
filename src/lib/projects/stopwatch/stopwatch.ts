/**
 * Stopwatch FSM (ENGS 31, SP20 Lab 3).
 *
 * The lab targets a Basys-3 FPGA. Three slide-switch / push-button
 * inputs drive a state machine that times in hundredths of a second
 * and renders to the 4-digit 7-segment display in MM:SS or SS.HH
 * style. This module reproduces the classic 4-digit hundredths-of-
 * second variant (display = SS.HH, range 00.00 → 99.99 then wraps).
 *
 * States:
 *
 *   STOPPED (initial) — time held. clear → 0. start_stop → RUNNING.
 *   RUNNING            — time++ each tick (100 Hz). start_stop → STOPPED.
 *                         clear is ignored while running (real watches
 *                         require you to stop first before clearing —
 *                         matches the lab spec).
 *
 * Events:
 *
 *   tick        — one 100 Hz tick from the prescaler counter
 *   start_stop  — pulse from the toggle button
 *   clear       — pulse from the clear button
 *
 * Display: 4 BCD digits — [tens-of-sec, sec, tenths, hundredths].
 * Rolls over at 99.99 → 00.00.
 */

export type State = "STOPPED" | "RUNNING";

export interface Snapshot {
  state: State;
  /** Total elapsed time in hundredths of a second (0..9999). */
  hundredths: number;
}

export type Event =
  | { type: "tick" }
  | { type: "start_stop" }
  | { type: "clear" };

export const INITIAL: Snapshot = {
  state: "STOPPED",
  hundredths: 0,
};

export const MAX_HUNDREDTHS = 9999;

export function step(snap: Snapshot, evt: Event): Snapshot {
  switch (evt.type) {
    case "start_stop":
      return { ...snap, state: snap.state === "RUNNING" ? "STOPPED" : "RUNNING" };
    case "clear":
      // clear only works while STOPPED (matches the lab spec)
      if (snap.state === "RUNNING") return snap;
      return { ...snap, hundredths: 0 };
    case "tick":
      if (snap.state !== "RUNNING") return snap;
      return {
        ...snap,
        hundredths: (snap.hundredths + 1) % (MAX_HUNDREDTHS + 1),
      };
  }
}

export interface BcdDigits {
  /** 4 BCD digits MSB→LSB: tens-of-sec, sec, tenths, hundredths */
  digits: [number, number, number, number];
  /** Decimal point position (between sec & tenths) is always at index 1. */
  dpAt: 1;
}

/** Convert an elapsed-hundredths count to 4 BCD digits SS.HH. */
export function toBcd(hundredths: number): BcdDigits {
  if (!Number.isInteger(hundredths) || hundredths < 0) {
    throw new Error("hundredths must be a non-negative integer");
  }
  const v = hundredths % (MAX_HUNDREDTHS + 1);
  const seconds = Math.floor(v / 100);
  const fraction = v % 100;
  return {
    digits: [
      Math.floor(seconds / 10),
      seconds % 10,
      Math.floor(fraction / 10),
      fraction % 10,
    ],
    dpAt: 1,
  };
}

/** Format a snapshot as the SS.HH display string. */
export function formatDisplay(hundredths: number): string {
  const bcd = toBcd(hundredths);
  return `${bcd.digits[0]}${bcd.digits[1]}.${bcd.digits[2]}${bcd.digits[3]}`;
}
