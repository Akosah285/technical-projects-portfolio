"use client";

import { useEffect, useState } from "react";
import {
  initialGameState,
  step,
  type GameState,
  type Player,
} from "@/lib/projects/reactionGame/reactionGame";

const TICK_MS = 30;

const PHASE_DESC: Record<GameState["phase"], string> = {
  idle: "Idle — press a button to start the countdown.",
  countdown: "Countdown — start light blinking 3 times. Buttons ignored.",
  ready: "READY! First press wins.",
  celebrate: "Celebrating winner — flicker x10.",
};

function Led({ on, label, color }: { on: boolean; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-14 w-14 rounded-full border-4 transition-shadow"
        style={{
          background: on ? color : "#1f1f1f",
          borderColor: on ? color : "#3f3f3f",
          boxShadow: on ? `0 0 24px 6px ${color}66` : "none",
        }}
      />
      <span className="text-xs font-mono text-foreground/70">{label}</span>
    </div>
  );
}

export function ReactionGamePlayer() {
  const [state, setState] = useState<GameState>(() => initialGameState());
  const [history, setHistory] = useState<Array<{ winner: Player; ms: number }>>([]);

  // Tick driver
  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => step(s, { kind: "tick", ms: TICK_MS }));
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  function press(player: Player) {
    setState((prev) => {
      const next = step(prev, { kind: "press", player });
      if (
        prev.phase !== "celebrate" &&
        next.phase === "celebrate" &&
        next.winner !== null &&
        next.reactionMs !== null
      ) {
        const winner = next.winner;
        const ms = next.reactionMs;
        setTimeout(() => {
          setHistory((h) => [...h, { winner, ms }].slice(-10));
        }, 0);
      }
      return next;
    });
  }

  function reset() {
    setState(initialGameState());
    setHistory([]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Reaction-time game</h2>
        <p className="text-sm text-foreground/70">
          A 4-state FSM lifted from the original C source — IDLE → COUNTDOWN → READY →
          CELEBRATE. The countdown blinks the start LED 3 times (~3.3 s); the moment it
          stays lit again, the first player to press their button wins. Try to beat your
          best reaction time.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4">
        <div className="flex items-end justify-around">
          <Led on={state.p1Led} label="P1 (PORTB0)" color="#3b82f6" />
          <Led on={state.startLed} label="START (PORTB1)" color="#fde047" />
          <Led on={state.p2Led} label="P2 (PORTB2)" color="#ef4444" />
        </div>
        <div className="mt-4 flex justify-around">
          <button
            onClick={() => press("p1")}
            className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow active:translate-y-0.5"
          >
            Player 1 button
          </button>
          <button
            onClick={() => press("p2")}
            className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow active:translate-y-0.5"
          >
            Player 2 button
          </button>
        </div>
      </section>

      <section className="rounded-md border border-foreground/15 p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              current phase
            </div>
            <div className="font-mono text-base">{state.phase}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              elapsed (round)
            </div>
            <div className="font-mono text-base">
              {(state.timeMs - state.phaseStartMs) | 0} ms
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              last reaction
            </div>
            <div className="font-mono text-base">
              {state.reactionMs !== null ? `${state.reactionMs} ms` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60">
              winner
            </div>
            <div className="font-mono text-base">
              {state.winner ? state.winner.toUpperCase() : "—"}
            </div>
          </div>
          <button
            onClick={reset}
            className="rounded border border-foreground/20 px-3 py-1 text-sm"
          >
            Reset
          </button>
        </div>
        <p className="mt-2 text-xs text-foreground/60">{PHASE_DESC[state.phase]}</p>
      </section>

      <section className="rounded-md border border-foreground/15 p-3 text-sm">
        <div className="text-xs uppercase tracking-wide text-foreground/60">
          last 10 rounds
        </div>
        {history.length === 0 ? (
          <div className="mt-2 text-sm text-foreground/60">No rounds yet.</div>
        ) : (
          <ol className="mt-2 space-y-1 font-mono text-xs">
            {history
              .slice()
              .reverse()
              .map((r, i) => (
                <li key={`${r.ms}-${i}`}>
                  <span
                    style={{ color: r.winner === "p1" ? "#3b82f6" : "#ef4444" }}
                    className="font-semibold"
                  >
                    {r.winner.toUpperCase()}
                  </span>{" "}
                  — {r.ms} ms
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
