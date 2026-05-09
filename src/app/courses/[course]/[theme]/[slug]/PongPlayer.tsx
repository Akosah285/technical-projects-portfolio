"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  pongInit,
  pongTick,
  type PongInput,
  type PongState,
} from "@/lib/projects/pong/physics";
import {
  decideInputMode,
  type InputMode,
} from "@/lib/runtime/interactiveDemo/inputMode";
import { autoDemoInput } from "@/lib/runtime/interactiveDemo/autoDemoInput";
import { shouldAnimate } from "@/lib/runtime/interactiveDemo/shouldAnimate";

const TICK_INTERVAL_MS = 20; // 50 fps to match the original cs1lib framerate
const CANVAS_BG = "#0b1020";
const PADDLE_LEFT_COLOR = "rgba(255, 255, 255, 0.85)";
const PADDLE_RIGHT_COLOR = "rgba(255, 255, 255, 0.55)";
const BALL_COLOR = "#fef08a";
const NET_COLOR = "rgba(255, 255, 255, 0.15)";

function detectInputMode(): InputMode {
  if (typeof window === "undefined") return "interactive";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasTouch =
    "ontouchstart" in window ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
  return decideInputMode({
    viewportWidth: window.innerWidth,
    hasTouch,
    prefersReducedMotion: reduced,
  });
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  state: PongState,
  mode: InputMode,
) {
  const { config, paddleLeft, paddleRight, ball, score, phase } = state;
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, config.width, config.height);

  // center net (dashed line)
  ctx.strokeStyle = NET_COLOR;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(config.width / 2, 10);
  ctx.lineTo(config.width / 2, config.height - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // paddles
  ctx.fillStyle = PADDLE_LEFT_COLOR;
  ctx.fillRect(paddleLeft.x, paddleLeft.y, config.paddleWidth, config.paddleHeight);
  ctx.fillStyle = PADDLE_RIGHT_COLOR;
  ctx.fillRect(
    paddleRight.x,
    paddleRight.y,
    config.paddleWidth,
    config.paddleHeight,
  );

  // ball
  ctx.fillStyle = BALL_COLOR;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, config.ballRadius, 0, Math.PI * 2);
  ctx.fill();

  // score
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(String(score.left), config.width * 0.25, 18);
  ctx.fillText(String(score.right), config.width * 0.75, 18);

  // overlay text
  if (phase === "idle") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(
      mode === "interactive"
        ? "Press Space to serve"
        : mode === "auto-demo"
          ? "Auto-demo running…"
          : "Static preview",
      config.width / 2,
      config.height / 2 - 12,
    );
  } else if (phase === "game-over") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 22px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("Game Over", config.width / 2, config.height / 2 - 30);
    ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(
      mode === "interactive" ? "Press Space to play again" : "Restarting…",
      config.width / 2,
      config.height / 2 + 4,
    );
  }
}

interface KeyState {
  a: boolean;
  z: boolean;
  k: boolean;
  m: boolean;
  spacePending: boolean;
}

function buildKeyboardInput(keys: KeyState): PongInput {
  const input: PongInput = {
    leftUp: keys.a,
    leftDown: keys.z,
    rightUp: keys.k,
    rightDown: keys.m,
    start: keys.spacePending,
  };
  return input;
}

export function PongPlayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialState = useMemo<PongState>(() => pongInit(undefined, 7), []);
  const [state, setState] = useState<PongState>(initialState);
  const stateRef = useRef<PongState>(initialState);

  const [mode, setMode] = useState<InputMode>("interactive");
  const [documentVisible, setDocumentVisible] = useState<boolean>(true);

  const keysRef = useRef<KeyState>({
    a: false,
    z: false,
    k: false,
    m: false,
    spacePending: false,
  });

  // Detect input mode on mount + on resize
  useEffect(() => {
    const update = () => setMode(detectInputMode());
    update();
    window.addEventListener("resize", update);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  // Track tab visibility so the loop pauses while hidden
  useEffect(() => {
    const onChange = () =>
      setDocumentVisible(document.visibilityState === "visible");
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  // Keyboard listeners (interactive mode only)
  useEffect(() => {
    if (mode !== "interactive") return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = keysRef.current;
      if (k === "a") keys.a = true;
      else if (k === "z") keys.z = true;
      else if (k === "k") keys.k = true;
      else if (k === "m") keys.m = true;
      else if (k === " " || e.code === "Space") {
        keys.spacePending = true;
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = keysRef.current;
      if (k === "a") keys.a = false;
      else if (k === "z") keys.z = false;
      else if (k === "k") keys.k = false;
      else if (k === "m") keys.m = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [mode]);

  // Animation loop
  useEffect(() => {
    if (!shouldAnimate(mode, documentVisible)) return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      while (now - last >= TICK_INTERVAL_MS) {
        const input =
          mode === "auto-demo"
            ? autoDemoInput(stateRef.current)
            : buildKeyboardInput(keysRef.current);
        const next = pongTick(stateRef.current, input);
        stateRef.current = next;
        keysRef.current.spacePending = false;
        last += TICK_INTERVAL_MS;
      }
      setState(stateRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, documentVisible]);

  // Render the canvas whenever state changes (or on mode change for overlay text)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(ctx, state, mode);
  }, [state, mode]);

  const handleStartButton = useCallback(() => {
    keysRef.current.spacePending = true;
  }, []);

  const reset = useCallback(() => {
    const fresh = pongInit(undefined, 7);
    stateRef.current = fresh;
    setState(fresh);
  }, []);

  const config = state.config;
  const ariaLabel = `Pong canvas: left ${state.score.left}, right ${state.score.right}, ${state.phase}`;

  return (
    <section
      ref={containerRef}
      className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Play it</h2>
        <span className="text-sm text-foreground/60">{modeLabel(mode)}</span>
      </div>

      <div className="overflow-hidden rounded-xl">
        <canvas
          ref={canvasRef}
          width={config.width}
          height={config.height}
          aria-label={ariaLabel}
          role="img"
          className="block aspect-square w-full max-w-[480px] mx-auto"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleStartButton}
          className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90"
        >
          {state.phase === "playing" ? "Serve" : "Start / Serve"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-foreground/15 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          Reset
        </button>
        <span className="ml-auto text-xs tabular-nums text-foreground/60">
          score {state.score.left} – {state.score.right}
        </span>
      </div>

      {mode === "interactive" && (
        <p className="text-xs text-foreground/60">
          Controls: <kbd className="rounded bg-foreground/10 px-1">A</kbd> /
          <kbd className="rounded bg-foreground/10 px-1 ml-1">Z</kbd> for the
          left paddle,{" "}
          <kbd className="rounded bg-foreground/10 px-1">K</kbd> /
          <kbd className="rounded bg-foreground/10 px-1 ml-1">M</kbd> for the
          right paddle, <kbd className="rounded bg-foreground/10 px-1">Space</kbd>{" "}
          to serve. Click the button if your browser hasn&apos;t focused the
          page yet.
        </p>
      )}
      {mode === "auto-demo" && (
        <p className="text-xs text-foreground/60">
          Auto-demo mode: the game plays itself on touch devices. For full
          keyboard control (A/Z and K/M), open this page on a desktop.
        </p>
      )}
      {mode === "static" && (
        <p className="text-xs text-foreground/60">
          Reduced-motion preference detected — showing a static frame instead of
          animating. Disable the OS reduced-motion setting to play.
        </p>
      )}
    </section>
  );
}

function modeLabel(mode: InputMode): string {
  switch (mode) {
    case "interactive":
      return "interactive";
    case "auto-demo":
      return "auto-demo (mobile fallback)";
    case "static":
      return "static (reduced motion)";
  }
}
