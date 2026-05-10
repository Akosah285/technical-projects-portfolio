export const COURSE_GLYPH: Record<string, string> = {
  "intro-to-programming": "λ",
  "problem-solving-oop": "{ }",
  "machine-learning": "Σ",
  "embedded-systems": "⚡",
  "digital-electronics": "⏚",
  mechatronics: "⚙",
  "microprocessors-engineered-systems": "μP",
};

export type CourseTone = "blue" | "emerald" | "pink" | "amber";

export const COURSE_TONE: Record<string, CourseTone> = {
  "intro-to-programming": "blue",
  "problem-solving-oop": "emerald",
  "machine-learning": "pink",
  "embedded-systems": "amber",
  "digital-electronics": "blue",
  mechatronics: "emerald",
  "microprocessors-engineered-systems": "pink",
};

export function getCourseTone(slug: string): CourseTone {
  return COURSE_TONE[slug] ?? "blue";
}

export function getCourseGlyph(slug: string): string {
  return COURSE_GLYPH[slug] ?? "•";
}

/** First sentence (or first n chars) — for card teasers. */
export function teaser(text: string, max = 160): string {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  if (firstSentence.length <= max) return firstSentence;
  return firstSentence.slice(0, max).replace(/[\s,;]+\S*$/, "") + "…";
}
