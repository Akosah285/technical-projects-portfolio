export const LOW_DUTY = 5.25;
export const HIGH_DUTY = 10.25;
export const STEP = 0.25;
export const INITIAL_DUTY = 7.5;

export interface ServoState {
  duty: number;
  heartbeatCount: number;
  heartbeatLed: boolean;
  done: boolean;
  log: string[];
}

export const initialServoState: ServoState = {
  duty: INITIAL_DUTY,
  heartbeatCount: 0,
  heartbeatLed: false,
  done: false,
  log: ["[hello]"],
};

export function dutyToAngle(duty: number): number {
  return ((duty - LOW_DUTY) / (HIGH_DUTY - LOW_DUTY)) * 180;
}

function format(duty: number): string {
  return duty.toFixed(2);
}

export function processServoCommand(state: ServoState, cmd: string): ServoState {
  if (state.done) return state;

  const append = (next: Partial<ServoState>, line: string): ServoState => ({
    ...state,
    ...next,
    log: [...state.log, line],
  });

  switch (cmd) {
    case "q":
      return { ...state, done: true, log: [...state.log, "[done]"] };
    case "a": {
      const next = state.duty + STEP;
      if (next > HIGH_DUTY) return state;
      return append({ duty: next }, `> a  duty=${format(next)}%`);
    }
    case "s": {
      const next = state.duty - STEP;
      if (next < LOW_DUTY) return state;
      return append({ duty: next }, `> s  duty=${format(next)}%`);
    }
    case "high":
      return append({ duty: HIGH_DUTY }, `> high  duty=${format(HIGH_DUTY)}%`);
    case "low":
      return append({ duty: LOW_DUTY }, `> low  duty=${format(LOW_DUTY)}%`);
    default:
      return state;
  }
}

export function tickHeartbeat(state: ServoState): ServoState {
  return {
    ...state,
    heartbeatCount: state.heartbeatCount + 1,
    heartbeatLed: !state.heartbeatLed,
  };
}
