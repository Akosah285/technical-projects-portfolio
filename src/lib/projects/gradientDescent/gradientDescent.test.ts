import { describe, it, expect } from "vitest";
import {
  cost,
  grad,
  runGradientDescent,
  sampleCostCurve,
} from "./gradientDescent";

describe("gradient descent on HW1 cost g(w)=(w^4+w^2+10w-50)/50", () => {
  it("computes the cost correctly at a few sample points", () => {
    expect(cost(0)).toBeCloseTo(-1, 10);
    expect(cost(1)).toBeCloseTo((1 + 1 + 10 - 50) / 50, 10);
    expect(cost(-1)).toBeCloseTo((1 + 1 - 10 - 50) / 50, 10);
  });

  it("computes the gradient correctly at a few sample points", () => {
    expect(grad(0)).toBeCloseTo(10 / 50, 10);
    expect(grad(1)).toBeCloseTo((4 + 2 + 10) / 50, 10);
    expect(grad(-1)).toBeCloseTo((-4 - 2 + 10) / 50, 10);
  });

  it("the gradient matches a numerical finite-difference approximation", () => {
    const h = 1e-6;
    for (const w of [-3, -1.2, 0.5, 2.7]) {
      const numerical = (cost(w + h) - cost(w - h)) / (2 * h);
      expect(grad(w)).toBeCloseTo(numerical, 5);
    }
  });

  it("runGradientDescent returns the initial step at iter 0", () => {
    const hist = runGradientDescent({ initialW: 2, learningRate: 0.1, maxIters: 5 });
    expect(hist[0]).toEqual({ iter: 0, w: 2, cost: cost(2) });
  });

  it("runGradientDescent produces maxIters + 1 steps", () => {
    const hist = runGradientDescent({ initialW: 2, learningRate: 0.1, maxIters: 50 });
    expect(hist).toHaveLength(51);
  });

  it("converges close to the true minimum (~ -1.2347) from a typical start", () => {
    // Minimum is the real root of 2w^3 + w + 5 = 0, which is w ≈ -1.23477.
    const hist = runGradientDescent({ initialW: 2, learningRate: 0.5, maxIters: 5000 });
    const final = hist[hist.length - 1];
    expect(final.w).toBeCloseTo(-1.2347, 3);
  });

  it("strictly decreases the cost each step at a reasonable learning rate", () => {
    const hist = runGradientDescent({ initialW: 3, learningRate: 0.2, maxIters: 200 });
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].cost).toBeLessThanOrEqual(hist[i - 1].cost + 1e-12);
    }
  });

  it("bails out early on NaN/Infinity for diverging learning rate", () => {
    const hist = runGradientDescent({ initialW: 10, learningRate: 100, maxIters: 100 });
    expect(Number.isFinite(hist[hist.length - 1].w)).toBe(false);
  });

  it("rejects nonfinite parameters", () => {
    expect(() => runGradientDescent({ initialW: NaN, learningRate: 0.1, maxIters: 1 })).toThrow();
    expect(() => runGradientDescent({ initialW: 0, learningRate: Infinity, maxIters: 1 })).toThrow();
  });

  it("rejects non-positive iteration counts", () => {
    expect(() => runGradientDescent({ initialW: 0, learningRate: 0.1, maxIters: 0 })).toThrow();
    expect(() => runGradientDescent({ initialW: 0, learningRate: 0.1, maxIters: 1.5 })).toThrow();
  });

  it("sampleCostCurve emits exactly `resolution` points and spans the range", () => {
    const pts = sampleCostCurve(-3, 3, 11);
    expect(pts).toHaveLength(11);
    expect(pts[0].w).toBeCloseTo(-3, 10);
    expect(pts[10].w).toBeCloseTo(3, 10);
    expect(pts[5].w).toBeCloseTo(0, 10);
  });

  it("sampleCostCurve rejects bad bounds and tiny resolution", () => {
    expect(() => sampleCostCurve(0, 0, 5)).toThrow();
    expect(() => sampleCostCurve(0, 1, 1)).toThrow();
  });
});
