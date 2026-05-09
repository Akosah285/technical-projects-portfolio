/**
 * Multinomial Naïve Bayes — HW4 of CS 74/174 (SP20).
 *
 * The original HW4 trained on a 6-feature `hw4_trainingset.csv` that wasn't
 * part of the submission. We adapt the same algorithm — Multinomial NB
 * with Laplace (add-α) smoothing — to a small text-classification corpus,
 * where Naïve Bayes shines pedagogically: we can show the per-word
 * log-probability contribution to each class.
 *
 * Bayes' rule with the bag-of-words conditional independence assumption:
 *
 *   log P(class | words) ∝ log P(class) + Σᵢ count(wᵢ) · log P(wᵢ | class)
 *
 * P(w | c) is estimated as (count(w, c) + α) / (Σ_v count(v, c) + α · |V|).
 */

export type Label = string;

export interface LabelledExample {
  text: string;
  label: Label;
}

export interface NbModel {
  labels: Label[];
  vocabulary: string[];
  /** Prior log-probability per label */
  logPrior: Record<Label, number>;
  /** logPlw[label][word] = log P(word | label) under Laplace smoothing */
  logPlw: Record<Label, Record<string, number>>;
  /** Total count of all word-occurrences seen for each label (for unknown-word handling) */
  totalsByLabel: Record<Label, number>;
  /** Smoothing parameter actually used */
  alpha: number;
}

/** Tokenise to lowercase alphanumeric word stems. */
export function tokenize(text: string): string[] {
  if (typeof text !== "string") throw new Error("text must be a string");
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function trainMultinomialNb(
  examples: readonly LabelledExample[],
  alpha = 1,
): NbModel {
  if (examples.length === 0) throw new Error("training set must be non-empty");
  if (!Number.isFinite(alpha) || alpha < 0) throw new Error("alpha must be ≥ 0");

  const labelCounts: Record<Label, number> = {};
  const wordCountsByLabel: Record<Label, Record<string, number>> = {};
  const totalsByLabel: Record<Label, number> = {};
  const vocabularySet = new Set<string>();

  for (const ex of examples) {
    labelCounts[ex.label] = (labelCounts[ex.label] ?? 0) + 1;
    if (!wordCountsByLabel[ex.label]) wordCountsByLabel[ex.label] = {};
    if (totalsByLabel[ex.label] === undefined) totalsByLabel[ex.label] = 0;
    const tokens = tokenize(ex.text);
    for (const t of tokens) {
      vocabularySet.add(t);
      wordCountsByLabel[ex.label][t] = (wordCountsByLabel[ex.label][t] ?? 0) + 1;
      totalsByLabel[ex.label] += 1;
    }
  }

  const labels = Object.keys(labelCounts).sort();
  const vocabulary = Array.from(vocabularySet).sort();
  const N = examples.length;
  const V = vocabulary.length;

  const logPrior: Record<Label, number> = {};
  const logPlw: Record<Label, Record<string, number>> = {};
  for (const label of labels) {
    logPrior[label] = Math.log(labelCounts[label] / N);
    logPlw[label] = {};
    const denom = totalsByLabel[label] + alpha * V;
    for (const word of vocabulary) {
      const c = wordCountsByLabel[label]?.[word] ?? 0;
      logPlw[label][word] = Math.log((c + alpha) / denom);
    }
  }

  return { labels, vocabulary, logPrior, logPlw, totalsByLabel, alpha };
}

/** Per-word contributions to the log-score of a particular label. */
export interface WordContribution {
  word: string;
  count: number;
  inVocabulary: boolean;
  /** count * log P(word | label) — what's added to that label's score for this word. */
  contribution: number;
}

export interface ClassificationResult {
  predictedLabel: Label;
  /** Log-score per label — higher is more likely (proportional to log posterior). */
  logScores: Record<Label, number>;
  /** Posterior probability per label after softmax over logScores. */
  posterior: Record<Label, number>;
  /** Per-word contribution per label, in token order. */
  wordContributions: Record<Label, WordContribution[]>;
}

export function classifyText(model: NbModel, text: string): ClassificationResult {
  const tokens = tokenize(text);
  const tokenCounts: Record<string, number> = {};
  for (const t of tokens) tokenCounts[t] = (tokenCounts[t] ?? 0) + 1;

  const logScores: Record<Label, number> = {};
  const wordContributions: Record<Label, WordContribution[]> = {};
  const V = model.vocabulary.length;

  for (const label of model.labels) {
    let score = model.logPrior[label];
    const contribs: WordContribution[] = [];
    const denom = model.totalsByLabel[label] + model.alpha * V;
    for (const [word, count] of Object.entries(tokenCounts)) {
      const inVocab = model.logPlw[label][word] !== undefined;
      const logP = inVocab
        ? model.logPlw[label][word]
        : Math.log(model.alpha / Math.max(denom, 1e-12));
      // If alpha = 0 and word unseen, fall back to a tiny but finite value to avoid -Infinity.
      const safeLogP = Number.isFinite(logP) ? logP : -1e9;
      const contribution = count * safeLogP;
      score += contribution;
      contribs.push({ word, count, inVocabulary: inVocab, contribution });
    }
    logScores[label] = score;
    wordContributions[label] = contribs;
  }

  const maxScore = Math.max(...Object.values(logScores));
  const expScores: Record<Label, number> = {};
  let total = 0;
  for (const label of model.labels) {
    const e = Math.exp(logScores[label] - maxScore);
    expScores[label] = e;
    total += e;
  }
  const posterior: Record<Label, number> = {};
  for (const label of model.labels) {
    posterior[label] = expScores[label] / total;
  }

  let predictedLabel = model.labels[0];
  let best = -Infinity;
  for (const label of model.labels) {
    if (logScores[label] > best) {
      best = logScores[label];
      predictedLabel = label;
    }
  }

  return { predictedLabel, logScores, posterior, wordContributions };
}

export interface NbEvaluation {
  accuracy: number;
  perLabel: Record<Label, { precision: number; recall: number; f1: number }>;
}

export function evaluateNb(
  model: NbModel,
  testSet: readonly LabelledExample[],
): NbEvaluation {
  if (testSet.length === 0) throw new Error("test set must be non-empty");
  let correct = 0;
  const tp: Record<Label, number> = {};
  const fp: Record<Label, number> = {};
  const fn: Record<Label, number> = {};
  for (const label of model.labels) {
    tp[label] = 0;
    fp[label] = 0;
    fn[label] = 0;
  }
  for (const ex of testSet) {
    const { predictedLabel } = classifyText(model, ex.text);
    if (predictedLabel === ex.label) {
      correct += 1;
      tp[predictedLabel] = (tp[predictedLabel] ?? 0) + 1;
    } else {
      fp[predictedLabel] = (fp[predictedLabel] ?? 0) + 1;
      fn[ex.label] = (fn[ex.label] ?? 0) + 1;
    }
  }
  const perLabel: Record<Label, { precision: number; recall: number; f1: number }> = {};
  for (const label of model.labels) {
    const precision = tp[label] / Math.max(1, tp[label] + fp[label]);
    const recall = tp[label] / Math.max(1, tp[label] + fn[label]);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    perLabel[label] = { precision, recall, f1 };
  }
  return { accuracy: correct / testSet.length, perLabel };
}

/**
 * A small spam / ham corpus for the player UI — replaces HW4's
 * `hw4_trainingset.csv` (not in the submission). Sentences chosen
 * to make per-word contributions visible: spam-flavoured words like
 * "free", "winner", "click", "prize" vs ham-flavoured "meeting",
 * "lunch", "tomorrow", "report".
 */
export const NB_TRAINING_SET: LabelledExample[] = [
  { text: "Win a free iphone now! click here", label: "spam" },
  { text: "Congratulations winner free prize claim now", label: "spam" },
  { text: "Free money limited offer click link", label: "spam" },
  { text: "URGENT cash prize you won click", label: "spam" },
  { text: "Free trial click now winner", label: "spam" },
  { text: "Hot deal cheap loans free today", label: "spam" },
  { text: "Free tickets win big jackpot now", label: "spam" },
  { text: "Claim your free gift card winner", label: "spam" },
  { text: "Limited offer free shipping click here today", label: "spam" },
  { text: "Get a free credit score click now", label: "spam" },
  { text: "Are we still on for lunch tomorrow", label: "ham" },
  { text: "Please send me the report by friday", label: "ham" },
  { text: "Meeting moved to three thirty", label: "ham" },
  { text: "Can you grab milk on the way home", label: "ham" },
  { text: "I will be late to dinner tonight", label: "ham" },
  { text: "Reminder team meeting at ten am tomorrow", label: "ham" },
  { text: "Just landed will text when in the cab", label: "ham" },
  { text: "Great work on the slide deck thanks", label: "ham" },
  { text: "Lunch at noon downstairs cafe", label: "ham" },
  { text: "Dropping the dog off at the vet", label: "ham" },
];

export const NB_TEST_SET: LabelledExample[] = [
  { text: "Free prize click now", label: "spam" },
  { text: "Meeting at three tomorrow", label: "ham" },
  { text: "You won a free iphone", label: "spam" },
  { text: "Lunch at noon thanks", label: "ham" },
  { text: "Cheap loans free deal today", label: "spam" },
  { text: "Picking up the kids at five", label: "ham" },
];
