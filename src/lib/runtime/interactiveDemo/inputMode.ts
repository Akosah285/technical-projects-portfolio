export type InputMode = "interactive" | "auto-demo" | "static";

export interface InputModeContext {
  viewportWidth: number;
  hasTouch: boolean;
  prefersReducedMotion: boolean;
}

const MOBILE_BREAKPOINT_PX = 768;

export function decideInputMode(ctx: InputModeContext): InputMode {
  if (ctx.prefersReducedMotion) return "static";
  if (ctx.hasTouch && ctx.viewportWidth < MOBILE_BREAKPOINT_PX) {
    return "auto-demo";
  }
  return "interactive";
}
