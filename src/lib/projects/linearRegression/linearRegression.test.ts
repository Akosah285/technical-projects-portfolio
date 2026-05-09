import { describe, it, expect } from "vitest";
import {
  KLEIBER_DATA,
  KLEIBER_LOG_XS,
  KLEIBER_LOG_YS,
  ladSubgradient,
  leastAbsoluteDeviationCost,
  leastSquaresCost,
  leastSquaresGradient,
  olsClosedForm,
  predict,
  predictAll,
  runRegression,
} from "./linearRegression";

describe("linear regression deep module (HW2)", () => {
  it("predict and predictAll compute y_hat = w0 + w1 * x", () => {
    expect(predict([1, 2], 3)).toBe(7);
    expect(predictAll([0, 1], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("least-squares cost is the mean of squared residuals", () => {
    expect(leastSquaresCost([0, 1], [1, 2, 3], [1, 2, 3])).toBeCloseTo(0, 12);
    expect(leastSquaresCost([0, 0], [1, 2, 3], [1, 2, 3])).toBeCloseTo((1 + 4 + 9) / 3, 12);
  });

  it("least-absolute-deviation cost is the mean of |residual|", () => {
    expect(leastAbsoluteDeviationCost([0, 0], [1, 2, 3], [1, 2, 3])).toBeCloseTo((1 + 2 + 3) / 3, 12);
  });

  it("rejects mismatched x/y arrays and empty inputs", () => {
    expect(() => leastSquaresCost([0, 0], [1, 2], [1])).toThrow();
    expect(() => leastSquaresCost([0, 0], [], [])).toThrow();
  });

  it("LSE gradient matches numerical finite differences", () => {
    const xs = [1, 2, 3, 4, 5];
    const ys = [2, 3, 5, 7, 11];
    const w = [0.5, 1.2] as [number, number];
    const h = 1e-5;
    const numerical0 = (leastSquaresCost([w[0] + h, w[1]], xs, ys) - leastSquaresCost([w[0] - h, w[1]], xs, ys)) / (2 * h);
    const numerical1 = (leastSquaresCost([w[0], w[1] + h], xs, ys) - leastSquaresCost([w[0], w[1] - h], xs, ys)) / (2 * h);
    const analytic = leastSquaresGradient(w, xs, ys);
    expect(analytic[0]).toBeCloseTo(numerical0, 4);
    expect(analytic[1]).toBeCloseTo(numerical1, 4);
  });

  it("LAD subgradient is zero exactly at a perfect fit", () => {
    const xs = [1, 2, 3];
    const ys = [3, 5, 7];
    const w = [1, 2] as [number, number]; // exact fit
    const g = ladSubgradient(w, xs, ys);
    expect(g[0]).toBe(0);
    expect(g[1]).toBe(0);
  });

  it("runRegression with LSE recovers the planted line on noiseless data", () => {
    const xs = [0, 1, 2, 3, 4, 5];
    const ys = xs.map((x) => 3 + 2 * x);
    const hist = runRegression({ initialW: [0, 0], learningRate: 0.05, maxIters: 5000, costFn: "lse" }, xs, ys);
    const final = hist[hist.length - 1];
    expect(final.w[0]).toBeCloseTo(3, 1);
    expect(final.w[1]).toBeCloseTo(2, 1);
  });

  it("runRegression cost decreases monotonically at a sane LR", () => {
    const xs = [0, 1, 2, 3, 4, 5];
    const ys = xs.map((x) => 1 + 0.5 * x);
    const hist = runRegression({ initialW: [0, 0], learningRate: 0.05, maxIters: 200, costFn: "lse" }, xs, ys);
    for (let i = 1; i < hist.length; i++) {
      expect(hist[i].cost).toBeLessThanOrEqual(hist[i - 1].cost + 1e-9);
    }
  });

  it("runRegression bails out cleanly when LR is way too big", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = xs.map((x) => 1 + x);
    const hist = runRegression({ initialW: [0, 0], learningRate: 1e6, maxIters: 50, costFn: "lse" }, xs, ys);
    const final = hist[hist.length - 1];
    // Either weights diverged to non-finite OR the cost has exploded.
    const diverged = !Number.isFinite(final.w[0]) || !Number.isFinite(final.w[1]);
    const exploded = final.cost > 1e6;
    expect(diverged || exploded).toBe(true);
  });

  it("rejects bad regression options", () => {
    expect(() => runRegression({ initialW: [NaN, 0], learningRate: 0.1, maxIters: 1, costFn: "lse" }, [1], [1])).toThrow();
    expect(() => runRegression({ initialW: [0, 0], learningRate: 0.1, maxIters: 0, costFn: "lse" }, [1], [1])).toThrow();
  });

  it("OLS closed form recovers planted weights", () => {
    const xs = [1, 2, 3, 4, 5];
    const ys = xs.map((x) => 7 - 1.5 * x);
    const [w0, w1] = olsClosedForm(xs, ys);
    expect(w0).toBeCloseTo(7, 9);
    expect(w1).toBeCloseTo(-1.5, 9);
  });

  it("OLS rejects pathological inputs", () => {
    expect(() => olsClosedForm([], [])).toThrow();
    expect(() => olsClosedForm([1, 1, 1], [1, 2, 3])).toThrow(); // zero variance
  });

  it("Kleiber dataset is non-empty and the log-log slope is approximately 0.75", () => {
    expect(KLEIBER_DATA.length).toBeGreaterThan(15);
    const [intercept, slope] = olsClosedForm(KLEIBER_LOG_XS, KLEIBER_LOG_YS);
    expect(slope).toBeGreaterThan(0.65);
    expect(slope).toBeLessThan(0.85);
    expect(Number.isFinite(intercept)).toBe(true);
  });
});
