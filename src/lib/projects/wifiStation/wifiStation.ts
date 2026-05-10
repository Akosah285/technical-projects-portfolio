export const LOW_DUTY = 5.25;
export const HIGH_DUTY = 10.25;
export const POT_MAX = 2.88;
export const ID = 1;

export type Mode = "CONFIGURE" | "PING" | "UPDATE";

export interface PingMsg {
  type: "PING";
  id: number;
}

export interface UpdateRequestMsg {
  type: "UPDATE";
  id: number;
  value: number;
}

export interface UpdateResponseMsg {
  type: "UPDATE_RESPONSE";
  id: number;
  average: number;
  values: number[];
}

export type Outbox = PingMsg | UpdateRequestMsg;

export interface WifiState {
  mode: Mode;
  duty: number;
  done: boolean;
  outbox: Outbox[];
  log: string[];
}

export const initialWifiState: WifiState = {
  mode: "CONFIGURE",
  duty: 7.5,
  done: false,
  outbox: [],
  log: ["[Hello]"],
};

export function potToPercent(pot: number): number {
  return Math.trunc((pot * 100) / POT_MAX);
}

export function percentToDuty(percent: number): number {
  return percent / 20 + LOW_DUTY;
}

export function pressButton(state: WifiState, button: number, pot = 0): WifiState {
  if (state.done) return state;
  switch (button) {
    case 0:
      return {
        ...state,
        mode: "CONFIGURE",
        log: [...state.log, "<allows entry to wifi cmd mode>"],
      };
    case 1: {
      const msg: PingMsg = { type: "PING", id: ID };
      return {
        ...state,
        mode: "PING",
        outbox: [...state.outbox, msg],
        log: [...state.log, "[PING]"],
      };
    }
    case 2: {
      const value = potToPercent(pot);
      const msg: UpdateRequestMsg = { type: "UPDATE", id: ID, value };
      return {
        ...state,
        mode: "UPDATE",
        outbox: [...state.outbox, msg],
        log: [...state.log, `[UPDATE value=${value}%]`],
      };
    }
    case 3:
      return { ...state, done: true, log: [...state.log, "[done]"] };
    default:
      return { ...state, mode: "CONFIGURE" };
  }
}

export function receivePingResponse(state: WifiState, id: number): WifiState {
  return { ...state, log: [...state.log, `[PING, id=${id}]`] };
}

export function receiveUpdateResponse(
  state: WifiState,
  response: UpdateResponseMsg,
): WifiState {
  const valueForUs = response.values[response.id] ?? 0;
  const next = percentToDuty(valueForUs);
  const summary = response.values.slice(0, 6).join(" ");
  return {
    ...state,
    duty: next,
    log: [
      ...state.log,
      `[UPDATE, id=${response.id}, average=${response.average}, values={${summary}…}]`,
    ],
  };
}
