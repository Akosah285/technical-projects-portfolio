import type { InputMode } from "./inputMode";

export function shouldAnimate(mode: InputMode, documentVisible: boolean): boolean {
  if (mode === "static") return false;
  return documentVisible;
}
