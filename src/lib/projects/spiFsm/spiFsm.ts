/**
 * SPI controller FSM (Lab 4 of Engs 31, SP20).
 *
 * Reproduces `Controller_lab4.vhd` as a pure state-transition
 * function, driven by `take_sample` and the internal terminal-count
 * `TC` signal from a 4-bit shift counter (counts 0…14, asserts TC
 * when count == 14, then resets).
 *
 * State diagram:
 *   SWait — idle, spi_cs HIGH, no shift.
 *           take_sample = 1 → Shift
 *   Shift — spi_cs LOW, shift_en HIGH, counter enabled (CE=1).
 *           TC = 1          → Load
 *   Load  — spi_cs HIGH, load_en HIGH (parallel-load the receiver
 *           output register). Always returns → SWait next sclk.
 *
 * Counting 0→14 (15 ticks before TC) means CE asserts during 15
 * `Shift` cycles + a final `Load` cycle = 16 sclk pulses across
 * the SPI transaction — a 16-bit transfer.
 */

export const STATES = ["SWait", "Shift", "Load"] as const;
export type State = (typeof STATES)[number];

export interface Outputs {
  spi_cs: 0 | 1;
  shift_en: 0 | 1;
  load_en: 0 | 1;
  CE: 0 | 1;
}

export interface Inputs {
  take_sample: 0 | 1;
  TC: 0 | 1;
}

/** Pure Moore-style output for a state. */
export function outputsFor(state: State): Outputs {
  switch (state) {
    case "SWait":
      return { spi_cs: 1, shift_en: 0, load_en: 0, CE: 0 };
    case "Shift":
      return { spi_cs: 0, shift_en: 1, load_en: 0, CE: 1 };
    case "Load":
      return { spi_cs: 1, shift_en: 0, load_en: 1, CE: 0 };
  }
}

/** Pure next-state function. */
export function nextState(state: State, inputs: Inputs): State {
  switch (state) {
    case "SWait":
      return inputs.take_sample === 1 ? "Shift" : "SWait";
    case "Shift":
      return inputs.TC === 1 ? "Load" : "Shift";
    case "Load":
      return "SWait";
  }
}

export const COUNT_TC = 14;
export const COUNT_MAX = 15;

export interface Snapshot {
  state: State;
  count: number;
  outputs: Outputs;
  /** Shift-register count (0..14) — only advances while CE=1. */
}

export const INITIAL: Snapshot = {
  state: "SWait",
  count: 0,
  outputs: outputsFor("SWait"),
};

/**
 * Advance one sclk rising edge given the take_sample input.
 * The internal counter advances only while CE = 1 (i.e. in Shift),
 * and asserts TC when count == 14 — same logic as the Count_proc.
 */
export function tick(snap: Snapshot, takeSample: 0 | 1): Snapshot {
  const ce = snap.outputs.CE;
  const tc: 0 | 1 = ce === 1 && snap.count === COUNT_TC ? 1 : 0;
  const next = nextState(snap.state, { take_sample: takeSample, TC: tc });
  // count advances on the same clock; reset to 0 on TC
  let nextCount = snap.count;
  if (ce === 1) {
    nextCount = snap.count === COUNT_TC ? 0 : snap.count + 1;
  }
  // when leaving Shift (TC), we already reset; when entering Shift, reset
  if (snap.state !== "Shift" && next === "Shift") nextCount = 0;
  return {
    state: next,
    count: nextCount,
    outputs: outputsFor(next),
  };
}

/** Run for N sclk ticks with a static take_sample, returning the trace. */
export function runTrace(
  start: Snapshot,
  takeSampleSequence: (0 | 1)[],
): Snapshot[] {
  const trace: Snapshot[] = [start];
  let s = start;
  for (const take of takeSampleSequence) {
    s = tick(s, take);
    trace.push(s);
  }
  return trace;
}
