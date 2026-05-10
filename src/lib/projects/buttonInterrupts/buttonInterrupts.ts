export interface IsrLogEntry {
  source: "button" | "switch";
  index: number;
  count: number;
}

export interface IsrState {
  /** previous reading of the 4 DIP switches as a bitmask */
  prevSwitches: number;
  /** what each board LED is currently doing (toggled by every ISR) */
  ledBank: [boolean, boolean, boolean, boolean];
  /** total number of ISRs fired so far */
  isrCount: number;
  /** chronological log of every ISR */
  log: IsrLogEntry[];
}

export function initialIsrState(): IsrState {
  return {
    prevSwitches: 0,
    ledBank: [false, false, false, false],
    isrCount: 0,
    log: [],
  };
}

const SINGLE_BIT_INDEX: Record<number, number> = {
  0x1: 0,
  0x2: 1,
  0x4: 2,
  0x8: 3,
};

export function decodeButtonBits(raw: number): number | null {
  return SINGLE_BIT_INDEX[raw] ?? null;
}

export function decodeSwitchEdge(prev: number, curr: number): number | null {
  return SINGLE_BIT_INDEX[(prev ^ curr) & 0xf] ?? null;
}

function applyToggle(state: IsrState, source: "button" | "switch", index: number): IsrState {
  const next = [...state.ledBank] as IsrState["ledBank"];
  next[index] = !next[index];
  const count = state.isrCount + 1;
  return {
    ...state,
    ledBank: next,
    isrCount: count,
    log: [...state.log, { source, index, count }],
  };
}

export function pressButton(state: IsrState, rawBits: number): IsrState {
  const idx = decodeButtonBits(rawBits);
  if (idx === null) return state;
  return applyToggle(state, "button", idx);
}

export function flipSwitch(state: IsrState, newRaw: number): IsrState {
  const idx = decodeSwitchEdge(state.prevSwitches, newRaw);
  if (idx === null) return state;
  return {
    ...applyToggle(state, "switch", idx),
    prevSwitches: newRaw & 0xf,
  };
}
