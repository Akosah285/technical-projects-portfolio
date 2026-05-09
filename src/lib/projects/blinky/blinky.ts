/**
 * Tiny AVR-like 8-bit register simulator for the Blinky lab
 * (Lab 1 of E85 — WI21).
 *
 * Models two 8-bit registers — DDRD (data direction) and PORTD
 * (output value) — and a small action language that mirrors the
 * bit-twiddling C idioms the student wrote:
 *
 *   PORTD |= (1 << bit)    →  setBit
 *   PORTD &= ~(1 << bit)   →  clearBit
 *   PORTD ^= (1 << bit)    →  toggleBit
 *   PORTD = value          →  assign
 *
 * Together with a `delay(ms)` action, a list of these forms a tiny
 * program. We interpret it into a list of register snapshots so the
 * player UI can draw the LED state vs time.
 *
 * An LED on bit b is "lit" iff both DDRD[b] = 1 (pin configured as
 * output) and PORTD[b] = 1 (output high) — exactly as on real
 * hardware.
 */

export type RegisterName = "DDRD" | "PORTD";

export type Action =
  | { kind: "setBit"; reg: RegisterName; bit: number }
  | { kind: "clearBit"; reg: RegisterName; bit: number }
  | { kind: "toggleBit"; reg: RegisterName; bit: number }
  | { kind: "assign"; reg: RegisterName; value: number }
  | { kind: "delay"; ms: number };

export interface RegisterState {
  DDRD: number;
  PORTD: number;
}

export interface SimFrame {
  /** Index of the action that produced this frame (-1 = initial) */
  actionIndex: number;
  /** Source-line annotation for the player's "code highlight" effect */
  description: string;
  /** Total simulated time at the END of this action (ms) */
  timeMs: number;
  /** Duration this frame should be displayed (ms) */
  durationMs: number;
  /** Snapshot of registers AFTER this action ran */
  state: RegisterState;
}

const MASK8 = 0xff;

function describe(action: Action): string {
  switch (action.kind) {
    case "setBit":
      return `${action.reg} |= (1 << ${action.bit});`;
    case "clearBit":
      return `${action.reg} &= ~(1 << ${action.bit});`;
    case "toggleBit":
      return `${action.reg} ^= (1 << ${action.bit});`;
    case "assign":
      return `${action.reg} = 0x${action.value.toString(16).toUpperCase().padStart(2, "0")};`;
    case "delay":
      return `_delay_ms(${action.ms});`;
  }
}

export function applyAction(state: RegisterState, action: Action): RegisterState {
  switch (action.kind) {
    case "setBit":
      return { ...state, [action.reg]: (state[action.reg] | (1 << action.bit)) & MASK8 };
    case "clearBit":
      return { ...state, [action.reg]: state[action.reg] & ~(1 << action.bit) & MASK8 };
    case "toggleBit":
      return { ...state, [action.reg]: (state[action.reg] ^ (1 << action.bit)) & MASK8 };
    case "assign":
      return { ...state, [action.reg]: action.value & MASK8 };
    case "delay":
      return state;
  }
}

export function isPinLit(state: RegisterState, bit: number): boolean {
  if (bit < 0 || bit > 7) throw new RangeError(`bit ${bit} out of range`);
  const ddrBit = (state.DDRD >> bit) & 1;
  const portBit = (state.PORTD >> bit) & 1;
  return ddrBit === 1 && portBit === 1;
}

/**
 * Run a program — a list of actions — into a sequence of frames.
 * Each frame's `durationMs` is the wait that follows the action
 * (0 for non-delay actions). The player displays each frame for
 * its duration scaled by a playback rate.
 */
export function runProgram(
  program: readonly Action[],
  initial: RegisterState = { DDRD: 0, PORTD: 0 },
): SimFrame[] {
  const frames: SimFrame[] = [];
  let state: RegisterState = { ...initial };
  let timeMs = 0;
  for (let i = 0; i < program.length; i += 1) {
    const action = program[i];
    state = applyAction(state, action);
    const duration = action.kind === "delay" ? action.ms : 0;
    timeMs += duration;
    frames.push({
      actionIndex: i,
      description: describe(action),
      timeMs,
      durationMs: duration,
      state: { ...state },
    });
  }
  return frames;
}

/**
 * Faithful translation of `blinkSEQ()` from the original C —
 * blink LEDs on PORT D bits 2, 4, and 7 in sequence.
 *
 *   #define LED_ON_TIME   100
 *   #define LED_OFF_TIME  150     // (250 - 100)
 */
export const SEQ_PROGRAM: Action[] = [
  // DDRD setup — configure bits 2, 4, 7 as outputs
  { kind: "setBit", reg: "DDRD", bit: 2 },
  { kind: "setBit", reg: "DDRD", bit: 4 },
  { kind: "setBit", reg: "DDRD", bit: 7 },
  // Loop body — LED on D2
  { kind: "setBit", reg: "PORTD", bit: 2 },
  { kind: "delay", ms: 100 },
  { kind: "clearBit", reg: "PORTD", bit: 2 },
  { kind: "delay", ms: 150 },
  // LED on D4
  { kind: "setBit", reg: "PORTD", bit: 4 },
  { kind: "delay", ms: 150 },
  { kind: "clearBit", reg: "PORTD", bit: 4 },
  { kind: "delay", ms: 150 },
  // LED on D7
  { kind: "setBit", reg: "PORTD", bit: 7 },
  { kind: "delay", ms: 100 },
  { kind: "clearBit", reg: "PORTD", bit: 7 },
  { kind: "delay", ms: 150 },
];

/**
 * 3-bit counter from `blinkyCNT.c` — count 0…7 on the same pins.
 * Bit-mapping: D2 = LSB (bit 0), D4 = bit 1, D7 = bit 2.
 *
 * The original used a switch-case with manual bit operations and
 * inverts; we generate the equivalent by clearing PORTD and setting
 * the relevant bits for each count.
 */
export const COUNT_PROGRAM: Action[] = (() => {
  const setup: Action[] = [
    { kind: "setBit", reg: "DDRD", bit: 2 },
    { kind: "setBit", reg: "DDRD", bit: 4 },
    { kind: "setBit", reg: "DDRD", bit: 7 },
  ];
  const loop: Action[] = [];
  for (let n = 0; n <= 7; n += 1) {
    let value = 0;
    if ((n >> 0) & 1) value |= 1 << 2;
    if ((n >> 1) & 1) value |= 1 << 4;
    if ((n >> 2) & 1) value |= 1 << 7;
    loop.push({ kind: "assign", reg: "PORTD", value });
    loop.push({ kind: "delay", ms: 500 });
  }
  return [...setup, ...loop];
})();

/**
 * The three lab LEDs are wired to bits 2, 4, and 7 of PORT D.
 * Anything else on PORT D is unused but still observable in the
 * register view.
 */
export const LED_PINS: ReadonlyArray<{ bit: number; label: string }> = [
  { bit: 2, label: "D2" },
  { bit: 4, label: "D4" },
  { bit: 7, label: "D7" },
];
