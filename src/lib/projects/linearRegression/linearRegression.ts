/**
 * Linear regression — HW2 of CS 74/174 (SP20).
 *
 * Models a single-feature linear regression y_hat = w0 + w1 * x.
 * Two cost functions (least squares and least absolute deviation),
 * gradient-descent training that returns the full weight + cost
 * history so the player UI can step through it.
 *
 * The dataset baked into the player is a synthesised Kleiber's-law
 * dataset — animal body mass vs. resting metabolism. After the log-log
 * transform the relationship is approximately linear with slope ≈ 0.75.
 */

export type Weights = readonly [number, number];

export interface RegressionStep {
  iter: number;
  w: Weights;
  cost: number;
}

export type CostFn = "lse" | "lad";

export function predict(w: Weights, x: number): number {
  return w[0] + w[1] * x;
}

export function predictAll(w: Weights, xs: readonly number[]): number[] {
  return xs.map((x) => predict(w, x));
}

export function leastSquaresCost(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): number {
  if (xs.length !== ys.length) throw new Error("xs and ys must align");
  if (xs.length === 0) throw new Error("dataset must be non-empty");
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    const e = predict(w, xs[i]) - ys[i];
    sum += e * e;
  }
  return sum / xs.length;
}

export function leastAbsoluteDeviationCost(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): number {
  if (xs.length !== ys.length) throw new Error("xs and ys must align");
  if (xs.length === 0) throw new Error("dataset must be non-empty");
  let sum = 0;
  for (let i = 0; i < xs.length; i++) {
    sum += Math.abs(predict(w, xs[i]) - ys[i]);
  }
  return sum / xs.length;
}

/**
 * Analytic gradient of mean-squared-error: dC/dw0 = 2/N * Σ(ŷ-y), dC/dw1 = 2/N * Σx(ŷ-y).
 */
export function leastSquaresGradient(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): Weights {
  let g0 = 0;
  let g1 = 0;
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    const e = predict(w, xs[i]) - ys[i];
    g0 += e;
    g1 += e * xs[i];
  }
  return [(2 * g0) / n, (2 * g1) / n];
}

/**
 * Subgradient of mean-absolute-error: replaces |e| with sign(e). At e=0 we
 * return 0 — a valid subgradient.
 */
export function ladSubgradient(
  w: Weights,
  xs: readonly number[],
  ys: readonly number[],
): Weights {
  let g0 = 0;
  let g1 = 0;
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    const e = predict(w, xs[i]) - ys[i];
    const s = e === 0 ? 0 : Math.sign(e);
    g0 += s;
    g1 += s * xs[i];
  }
  return [g0 / n, g1 / n];
}

export interface RegressionOptions {
  initialW: Weights;
  learningRate: number;
  maxIters: number;
  costFn: CostFn;
}

export function runRegression(
  opts: RegressionOptions,
  xs: readonly number[],
  ys: readonly number[],
): RegressionStep[] {
  const { initialW, learningRate, maxIters, costFn } = opts;
  if (!Number.isFinite(initialW[0]) || !Number.isFinite(initialW[1])) {
    throw new Error("initialW must be finite");
  }
  if (!Number.isFinite(learningRate)) throw new Error("learningRate must be finite");
  if (maxIters < 1 || !Number.isInteger(maxIters)) {
    throw new Error("maxIters must be a positive integer");
  }
  const costAtW = (w: Weights) =>
    costFn === "lse" ? leastSquaresCost(w, xs, ys) : leastAbsoluteDeviationCost(w, xs, ys);
  const gradAtW = (w: Weights) =>
    costFn === "lse" ? leastSquaresGradient(w, xs, ys) : ladSubgradient(w, xs, ys);

  const history: RegressionStep[] = [{ iter: 0, w: initialW, cost: costAtW(initialW) }];
  let w: Weights = [initialW[0], initialW[1]];
  for (let i = 1; i <= maxIters; i++) {
    const g = gradAtW(w);
    w = [w[0] - learningRate * g[0], w[1] - learningRate * g[1]];
    history.push({ iter: i, w, cost: costAtW(w) });
    if (!Number.isFinite(w[0]) || !Number.isFinite(w[1])) break;
  }
  return history;
}

/**
 * Closed-form ordinary-least-squares slope and intercept.
 *
 *   w1 = Σ(x-x̄)(y-ȳ) / Σ(x-x̄)²,  w0 = ȳ - w1·x̄
 */
export function olsClosedForm(
  xs: readonly number[],
  ys: readonly number[],
): Weights {
  if (xs.length !== ys.length) throw new Error("xs and ys must align");
  if (xs.length < 2) throw new Error("need at least two points");
  const n = xs.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    num += dx * (ys[i] - yMean);
    den += dx * dx;
  }
  if (den === 0) throw new Error("variance in x is zero");
  const w1 = num / den;
  const w0 = yMean - w1 * xMean;
  return [w0, w1];
}

/**
 * Kleiber's law dataset — body mass (kg) and resting metabolism (kcal/day)
 * for ~20 mammals, spanning mouse to elephant. The original CSV from the
 * SP20 HW2 isn't bundled; this is a representative replacement that
 * preserves the famous metabolism ∝ mass^0.75 relationship.
 */
export const KLEIBER_DATA: { species: string; massKg: number; metabolismKcalDay: number }[] = [
  { species: "Mouse", massKg: 0.025, metabolismKcalDay: 4.0 },
  { species: "Bat", massKg: 0.04, metabolismKcalDay: 5.5 },
  { species: "Hamster", massKg: 0.12, metabolismKcalDay: 13 },
  { species: "Rat", massKg: 0.25, metabolismKcalDay: 28 },
  { species: "Squirrel", massKg: 0.5, metabolismKcalDay: 50 },
  { species: "Guinea pig", massKg: 0.8, metabolismKcalDay: 75 },
  { species: "Rabbit", massKg: 2.5, metabolismKcalDay: 195 },
  { species: "Cat", massKg: 4.5, metabolismKcalDay: 320 },
  { species: "Fox", massKg: 7.0, metabolismKcalDay: 470 },
  { species: "Dog (medium)", massKg: 14, metabolismKcalDay: 880 },
  { species: "Goose", massKg: 4.0, metabolismKcalDay: 290 },
  { species: "Lynx", massKg: 22, metabolismKcalDay: 1250 },
  { species: "Wolf", massKg: 40, metabolismKcalDay: 2050 },
  { species: "Sheep", massKg: 70, metabolismKcalDay: 2950 },
  { species: "Goat", massKg: 50, metabolismKcalDay: 2300 },
  { species: "Pig", massKg: 110, metabolismKcalDay: 4400 },
  { species: "Human", massKg: 70, metabolismKcalDay: 2800 },
  { species: "Reindeer", massKg: 180, metabolismKcalDay: 6500 },
  { species: "Cow", massKg: 500, metabolismKcalDay: 13500 },
  { species: "Horse", massKg: 600, metabolismKcalDay: 15500 },
  { species: "Buffalo", massKg: 800, metabolismKcalDay: 20000 },
  { species: "Rhinoceros", massKg: 2000, metabolismKcalDay: 40500 },
  { species: "Elephant", massKg: 3500, metabolismKcalDay: 60000 },
];

/** Pre-transformed log10(mass), log10(metabolism). */
export const KLEIBER_LOG_XS: number[] = KLEIBER_DATA.map((d) => Math.log10(d.massKg));
export const KLEIBER_LOG_YS: number[] = KLEIBER_DATA.map((d) => Math.log10(d.metabolismKcalDay));
