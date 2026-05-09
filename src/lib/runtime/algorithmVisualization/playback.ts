export interface PlaybackState {
  index: number;
  isPlaying: boolean;
  speed: number;
  stepCount: number;
}

export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "step-forward" }
  | { type: "step-backward" }
  | { type: "seek"; index: number }
  | { type: "set-speed"; speed: number }
  | { type: "reset" };

export function playbackInit(stepCount: number): PlaybackState {
  return { index: 0, isPlaying: false, speed: 1, stepCount };
}

function clampIndex(index: number, stepCount: number): number {
  return Math.max(0, Math.min(index, stepCount));
}

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction,
): PlaybackState {
  switch (action.type) {
    case "play":
      return { ...state, isPlaying: true };
    case "pause":
      return { ...state, isPlaying: false };
    case "step-forward":
      return { ...state, index: clampIndex(state.index + 1, state.stepCount) };
    case "step-backward":
      return { ...state, index: clampIndex(state.index - 1, state.stepCount) };
    case "seek":
      return { ...state, index: clampIndex(action.index, state.stepCount) };
    case "set-speed":
      return { ...state, speed: action.speed };
    case "reset":
      return playbackInit(state.stepCount);
  }
}
