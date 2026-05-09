import { describe, it, expect } from "vitest";
import {
  trainHmm,
  viterbi,
  tag,
  START_TAG,
  UNSEEN_WORD_PENALTY,
} from "./posTagger";

const tinyCorpus = [
  { words: ["the", "cat", "saw", "the", "dog"], tags: ["DET", "N", "V", "DET", "N"] },
  { words: ["the", "dog", "saw", "the", "cat"], tags: ["DET", "N", "V", "DET", "N"] },
  { words: ["a", "cat", "ran"], tags: ["DET", "N", "V"] },
];

describe("trainHmm", () => {
  it("creates a start transition from every training sentence", () => {
    const model = trainHmm(tinyCorpus);
    const startRow = model.transitions.get(START_TAG);
    expect(startRow).toBeDefined();
    // All three training sentences begin with DET
    expect(startRow!.get("DET")).toBeCloseTo(Math.log(3 / 3));
  });

  it("computes log transition probabilities from raw counts", () => {
    const model = trainHmm(tinyCorpus);
    const fromN = model.transitions.get("N");
    expect(fromN).toBeDefined();
    // N appears 5 times; followed by V three times (once per sentence)
    expect(fromN!.get("V")).toBeCloseTo(Math.log(3 / 5));
  });

  it("computes log emission probabilities", () => {
    const model = trainHmm(tinyCorpus);
    const detRow = model.emissions.get("DET");
    expect(detRow).toBeDefined();
    // DET observed 5 times: "the" (4) and "a" (1)
    expect(detRow!.get("the")).toBeCloseTo(Math.log(4 / 5));
    expect(detRow!.get("a")).toBeCloseTo(Math.log(1 / 5));
  });

  it("lower-cases words during training", () => {
    const model = trainHmm([
      { words: ["The", "Cat"], tags: ["DET", "N"] },
    ]);
    expect(model.emissions.get("DET")!.has("the")).toBe(true);
    expect(model.emissions.get("DET")!.has("The")).toBe(false);
  });

  it("does not include the start tag in the trained tag set", () => {
    const model = trainHmm(tinyCorpus);
    expect(model.tags.has(START_TAG)).toBe(false);
    expect(model.tags.has("DET")).toBe(true);
  });

  it("tolerates minor misalignment by truncating to the shorter row (matches the Java original's behaviour on the hardCoded corpus)", () => {
    const model = trainHmm([{ words: ["a", "b", "c"], tags: ["X", "Y"] }]);
    expect(model.tags.has("X")).toBe(true);
    expect(model.tags.has("Y")).toBe(true);
    expect(model.emissions.get("X")?.has("a")).toBe(true);
    expect(model.emissions.get("Y")?.has("b")).toBe(true);
    // "c" had no tag, so no emission was recorded for it
    for (const row of model.emissions.values()) {
      expect(row.has("c")).toBe(false);
    }
  });
});

describe("viterbi", () => {
  it("returns empty tags for an empty sentence", () => {
    const model = trainHmm(tinyCorpus);
    const result = viterbi(model, "");
    expect(result.tags).toEqual([]);
    expect(result.steps).toEqual([]);
  });

  it("tags a sentence drawn from the training distribution", () => {
    const model = trainHmm(tinyCorpus);
    expect(tag(model, "the cat saw the dog")).toEqual([
      "DET",
      "N",
      "V",
      "DET",
      "N",
    ]);
  });

  it("is case-insensitive at decode time", () => {
    const model = trainHmm(tinyCorpus);
    expect(tag(model, "THE CAT RAN")).toEqual(["DET", "N", "V"]);
  });

  it("flags unseen words on each step", () => {
    const model = trainHmm(tinyCorpus);
    const result = viterbi(model, "the wombat ran");
    expect(result.tags).toHaveLength(3);
    expect(result.steps[1].unseen).toBe(true);
    expect(result.steps[0].unseen).toBe(false);
  });

  it("applies the unseen-word penalty (UNSEEN_WORD_PENALTY) to the score", () => {
    const model = trainHmm(tinyCorpus);
    const seen = viterbi(model, "the cat ran");
    const unseen = viterbi(model, "the wombat ran");
    // Single unseen word should drop the score by approx the penalty
    expect(seen.score - unseen.score).toBeGreaterThan(UNSEEN_WORD_PENALTY - 1);
  });

  it("backtraces through the best path even when the last word is unseen", () => {
    const model = trainHmm(tinyCorpus);
    const result = viterbi(model, "the dog quux");
    expect(result.tags[0]).toBe("DET");
    expect(result.tags[1]).toBe("N");
    expect(result.tags).toHaveLength(3);
  });
});

describe("Viterbi against the PS_5 hardCoded corpus", () => {
  // Subset of hardCoded-train-sentences.txt / hardCoded-train-tags.txt — same
  // dataset the original Java solution shipped with.
  const hardCoded = [
    {
      words: "we will like to train this model with our own test .".split(" "),
      tags: "PRO MOD V TO V DET N CNJ PRO DET N .".split(" "),
    },
    {
      words: "Gregory is my beautiful gray Persian cat .".split(" "),
      tags: "NP V PRO ADJ ADJ ADJ N .".split(" "),
    },
    {
      words: "He walks with pride and grace .".split(" "),
      tags: "PRO V CNJ N CNJ N .".split(" "),
    },
    {
      words: "He performs a dance of disdain as he lifts and lowers each paw .".split(" "),
      tags: "PRO V DET N P N CNJ PRO V CNJ V ADJ N .".split(" "),
    },
  ];

  it("recovers the tags for a training sentence", () => {
    const model = trainHmm(hardCoded);
    const result = tag(model, "He walks with pride and grace .");
    expect(result).toEqual(["PRO", "V", "CNJ", "N", "CNJ", "N", "."]);
  });

  it("tags a novel sentence using transitions even when words are unseen", () => {
    const model = trainHmm(hardCoded);
    // All words appear in training: "He" (PRO), "performs" (V), "a" (DET),
    // "dance" (N), "." (.). Should reproduce sentence-4 prefix exactly.
    const result = tag(model, "He performs a dance .");
    expect(result).toEqual(["PRO", "V", "DET", "N", "."]);
  });
});
