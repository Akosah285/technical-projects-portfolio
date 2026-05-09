import { describe, it, expect } from "vitest";
import { decideInputMode } from "./inputMode";

describe("decideInputMode", () => {
  it("returns 'interactive' on a wide viewport with no touch", () => {
    const mode = decideInputMode({
      viewportWidth: 1280,
      hasTouch: false,
      prefersReducedMotion: false,
    });

    expect(mode).toBe("interactive");
  });

  it("returns 'auto-demo' on a narrow touch viewport (mobile/tablet portrait)", () => {
    const mode = decideInputMode({
      viewportWidth: 414,
      hasTouch: true,
      prefersReducedMotion: false,
    });

    expect(mode).toBe("auto-demo");
  });

  it("returns 'interactive' on a wide touch viewport (laptop with touchscreen)", () => {
    const mode = decideInputMode({
      viewportWidth: 1366,
      hasTouch: true,
      prefersReducedMotion: false,
    });

    expect(mode).toBe("interactive");
  });

  it("returns 'static' when the visitor prefers reduced motion (overrides everything)", () => {
    const mobile = decideInputMode({
      viewportWidth: 414,
      hasTouch: true,
      prefersReducedMotion: true,
    });
    const desktop = decideInputMode({
      viewportWidth: 1280,
      hasTouch: false,
      prefersReducedMotion: true,
    });

    expect(mobile).toBe("static");
    expect(desktop).toBe("static");
  });

  it("treats a narrow non-touch viewport as 'interactive' (resized desktop window)", () => {
    const mode = decideInputMode({
      viewportWidth: 500,
      hasTouch: false,
      prefersReducedMotion: false,
    });

    expect(mode).toBe("interactive");
  });
});
