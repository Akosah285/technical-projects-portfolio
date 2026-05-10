export const LOW_DUTY = 5.25;
export const HIGH_DUTY = 10.25;
export const TEMP_C = 42.5;
export const VCC_V = 1.0;

export interface AdcState {
  pot: number;
  duty: number;
  log: string[];
}

export const initialAdcState: AdcState = {
  pot: 0.5,
  duty: 7.5,
  log: ["[hello]"],
};

export function potToDuty(pot: number): number {
  return (5 * pot) / 2.9 + LOW_DUTY;
}

export function pressButton(state: AdcState, button: number): AdcState {
  switch (button) {
    case 0:
      return {
        ...state,
        log: [...state.log, `[Temp = ${TEMP_C.toFixed(2)} c]`],
      };
    case 1:
      return {
        ...state,
        log: [...state.log, `[VccInt = ${VCC_V.toFixed(2)} v]`],
      };
    case 2:
      return {
        ...state,
        log: [...state.log, `[Pot = ${state.pot.toFixed(2)} v]`],
      };
    case 3: {
      const next = potToDuty(state.pot);
      return {
        ...state,
        duty: next,
        log: [...state.log, `[duty = ${next.toFixed(2)}]`],
      };
    }
    default:
      return state;
  }
}

export function setPot(state: AdcState, pot: number): AdcState {
  return { ...state, pot };
}
