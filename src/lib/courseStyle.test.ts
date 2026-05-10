import { describe, it, expect } from "vitest";
import { teaser, getCourseTone, getCourseGlyph } from "./courseStyle";

describe("teaser", () => {
  it("returns the first sentence intact when short", () => {
    expect(teaser("A short opener. Then more detail later.")).toBe(
      "A short opener.",
    );
  });

  it("truncates long single-sentence text at the word boundary", () => {
    const long =
      "This is a very long single sentence that goes on and on without any natural breakpoint for ages and ages until it eventually finishes after about two hundred characters of meandering technical prose";
    const out = teaser(long, 80);
    expect(out.length).toBeLessThanOrEqual(81);
    expect(out.endsWith("…")).toBe(true);
  });

  it("preserves text that fits in the limit", () => {
    expect(teaser("Short.")).toBe("Short.");
  });
});

describe("getCourseTone / getCourseGlyph", () => {
  it("returns the registered tone for known courses", () => {
    expect(getCourseTone("intro-to-programming")).toBe("blue");
    expect(getCourseTone("microprocessors-engineered-systems")).toBe("pink");
  });

  it("falls back to blue for unknown course slugs", () => {
    expect(getCourseTone("not-a-course")).toBe("blue");
  });

  it("returns the registered glyph for known courses", () => {
    expect(getCourseGlyph("microprocessors-engineered-systems")).toBe("μP");
  });

  it("falls back to a bullet for unknown course slugs", () => {
    expect(getCourseGlyph("not-a-course")).toBe("•");
  });
});
