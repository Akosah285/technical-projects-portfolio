/**
 * Reaction-time game state machine.
 *
 * Faithful translation of `buttonLED_RTG.c` (E85 lab, WI21).
 *
 * The original code is a 3-state FSM running against AVR pin
 * polling — pull-ups on PIND7 and PIND4 with three LEDs on PORTB
 * bits 0 (player 1), 1 (start light), 2 (player 2):
 *
 *   IDLE       — start LED on; either button press → COUNTDOWN
 *   COUNTDOWN  — blink the start LED 3 times; buttons ignored
 *   READY      — start LED on; first button press wins
 *   CELEBRATE  — flicker the winning LED a few times, then back to
 *                IDLE
 *
 * We add a `READY` substate (the original C only really has IDLE /
 * COUNTDOWN / RUNNING; the "ready" moment is when COUNTDOWN ends),
 * because that's the moment a player UI needs to start measuring
 * reaction time.
 *
 * Inputs: a button press from either player or the passage of time
 * (an opaque millisecond tick supplied by the player UI).
 */

export type Phase = "idle" | "countdown" | "ready" | "celebrate";

export type Player = "p1" | "p2";

export interface GameState {
  phase: Phase;
  /** Total elapsed ms since the game booted. */
  timeMs: number;
  /** When the current phase was entered. */
  phaseStartMs: number;
  /** True iff the start LED is currently lit (also drives the blink). */
  startLed: boolean;
  /** Bit-vector of player LEDs currently lit. */
  p1Led: boolean;
  p2Led: boolean;
  /** Set when the game enters CELEBRATE — also the most recent winner. */
  winner: Player | null;
  /** Reaction time (READY → button press) for the most recent round. */
  reactionMs: number | null;
}

export type Event =
  | { kind: "tick"; ms: number }
  | { kind: "press"; player: Player };

export const COUNTDOWN_BLINKS = 3;
export const COUNTDOWN_BLINK_PERIOD_MS = 1100; // ON_TIME 100 + OFF_TIME 1000
export const COUNTDOWN_DURATION_MS = COUNTDOWN_BLINKS * COUNTDOWN_BLINK_PERIOD_MS;
export const CELEBRATE_FLICKERS = 10;
export const CELEBRATE_PERIOD_MS = 200; // 100 on + 100 off
export const CELEBRATE_DURATION_MS = CELEBRATE_FLICKERS * CELEBRATE_PERIOD_MS;

export function initialGameState(): GameState {
  return {
    phase: "idle",
    timeMs: 0,
    phaseStartMs: 0,
    startLed: true,
    p1Led: false,
    p2Led: false,
    winner: null,
    reactionMs: null,
  };
}

function startLedDuringCountdown(elapsed: number): boolean {
  // Blink: on for 100 ms, off for 1000 ms, repeat
  const within = elapsed % COUNTDOWN_BLINK_PERIOD_MS;
  return within < 100;
}

function celebrateLed(elapsed: number): boolean {
  const within = elapsed % CELEBRATE_PERIOD_MS;
  return within < CELEBRATE_PERIOD_MS / 2;
}

export function step(state: GameState, event: Event): GameState {
  if (event.kind === "tick") {
    const newTime = state.timeMs + event.ms;
    let next: GameState = { ...state, timeMs: newTime };
    const phaseElapsed = newTime - state.phaseStartMs;
    switch (state.phase) {
      case "idle":
        next = { ...next, startLed: true, p1Led: false, p2Led: false };
        break;
      case "countdown":
        if (phaseElapsed >= COUNTDOWN_DURATION_MS) {
          next = {
            ...next,
            phase: "ready",
            phaseStartMs: state.phaseStartMs + COUNTDOWN_DURATION_MS,
            startLed: true,
            p1Led: false,
            p2Led: false,
          };
        } else {
          next = {
            ...next,
            startLed: startLedDuringCountdown(phaseElapsed),
            p1Led: false,
            p2Led: false,
          };
        }
        break;
      case "ready":
        next = { ...next, startLed: true, p1Led: false, p2Led: false };
        break;
      case "celebrate": {
        if (phaseElapsed >= CELEBRATE_DURATION_MS) {
          next = {
            ...next,
            phase: "idle",
            phaseStartMs: newTime,
            startLed: true,
            p1Led: false,
            p2Led: false,
            winner: state.winner, // remember winner across the cycle for UI
          };
        } else {
          const lit = celebrateLed(phaseElapsed);
          next = {
            ...next,
            startLed: false,
            p1Led: state.winner === "p1" && lit,
            p2Led: state.winner === "p2" && lit,
          };
        }
        break;
      }
    }
    return next;
  }

  // Button press
  switch (state.phase) {
    case "idle":
      // Either button starts countdown.
      return {
        ...state,
        phase: "countdown",
        phaseStartMs: state.timeMs,
        winner: null,
        reactionMs: null,
        startLed: true,
        p1Led: false,
        p2Led: false,
      };
    case "countdown":
      // Pressing during countdown is ignored — same as the original C
      // (the polling loop doesn't sample the buttons until READY).
      return state;
    case "ready":
      // First press wins.
      return {
        ...state,
        phase: "celebrate",
        phaseStartMs: state.timeMs,
        winner: event.player,
        reactionMs: state.timeMs - state.phaseStartMs,
        startLed: false,
        p1Led: event.player === "p1",
        p2Led: event.player === "p2",
      };
    case "celebrate":
      // Pressing during celebration is ignored.
      return state;
  }
}
