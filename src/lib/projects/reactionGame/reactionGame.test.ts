import { describe, it, expect } from "vitest";
import {
  CELEBRATE_DURATION_MS,
  COUNTDOWN_DURATION_MS,
  initialGameState,
  step,
  type Event,
  type GameState,
} from "./reactionGame";

function feed(state: GameState, events: Event[]): GameState {
  return events.reduce((s, e) => step(s, e), state);
}

describe("initialGameState", () => {
  it("starts idle with the start LED lit", () => {
    const s = initialGameState();
    expect(s.phase).toBe("idle");
    expect(s.startLed).toBe(true);
    expect(s.p1Led).toBe(false);
    expect(s.p2Led).toBe(false);
    expect(s.winner).toBeNull();
    expect(s.reactionMs).toBeNull();
  });
});

describe("idle → countdown", () => {
  it("either player's first press starts countdown", () => {
    const s = step(initialGameState(), { kind: "press", player: "p1" });
    expect(s.phase).toBe("countdown");

    const s2 = step(initialGameState(), { kind: "press", player: "p2" });
    expect(s2.phase).toBe("countdown");
  });

  it("clears any previous winner / reaction when starting a new round", () => {
    const tainted: GameState = {
      ...initialGameState(),
      winner: "p1",
      reactionMs: 350,
    };
    const s = step(tainted, { kind: "press", player: "p2" });
    expect(s.winner).toBeNull();
    expect(s.reactionMs).toBeNull();
  });
});

describe("countdown", () => {
  it("ignores button presses during countdown", () => {
    let s = step(initialGameState(), { kind: "press", player: "p1" });
    s = step(s, { kind: "press", player: "p2" });
    expect(s.phase).toBe("countdown");
    expect(s.winner).toBeNull();
  });

  it("transitions to READY exactly after the countdown duration", () => {
    let s = step(initialGameState(), { kind: "press", player: "p1" });
    s = step(s, { kind: "tick", ms: COUNTDOWN_DURATION_MS - 10 });
    expect(s.phase).toBe("countdown");
    s = step(s, { kind: "tick", ms: 20 });
    expect(s.phase).toBe("ready");
    expect(s.startLed).toBe(true);
  });
});

describe("ready → celebrate", () => {
  function reachReady(): GameState {
    let s = step(initialGameState(), { kind: "press", player: "p1" });
    s = step(s, { kind: "tick", ms: COUNTDOWN_DURATION_MS });
    return s;
  }

  it("first press wins and reaction time is measured from READY entry", () => {
    let s = reachReady();
    s = step(s, { kind: "tick", ms: 250 });
    s = step(s, { kind: "press", player: "p2" });
    expect(s.phase).toBe("celebrate");
    expect(s.winner).toBe("p2");
    expect(s.reactionMs).toBe(250);
    expect(s.p2Led).toBe(true);
    expect(s.p1Led).toBe(false);
  });

  it("second press is ignored once a winner is determined", () => {
    let s = reachReady();
    s = step(s, { kind: "tick", ms: 100 });
    s = step(s, { kind: "press", player: "p1" });
    expect(s.winner).toBe("p1");
    s = step(s, { kind: "press", player: "p2" });
    expect(s.winner).toBe("p1"); // unchanged
  });
});

describe("celebrate → idle", () => {
  function reachCelebrate(): GameState {
    let s = step(initialGameState(), { kind: "press", player: "p1" });
    s = step(s, { kind: "tick", ms: COUNTDOWN_DURATION_MS });
    s = step(s, { kind: "tick", ms: 200 });
    s = step(s, { kind: "press", player: "p2" });
    return s;
  }

  it("returns to idle after the flicker duration is over", () => {
    let s = reachCelebrate();
    s = step(s, { kind: "tick", ms: CELEBRATE_DURATION_MS });
    expect(s.phase).toBe("idle");
    expect(s.startLed).toBe(true);
  });

  it("during celebrate, the winner LED flickers and the loser stays dark", () => {
    let s = reachCelebrate();
    // Sample several time points within the celebration
    let winnerLitOnce = false;
    let winnerDarkOnce = false;
    for (let dt = 0; dt < CELEBRATE_DURATION_MS; dt += 50) {
      s = step(s, { kind: "tick", ms: 50 });
      if (s.phase !== "celebrate") break;
      expect(s.p1Led).toBe(false); // loser stays dark
      if (s.p2Led) winnerLitOnce = true;
      else winnerDarkOnce = true;
    }
    expect(winnerLitOnce).toBe(true);
    expect(winnerDarkOnce).toBe(true);
  });
});

describe("end-to-end happy path", () => {
  it("idle → countdown → ready → celebrate → idle, with reaction recorded", () => {
    let s = initialGameState();
    s = feed(s, [
      { kind: "press", player: "p1" },
      { kind: "tick", ms: COUNTDOWN_DURATION_MS },
      { kind: "tick", ms: 180 },
      { kind: "press", player: "p1" },
      { kind: "tick", ms: CELEBRATE_DURATION_MS },
    ]);
    expect(s.phase).toBe("idle");
    expect(s.winner).toBe("p1");
    expect(s.reactionMs).toBe(180);
  });
});
