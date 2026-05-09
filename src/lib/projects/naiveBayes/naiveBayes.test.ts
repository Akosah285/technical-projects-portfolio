import { describe, it, expect } from "vitest";
import {
  NB_TEST_SET,
  NB_TRAINING_SET,
  classifyText,
  evaluateNb,
  tokenize,
  trainMultinomialNb,
} from "./naiveBayes";

describe("tokenize", () => {
  it("lowercases, splits on whitespace, and strips most punctuation", () => {
    expect(tokenize("Hello, World!")).toEqual(["hello", "world"]);
    expect(tokenize("It's a TEST")).toEqual(["it's", "a", "test"]);
    expect(tokenize("   spaced    out   ")).toEqual(["spaced", "out"]);
  });

  it("returns an empty array for empty / whitespace-only input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("   ")).toEqual([]);
  });

  it("rejects non-string input", () => {
    expect(() => tokenize(undefined as unknown as string)).toThrow();
  });
});

describe("trainMultinomialNb", () => {
  it("rejects empty training sets and bad alpha", () => {
    expect(() => trainMultinomialNb([], 1)).toThrow();
    expect(() => trainMultinomialNb([{ text: "a", label: "x" }], -1)).toThrow();
  });

  it("collects all labels and a sorted vocabulary", () => {
    const m = trainMultinomialNb([
      { text: "alpha beta", label: "x" },
      { text: "gamma alpha", label: "y" },
    ]);
    expect(m.labels).toEqual(["x", "y"]);
    expect(m.vocabulary).toEqual(["alpha", "beta", "gamma"]);
  });

  it("computes priors from class frequencies", () => {
    const m = trainMultinomialNb([
      { text: "a", label: "x" },
      { text: "a", label: "x" },
      { text: "a", label: "y" },
    ]);
    expect(Math.exp(m.logPrior["x"])).toBeCloseTo(2 / 3, 12);
    expect(Math.exp(m.logPrior["y"])).toBeCloseTo(1 / 3, 12);
  });

  it("Laplace smoothing makes every word in V have nonzero probability under every label", () => {
    const m = trainMultinomialNb(
      [
        { text: "alpha alpha alpha", label: "x" },
        { text: "beta beta", label: "y" },
      ],
      1,
    );
    // beta never appeared in label x, but with α=1 it still has finite log-prob
    expect(Number.isFinite(m.logPlw["x"]["beta"])).toBe(true);
    expect(Math.exp(m.logPlw["x"]["beta"])).toBeGreaterThan(0);
  });

  it("the conditional probabilities sum to 1 over the vocabulary for each label (sanity check)", () => {
    const m = trainMultinomialNb(
      [
        { text: "alpha beta gamma", label: "x" },
        { text: "alpha beta", label: "y" },
      ],
      1,
    );
    for (const label of m.labels) {
      const sum = m.vocabulary.reduce((acc, w) => acc + Math.exp(m.logPlw[label][w]), 0);
      expect(sum).toBeCloseTo(1, 6);
    }
  });
});

describe("classifyText", () => {
  it("classifies a clearly spam-flavoured message correctly", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    const r = classifyText(m, "Free prize winner click now");
    expect(r.predictedLabel).toBe("spam");
    expect(r.posterior["spam"]).toBeGreaterThan(0.9);
  });

  it("classifies a clearly ham message correctly", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    const r = classifyText(m, "Lunch at noon tomorrow");
    expect(r.predictedLabel).toBe("ham");
  });

  it("posteriors sum to 1 (after softmax)", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    const r = classifyText(m, "free meeting");
    const sum = Object.values(r.posterior).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 9);
  });

  it("returns a per-word contribution per label, in token order, with marker for OOV words", () => {
    const m = trainMultinomialNb([
      { text: "alpha alpha", label: "x" },
      { text: "beta", label: "y" },
    ]);
    const r = classifyText(m, "alpha unknownword");
    const contribs = r.wordContributions["x"];
    expect(contribs).toHaveLength(2);
    expect(contribs[0].word).toBe("alpha");
    expect(contribs[0].inVocabulary).toBe(true);
    expect(contribs[1].word).toBe("unknownword");
    expect(contribs[1].inVocabulary).toBe(false);
  });

  it("repeated words count multiple times (multinomial, not Bernoulli)", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    const single = classifyText(m, "free");
    const triple = classifyText(m, "free free free");
    // Posterior for spam should be higher when the same suspicious word is repeated.
    expect(triple.posterior["spam"]).toBeGreaterThanOrEqual(single.posterior["spam"]);
  });
});

describe("evaluateNb", () => {
  it("scores >= 80% accuracy on the bundled test set", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    const e = evaluateNb(m, NB_TEST_SET);
    expect(e.accuracy).toBeGreaterThanOrEqual(0.8);
    expect(e.perLabel["spam"].precision).toBeGreaterThan(0);
    expect(e.perLabel["ham"].precision).toBeGreaterThan(0);
  });

  it("rejects empty test sets", () => {
    const m = trainMultinomialNb(NB_TRAINING_SET);
    expect(() => evaluateNb(m, [])).toThrow();
  });
});

describe("smoothing α changes confidence", () => {
  it("smaller α produces a more peaked posterior on confident inputs", () => {
    const m1 = trainMultinomialNb(NB_TRAINING_SET, 1);
    const mTiny = trainMultinomialNb(NB_TRAINING_SET, 0.01);
    const r1 = classifyText(m1, "Free winner click now prize");
    const rTiny = classifyText(mTiny, "Free winner click now prize");
    expect(rTiny.posterior["spam"]).toBeGreaterThanOrEqual(r1.posterior["spam"]);
  });
});
