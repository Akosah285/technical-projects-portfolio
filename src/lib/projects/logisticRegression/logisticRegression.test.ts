import { describe, it, expect } from "vitest";
import {
  CLASSIFICATION_DATA,
  CLASSIFICATION_XS,
  CLASSIFICATION_YS,
  classify,
  crossEntropyCost,
  crossEntropyGradient,
  evaluate,
  predictProb,
  runLogisticRegression,
  sigmoid,
} from "./logisticRegression";

describe("sigmoid", () => {
  it("σ(0) = 0.5", () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 12);
  });

  it("σ(±large) saturates at 1 / 0", () => {
    expect(sigmoid(50)).toBeCloseTo(1, 10);
    expect(sigmoid(-50)).toBeCloseTo(0, 10);
  });

  it("is symmetric: σ(-z) = 1 − σ(z)", () => {
    for (const z of [-3, -1.5, 0.7, 4.2]) {
      expect(sigmoid(-z)).toBeCloseTo(1 - sigmoid(z), 12);
    }
  });
});

describe("predictions and classification", () => {
  it("predictProb yields σ(w0 + w1·x)", () => {
    expect(predictProb([0, 1], 0)).toBeCloseTo(0.5, 12);
    expect(predictProb([2, 1], -2)).toBeCloseTo(0.5, 12);
  });

  it("classify thresholds at 0.5 by default", () => {
    expect(classify([0, 1], 1)).toBe(1);
    expect(classify([0, 1], -1)).toBe(0);
  });

  it("classify accepts a custom threshold", () => {
    expect(classify([0, 1], 0.6, 0.7)).toBe(0);
    expect(classify([0, 1], 0.6, 0.4)).toBe(1);
  });
});

describe("cross-entropy cost and gradient", () => {
  it("cost is small for confident correct predictions", () => {
    const xs = [-5, -4, 4, 5];
    const ys: (0 | 1)[] = [0, 0, 1, 1];
    const c = crossEntropyCost([0, 1], xs, ys);
    expect(c).toBeLessThan(0.05);
  });

  it("cost is large for confident wrong predictions", () => {
    const xs = [-5, 5];
    const ys: (0 | 1)[] = [1, 0];
    const c = crossEntropyCost([0, 1], xs, ys);
    expect(c).toBeGreaterThan(2);
  });

  it("rejects non 0/1 labels and length mismatches", () => {
    expect(() => crossEntropyCost([0, 1], [1, 2], [1])).toThrow();
    expect(() => crossEntropyCost([0, 1], [1], [2 as 0])).toThrow();
  });

  it("gradient matches finite-difference numerical derivative", () => {
    const xs = [-2, -1, 0, 1, 2];
    const ys: (0 | 1)[] = [0, 0, 1, 1, 1];
    const w = [0.4, 0.7] as [number, number];
    const h = 1e-5;
    const num0 = (crossEntropyCost([w[0] + h, w[1]], xs, ys) - crossEntropyCost([w[0] - h, w[1]], xs, ys)) / (2 * h);
    const num1 = (crossEntropyCost([w[0], w[1] + h], xs, ys) - crossEntropyCost([w[0], w[1] - h], xs, ys)) / (2 * h);
    const an = crossEntropyGradient(w, xs, ys);
    expect(an[0]).toBeCloseTo(num0, 5);
    expect(an[1]).toBeCloseTo(num1, 5);
  });
});

describe("training", () => {
  it("converges to high accuracy on a separable dataset", () => {
    const hist = runLogisticRegression(
      { initialW: [0, 0], learningRate: 0.5, maxIters: 2000 },
      CLASSIFICATION_XS,
      CLASSIFICATION_YS,
    );
    const final = hist[hist.length - 1];
    const preds = CLASSIFICATION_XS.map((x) => classify(final.w, x));
    const cm = evaluate(CLASSIFICATION_YS, preds);
    expect(cm.accuracy).toBeGreaterThan(0.85);
  });

  it("cost decreases monotonically at a sane LR", () => {
    const hist = runLogisticRegression(
      { initialW: [0, 0], learningRate: 0.3, maxIters: 200 },
      CLASSIFICATION_XS,
      CLASSIFICATION_YS,
    );
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].cost).toBeLessThanOrEqual(hist[i - 1].cost + 1e-9);
    }
  });

  it("the recovered slope is positive (positive class is at high x)", () => {
    const hist = runLogisticRegression(
      { initialW: [0, 0], learningRate: 0.5, maxIters: 1500 },
      CLASSIFICATION_XS,
      CLASSIFICATION_YS,
    );
    expect(hist[hist.length - 1].w[1]).toBeGreaterThan(0.5);
  });

  it("rejects bad options", () => {
    expect(() => runLogisticRegression({ initialW: [NaN, 0], learningRate: 0.1, maxIters: 1 }, [1], [1])).toThrow();
    expect(() => runLogisticRegression({ initialW: [0, 0], learningRate: 0.1, maxIters: 0 }, [1], [1])).toThrow();
  });
});

describe("evaluate", () => {
  it("computes the four cells of the confusion matrix and accuracy", () => {
    const cm = evaluate([1, 1, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0]);
    expect(cm.truePositive).toBe(2);
    expect(cm.trueNegative).toBe(2);
    expect(cm.falsePositive).toBe(1);
    expect(cm.falseNegative).toBe(1);
    expect(cm.accuracy).toBeCloseTo(4 / 6, 12);
  });

  it("rejects mismatched lengths and empty inputs", () => {
    expect(() => evaluate([1], [])).toThrow();
    expect(() => evaluate([], [])).toThrow();
  });
});

describe("bundled dataset", () => {
  it("has at least 20 points and is roughly balanced", () => {
    expect(CLASSIFICATION_DATA.length).toBeGreaterThanOrEqual(20);
    const positives = CLASSIFICATION_YS.filter((y) => y === 1).length;
    expect(positives).toBeGreaterThan(5);
    expect(positives).toBeLessThan(CLASSIFICATION_DATA.length - 5);
  });
});
