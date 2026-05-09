/**
 * Gradient Descent on the HW1 cost function from CS 74 / 174 (SP20).
 *
 *   g(w) = (w^4 + w^2 + 10w - 50) / 50
 *   g'(w) = (4w^3 + 2w + 10) / 50  =  (2w^3 + w + 5) / 25
 *
 * The original notebook used `autograd` to compute the gradient. Here
 * we hand-derive it. The `runGradientDescent` function returns the full
 * trajectory so the player can step through it.
 */

export interface DescentStep {
  iter: number;
  w: number;
  cost: number;
}

export function cost(w: number): number {
  return (Math.pow(w, 4) + Math.pow(w, 2) + 10 * w - 50) / 50;
}

export function grad(w: number): number {
  return (4 * Math.pow(w, 3) + 2 * w + 10) / 50;
}

export interface DescentOptions {
  initialW: number;
  learningRate: number;
  maxIters: number;
}

export function runGradientDescent(opts: DescentOptions): DescentStep[] {
  const { initialW, learningRate, maxIters } = opts;
  if (!Number.isFinite(initialW) || !Number.isFinite(learningRate)) {
    throw new Error("initialW and learningRate must be finite numbers");
  }
  if (maxIters < 1 || !Number.isInteger(maxIters)) {
    throw new Error("maxIters must be a positive integer");
  }

  const history: DescentStep[] = [{ iter: 0, w: initialW, cost: cost(initialW) }];
  let w = initialW;
  for (let i = 1; i <= maxIters; i++) {
    const g = grad(w);
    w = w - learningRate * g;
    history.push({ iter: i, w, cost: cost(w) });
    if (!Number.isFinite(w)) break;
  }
  return history;
}

/**
 * Sample the cost curve for plotting. Returns one point every `1/resolution`
 * units in [wMin, wMax].
 */
export function sampleCostCurve(
  wMin: number,
  wMax: number,
  resolution = 200,
): { w: number; cost: number }[] {
  if (wMax <= wMin) throw new Error("wMax must be greater than wMin");
  if (resolution < 2) throw new Error("resolution must be at least 2");
  const step = (wMax - wMin) / (resolution - 1);
  const pts: { w: number; cost: number }[] = [];
  for (let i = 0; i < resolution; i++) {
    const w = wMin + i * step;
    pts.push({ w, cost: cost(w) });
  }
  return pts;
}
