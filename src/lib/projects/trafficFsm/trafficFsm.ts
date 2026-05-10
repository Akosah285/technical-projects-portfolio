export type Light =
  | "RED"
  | "YELLOW_1"
  | "GREEN"
  | "YELLOW_2"
  | "TF_PED_CROSS"
  | "BLUE_STATE_ON"
  | "BLUE_STATE_OFF"
  | "GATE_CLOSE"
  | "GATE_OPEN";

export type Event =
  | { kind: "tick" }
  | { kind: "ped_press" }
  | { kind: "ped_done" }
  | { kind: "toggle_maintenance" }
  | { kind: "toggle_train" }
  | { kind: "blue_blink" };

export interface FsmState {
  light: Light;
  maintenanceMode: boolean;
  trainArrival: boolean;
  pedEnabled: boolean;
  log: string[];
}

export const initialFsmState: FsmState = {
  light: "RED",
  maintenanceMode: false,
  trainArrival: false,
  pedEnabled: true,
  log: ["[traffic flow init]"],
};

const LIGHT_LABEL: Record<Light, string> = {
  RED: "RED",
  YELLOW_1: "YELLOW_1",
  GREEN: "GREEN",
  YELLOW_2: "YELLOW_2",
  TF_PED_CROSS: "TF_PED_CROSS",
  BLUE_STATE_ON: "BLUE_STATE_ON",
  BLUE_STATE_OFF: "BLUE_STATE_OFF",
  GATE_CLOSE: "GATE_CLOSE",
  GATE_OPEN: "GATE_OPEN",
};

function logTransition(state: FsmState, next: Light, reason: string): FsmState {
  if (next === state.light) return state;
  return {
    ...state,
    light: next,
    log: [...state.log, `${LIGHT_LABEL[state.light]} → ${LIGHT_LABEL[next]} (${reason})`],
  };
}

const NORMAL_CYCLE: Record<string, Light> = {
  RED: "YELLOW_1",
  YELLOW_1: "GREEN",
  GREEN: "YELLOW_2",
  YELLOW_2: "RED",
};

export function step(state: FsmState, event: Event): FsmState {
  switch (event.kind) {
    case "toggle_maintenance": {
      const next = !state.maintenanceMode;
      const after = { ...state, maintenanceMode: next, trainArrival: next ? false : state.trainArrival };
      if (next) {
        return logTransition(after, "BLUE_STATE_ON", "maintenance");
      }
      return logTransition(after, "TF_PED_CROSS", "maintenance_clear");
    }

    case "toggle_train": {
      const next = !state.trainArrival;
      const after = { ...state, trainArrival: next };
      if (next) {
        return logTransition(after, "GATE_CLOSE", "train_arrival");
      }
      return logTransition(after, "GATE_OPEN", "train_clear");
    }

    case "ped_press": {
      if (state.light !== "RED" || !state.pedEnabled) return state;
      return logTransition(state, "TF_PED_CROSS", "ped_request");
    }

    case "ped_done": {
      if (state.light !== "TF_PED_CROSS" && state.light !== "GATE_OPEN") return state;
      return logTransition(state, "RED", "ped_done");
    }

    case "blue_blink": {
      if (state.light === "BLUE_STATE_ON") return logTransition(state, "BLUE_STATE_OFF", "blue_blink");
      if (state.light === "BLUE_STATE_OFF") return logTransition(state, "BLUE_STATE_ON", "blue_blink");
      return state;
    }

    case "tick": {
      if (state.maintenanceMode) return state;
      if (state.trainArrival) return state;
      const next = NORMAL_CYCLE[state.light];
      if (!next) return state;
      return logTransition(state, next, "tick");
    }
  }
}
