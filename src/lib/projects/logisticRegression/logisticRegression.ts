/**
 * Logistic regression — HW3 of CS 74/174 (SP20).
 *
 * Single-feature binary classifier:
 *   z = w0 + w1 * x
 *   p = σ(z) = 1 / (1 + exp(-z))
 *
 * Cost: binary cross-entropy
 *   C(w) = -1/N * Σ [ y_i log p_i + (1 - y_i) log (1 - p_i) ]
 *
 * Gradient (analytic):
 *   ∂C/∂w0 = (1/N) Σ (p_i - y_i)
 *   ∂C/∂w1 = (1/N) Σ (p_i - y_i) x_i
 */

export type Weights = readonly [number, number];

export interface ClassificationStep {
  iter: number;
  w: Weights;
  cost: number;
}

const EPS = 1e-12;

export function sigmoid(z: number): number {
  if (z >= 0) {
    const e = Math.exp(-z);
    return 1 / (1 + e);
  }
  // Numerically stable for very negative z
  const e = Math.exp(z);
  return e / (1 + e);
}

export function predictLinear(w: Weights, x: number): number {
  return w[0] + w[1] * x;
}

export function predictProb(w: Weights, x: number): number {
  return sigmoid(predictLinear(w, x));
}

export function classify(w: Weights, x: number, threshold = 0.5): 0 | 1 {
  return predictProb(w, x) >= threshold ? 1 : 0;
}

export function crossEntropyCost(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): number {
  if (xs.length !== ys.length) throw new Error("xs and ys must align");
  if (xs.length === 0) throw new Error("dataset must be non-empty");
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    const p = predictProb(w, xs[i]);
    if (ys[i] === 1) {
      sum += Math.log(Math.max(p, EPS));
    } else if (ys[i] === 0) {
      sum += Math.log(Math.max(1 - p, EPS));
    } else {
      throw new Error(`labels must be 0 or 1, got ${ys[i]}`);
    }
  }
  return -sum / xs.length;
}

export function crossEntropyGradient(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): Weights {
  let g0 = 0;
  let g1 = 0;
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    const e = predictProb(w, xs[i]) - ys[i];
    g0 += e;
    g1 += e * xs[i];
  }
  return [g0 / n, g1 / n];
}

export interface ClassifierOptions {
  initialW: Weights;
  learningRate: number;
  maxIters: number;
}

export function runLogisticRegression(
  opts: ClassifierOptions,
  xs: readonly number[],
  ys: readonly number[],
): ClassificationStep[] {
  const { initialW, learningRate, maxIters } = opts;
  if (!Number.isFinite(initialW[0]) || !Number.isFinite(initialW[1])) {
    throw new Error("initialW must be finite");
  }
  if (!Number.isFinite(learningRate)) throw new Error("learningRate must be finite");
  if (maxIters < 1 || !Number.isInteger(maxIters)) {
    throw new Error("maxIters must be a positive integer");
  }
  const history: ClassificationStep[] = [
    { iter: 0, w: initialW, cost: crossEntropyCost(initialW, xs, ys) },
  ];
  let w: Weights = [initialW[0], initialW[1]];
  for (let i = 1; i <= maxIters; i++) {
    const g = crossEntropyGradient(w, xs, ys);
    w = [w[0] - learningRate * g[0], w[1] - learningRate * g[1]];
    history.push({ iter: i, w, cost: crossEntropyCost(w, xs, ys) });
    if (!Number.isFinite(w[0]) || !Number.isFinite(w[1])) break;
  }
  return history;
}

export interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  accuracy: number;
}

export function evaluate(
  yActual: readonly (0 | 1)[],
  yPredicted: readonly (0 | 1)[],
): ConfusionMatrix {
  if (yActual.length !== yPredicted.length) {
    throw new Error("yActual and yPredicted must align");
  }
  if (yActual.length === 0) throw new Error("inputs must be non-empty");
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;
  for (let i = 0; i < yActual.length; i++) {
    if (yPredicted[i] === 1 && yActual[i] === 1) tp++;
    else if (yPredicted[i] === 0 && yActual[i] === 0) tn++;
    else if (yPredicted[i] === 1 && yActual[i] === 0) fp++;
    else fn++;
  }
  return {
    truePositive: tp,
    trueNegative: tn,
    falsePositive: fp,
    falseNegative: fn,
    accuracy: (tp + tn) / yActual.length,
  };
}

/**
 * Synthetic 1D classification dataset that replaces the original
 * `2d_classification_data_v1_entropy.csv`. 22 points: positive class
 * concentrated at high x, negative class at low x, with a small
 * overlap zone so the cross-entropy fit isn't trivially zero.
 */
export const CLASSIFICATION_DATA: { x: number; y: 0 | 1 }[] = [
  { x: -3.5, y: 0 }, { x: -3.1, y: 0 }, { x: -2.7, y: 0 }, { x: -2.4, y: 0 },
  { x: -2.0, y: 0 }, { x: -1.7, y: 0 }, { x: -1.3, y: 0 }, { x: -1.0, y: 0 },
  { x: -0.6, y: 0 }, { x: -0.3, y: 0 }, { x: 0.1, y: 1 }, { x: -0.2, y: 1 },
  { x: 0.4, y: 1 }, { x: 0.6, y: 0 }, { x: 0.9, y: 1 }, { x: 1.2, y: 1 },
  { x: 1.6, y: 1 }, { x: 1.9, y: 1 }, { x: 2.3, y: 1 }, { x: 2.7, y: 1 },
  { x: 3.0, y: 1 }, { x: 3.4, y: 1 },
];

export const CLASSIFICATION_XS: number[] = CLASSIFICATION_DATA.map((d) => d.x);
export const CLASSIFICATION_YS: (0 | 1)[] = CLASSIFICATION_DATA.map((d) => d.y);
