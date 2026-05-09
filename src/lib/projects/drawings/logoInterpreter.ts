export interface LogoSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LogoResult {
  segments: LogoSegment[];
  errors: string[];
  finalState: { x: number; y: number; heading: number };
}

type Token = { kind: "word"; value: string } | { kind: "number"; value: number } | { kind: "lbracket" } | { kind: "rbracket" };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.split(/\n/);
  for (const line of lines) {
    const stripped = line.split(";")[0];
    const parts = stripped.match(/\[|\]|[A-Za-z]+|-?\d+(?:\.\d+)?/g);
    if (!parts) continue;
    for (const p of parts) {
      if (p === "[") tokens.push({ kind: "lbracket" });
      else if (p === "]") tokens.push({ kind: "rbracket" });
      else if (/^-?\d/.test(p)) tokens.push({ kind: "number", value: Number(p) });
      else tokens.push({ kind: "word", value: p.toUpperCase() });
    }
  }
  return tokens;
}

interface ParseState {
  tokens: Token[];
  pos: number;
  errors: string[];
}

interface CmdForward { kind: "forward"; distance: number }
interface CmdTurn { kind: "turn"; degrees: number }
interface CmdPen { kind: "pen"; down: boolean }
interface CmdHome { kind: "home" }
interface CmdRepeat { kind: "repeat"; count: number; body: Cmd[] }
type Cmd = CmdForward | CmdTurn | CmdPen | CmdHome | CmdRepeat;

function parseBlock(s: ParseState, stopAtRbracket: boolean): Cmd[] {
  const cmds: Cmd[] = [];
  while (s.pos < s.tokens.length) {
    const t = s.tokens[s.pos];
    if (t.kind === "rbracket") {
      if (stopAtRbracket) {
        s.pos++;
        return cmds;
      }
      s.errors.push("Unexpected ']'");
      s.pos++;
      continue;
    }
    if (t.kind !== "word") {
      s.errors.push(`Expected command, got ${JSON.stringify(t)}`);
      s.pos++;
      continue;
    }
    const word = t.value;
    s.pos++;
    if (word === "FORWARD" || word === "FD") {
      const n = expectNumber(s, word);
      if (n !== null) cmds.push({ kind: "forward", distance: n });
    } else if (word === "BACK" || word === "BK") {
      const n = expectNumber(s, word);
      if (n !== null) cmds.push({ kind: "forward", distance: -n });
    } else if (word === "RIGHT" || word === "RT") {
      const n = expectNumber(s, word);
      if (n !== null) cmds.push({ kind: "turn", degrees: n });
    } else if (word === "LEFT" || word === "LT") {
      const n = expectNumber(s, word);
      if (n !== null) cmds.push({ kind: "turn", degrees: -n });
    } else if (word === "PENUP" || word === "PU") {
      cmds.push({ kind: "pen", down: false });
    } else if (word === "PENDOWN" || word === "PD") {
      cmds.push({ kind: "pen", down: true });
    } else if (word === "HOME") {
      cmds.push({ kind: "home" });
    } else if (word === "REPEAT") {
      const count = expectNumber(s, word);
      if (count === null) continue;
      const next = s.tokens[s.pos];
      if (!next || next.kind !== "lbracket") {
        s.errors.push("Expected '[' after REPEAT count");
        continue;
      }
      s.pos++;
      const startPos = s.pos;
      const body = parseBlock(s, true);
      if (s.pos === startPos + countTokensUntilMissingRbracket(s, startPos)) {
        s.errors.push("REPEAT missing closing ']'");
      }
      cmds.push({ kind: "repeat", count: Math.max(0, Math.floor(count)), body });
    } else {
      s.errors.push(`Unknown command "${word}"`);
    }
  }
  if (stopAtRbracket) {
    s.errors.push("Missing closing ']'");
  }
  return cmds;
}

function countTokensUntilMissingRbracket(s: ParseState, start: number): number {
  return s.tokens.length - start;
}

function expectNumber(s: ParseState, word: string): number | null {
  const t = s.tokens[s.pos];
  if (!t || t.kind !== "number") {
    s.errors.push(`${word} expects a number`);
    return null;
  }
  s.pos++;
  return t.value;
}

function executeBlock(cmds: Cmd[], state: { x: number; y: number; heading: number; penDown: boolean }, segments: LogoSegment[]) {
  for (const c of cmds) {
    switch (c.kind) {
      case "forward": {
        const rad = (state.heading * Math.PI) / 180;
        const dx = Math.sin(rad) * c.distance;
        const dy = -Math.cos(rad) * c.distance;
        const nx = state.x + dx;
        const ny = state.y + dy;
        if (state.penDown) segments.push({ x1: state.x, y1: state.y, x2: nx, y2: ny });
        state.x = nx;
        state.y = ny;
        break;
      }
      case "turn":
        state.heading = ((state.heading + c.degrees) % 360 + 360) % 360;
        break;
      case "pen":
        state.penDown = c.down;
        break;
      case "home":
        state.x = 0;
        state.y = 0;
        state.heading = 0;
        break;
      case "repeat":
        for (let i = 0; i < c.count; i++) executeBlock(c.body, state, segments);
        break;
    }
  }
}

export function runLogoProgram(source: string): LogoResult {
  const tokens = tokenize(source);
  const ps: ParseState = { tokens, pos: 0, errors: [] };
  const cmds = parseBlock(ps, false);
  const state = { x: 0, y: 0, heading: 0, penDown: true };
  const segments: LogoSegment[] = [];
  executeBlock(cmds, state, segments);
  return { segments, errors: ps.errors, finalState: { x: state.x, y: state.y, heading: state.heading } };
}
