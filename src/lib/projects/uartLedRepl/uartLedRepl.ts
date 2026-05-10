export type RgbColor = "red" | "green" | "blue" | "yellow" | "off";

export interface ReplState {
  /** four AXI-GPIO board LEDs (LD0–LD3) */
  boardLeds: [boolean, boolean, boolean, boolean];
  /** the PS-MIO LED (LED 4 in the firmware), lit as the alive indicator at boot */
  psLed: boolean;
  /** color of the second AXI-GPIO RGB LED (LD4) */
  rgbColor: RgbColor;
  /** UART output log, mirroring the printf() output of the firmware */
  log: string[];
  /** true once the user has typed 'q' to quit the REPL */
  done: boolean;
}

export function initialReplState(): ReplState {
  return {
    boardLeds: [false, false, false, false],
    psLed: true,
    rgbColor: "off",
    log: ["[Hello]"],
    done: false,
  };
}

const BOARD_INDEX = new Set(["0", "1", "2", "3"]);
const RGB_BY_KEY: Record<string, RgbColor> = {
  r: "red",
  g: "green",
  b: "blue",
  y: "yellow",
};

export function processCommand(state: ReplState, command: string): ReplState {
  if (state.done) return state;
  if (command.length !== 1) return state;

  if (command === "q") {
    return {
      ...state,
      boardLeds: [false, false, false, false],
      psLed: false,
      rgbColor: "off",
      log: [...state.log, "[done]"],
      done: true,
    };
  }

  if (BOARD_INDEX.has(command)) {
    const i = Number(command) as 0 | 1 | 2 | 3;
    const next = [...state.boardLeds] as ReplState["boardLeds"];
    next[i] = !next[i];
    return {
      ...state,
      boardLeds: next,
      log: [...state.log, `[${i} ${next[i] ? "on" : "off"}]`],
    };
  }

  const color = RGB_BY_KEY[command];
  if (color !== undefined) {
    return {
      ...state,
      rgbColor: color,
      log: [...state.log, `[${color}]`],
    };
  }

  return state;
}
