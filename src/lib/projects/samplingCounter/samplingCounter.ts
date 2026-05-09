/**
 * Sampling counter (Lab 4 of ENGS 31, SP20).
 *
 * Reproduces `sampling_counter.vhd`. The hardware is a free-running
 * counter clocked by `sclk`. When `count == TCount` it asserts
 * `take_sample` for one cycle and resets to 0. The original VHDL
 * forgets to explicitly clear `take_sample` outside the match, so
 * the synthesised signal would latch HIGH after the first hit;
 * we model the SPEC behaviour (one-cycle pulse) here. Pass
 * `literalVhdl: true` to `tick` to opt into the latched behaviour
 * and reproduce the source-as-written.
 *
 * On a 100 MHz sclk and TCount=100000, take_sample fires every
 * 1 ms — i.e. a 1 kHz sample-rate strobe.
 */

export interface CounterState {
  count: number;
  takeSample: 0 | 1;
}

export const DEFAULT_TCOUNT = 100_000;

export const INITIAL: CounterState = {
  count: 0,
  takeSample: 0,
};

export interface TickOptions {
  /**
   * If true, reproduce the literal VHDL bug where take_sample never
   * clears once asserted (it stays HIGH after first match). Defaults
   * to false → models the spec (one-cycle pulse).
   */
  literalVhdl?: boolean;
}

/** One sclk rising edge. */
export function tick(
  state: CounterState,
  tcount: number = DEFAULT_TCOUNT,
  opts: TickOptions = {},
): CounterState {
  if (!Number.isInteger(tcount) || tcount < 1) {
    throw new Error("tcount must be a positive integer");
  }
  if (state.count === tcount) {
    return { count: 0, takeSample: 1 };
  }
  return {
    count: state.count + 1,
    takeSample: opts.literalVhdl ? state.takeSample : 0,
  };
}

/**
 * Convenience: derive the sample rate (Hz) from sclk frequency
 * (Hz) and TCount. Per the firmware, take_sample fires every
 * (TCount + 1) sclk ticks (count goes 0..TCount inclusive).
 */
export function sampleHz(sclkHz: number, tcount: number): number {
  if (!Number.isFinite(sclkHz) || sclkHz <= 0) throw new Error("bad sclkHz");
  if (!Number.isInteger(tcount) || tcount < 1) throw new Error("bad tcount");
  return sclkHz / (tcount + 1);
}

/** Run for N ticks, returning the final state and the number of pulses observed. */
export function runFor(
  start: CounterState,
  n: number,
  tcount: number = DEFAULT_TCOUNT,
  opts: TickOptions = {},
): { state: CounterState; pulses: number } {
  let s = start;
  let pulses = 0;
  for (let i = 0; i < n; i++) {
    s = tick(s, tcount, opts);
    if (s.takeSample === 1) pulses++;
  }
  return { state: s, pulses };
}
