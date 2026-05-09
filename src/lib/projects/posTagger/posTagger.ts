/**
 * Hidden Markov Model + Viterbi part-of-speech tagger.
 *
 * Faithful port of the PS_5 Training/Viterbi Java solution (COSC 10, WI19).
 *
 * The model has two probability tables, both stored as natural logs so they can
 * be added (instead of multiplied) along a Viterbi path:
 *
 *   - transitions[fromPOS][toPOS]    = log P(toPOS | fromPOS)
 *   - emissions[POS][word]           = log P(word  | POS)
 *
 * A synthetic "#" tag marks the start of every sentence, so the chain always
 * begins with transitions["#"][...].
 *
 * Unseen-word penalty matches the Java original (PENALTY = 100), subtracted
 * from the running log-score for any (state, word) pair that wasn't observed
 * during training.
 */

export const START_TAG = "#";
export const UNSEEN_WORD_PENALTY = 100;

export interface TrainingExample {
  /** Whitespace-tokenized words (case is normalised when training/decoding). */
  words: string[];
  /** Same length as `words`, one POS tag per word. */
  tags: string[];
}

export interface HmmModel {
  /** log P(toTag | fromTag); start transitions live under START_TAG. */
  transitions: Map<string, Map<string, number>>;
  /** log P(word  | tag) — does NOT include START_TAG. */
  emissions: Map<string, Map<string, number>>;
  /** All non-start tags seen during training. Useful for diagnostics. */
  tags: Set<string>;
}

/**
 * Train an HMM from labelled sentences.
 *
 * Probabilities are computed as raw counts / total, then log-transformed.
 * Words are lower-cased to match Java's `sentence.toLowerCase()` in Viterbi.
 */
export function trainHmm(examples: TrainingExample[]): HmmModel {
  const transitionCounts = new Map<string, Map<string, number>>();
  const emissionCounts = new Map<string, Map<string, number>>();
  const tagTotals = new Map<string, number>();
  const tags = new Set<string>();

  const bump = (
    table: Map<string, Map<string, number>>,
    from: string,
    to: string,
  ) => {
    let row = table.get(from);
    if (!row) {
      row = new Map();
      table.set(from, row);
    }
    row.set(to, (row.get(to) ?? 0) + 1);
  };

  for (const example of examples) {
    // Match the Java original's tolerance: silently truncate to the shorter
    // array when the labelled corpus has minor alignment glitches (the PS_5
    // hardCoded corpus has one such row).
    const n = Math.min(example.words.length, example.tags.length);
    if (n === 0) continue;

    bump(transitionCounts, START_TAG, example.tags[0]);
    tagTotals.set(START_TAG, (tagTotals.get(START_TAG) ?? 0) + 1);

    for (let i = 0; i < n; i++) {
      const tag = example.tags[i];
      const word = example.words[i].toLowerCase();
      tags.add(tag);
      tagTotals.set(tag, (tagTotals.get(tag) ?? 0) + 1);
      bump(emissionCounts, tag, word);

      if (i < n - 1) {
        bump(transitionCounts, tag, example.tags[i + 1]);
      }
    }
  }

  const transitions = new Map<string, Map<string, number>>();
  for (const [from, row] of transitionCounts) {
    const total = tagTotals.get(from) ?? 0;
    const logged = new Map<string, number>();
    for (const [to, count] of row) {
      logged.set(to, Math.log(count / total));
    }
    transitions.set(from, logged);
  }

  const emissions = new Map<string, Map<string, number>>();
  for (const [tag, row] of emissionCounts) {
    const total = tagTotals.get(tag) ?? 0;
    const logged = new Map<string, number>();
    for (const [word, count] of row) {
      logged.set(word, Math.log(count / total));
    }
    emissions.set(tag, logged);
  }

  return { transitions, emissions, tags };
}

export interface ViterbiStep {
  /** The observed (lower-cased) word at this position. */
  word: string;
  /** Best score reachable per state at this step (log-prob). */
  scores: Map<string, number>;
  /** For each state at this step, the predecessor state on the best path. */
  backpointer: Map<string, string>;
  /** True if this word was unseen for every reachable state. */
  unseen: boolean;
}

export interface ViterbiResult {
  tags: string[];
  /** Total log-probability of the best path. -Infinity if no path exists. */
  score: number;
  steps: ViterbiStep[];
}

/**
 * Viterbi-decode a sentence into POS tags using a trained HMM.
 *
 * Mirrors Training.Viterbi from the Java original, including the
 * unseen-word penalty.
 */
export function viterbi(model: HmmModel, sentence: string): ViterbiResult {
  const words = sentence
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase());

  if (words.length === 0) {
    return { tags: [], score: 0, steps: [] };
  }

  let currScores = new Map<string, number>();
  currScores.set(START_TAG, 0);

  const steps: ViterbiStep[] = [];

  for (let k = 0; k < words.length; k++) {
    const word = words[k];
    const nextScores = new Map<string, number>();
    const backpointer = new Map<string, string>();
    let unseen = true;

    for (const [currState, currScore] of currScores) {
      const trans = model.transitions.get(currState);
      if (!trans) continue;

      for (const [nextState, transScore] of trans) {
        const emissions = model.emissions.get(nextState);
        const emit = emissions?.get(word);
        let nextScore = currScore + transScore;
        if (emit !== undefined) {
          nextScore += emit;
          unseen = false;
        } else {
          nextScore -= UNSEEN_WORD_PENALTY;
        }

        const existing = nextScores.get(nextState);
        if (existing === undefined || nextScore > existing) {
          nextScores.set(nextState, nextScore);
          backpointer.set(nextState, currState);
        }
      }
    }

    steps.push({ word, scores: nextScores, backpointer, unseen });
    currScores = nextScores;
  }

  if (currScores.size === 0) {
    return { tags: words.map(() => "?"), score: -Infinity, steps };
  }

  let bestEnd = "";
  let bestScore = -Infinity;
  for (const [state, score] of currScores) {
    if (score > bestScore) {
      bestScore = score;
      bestEnd = state;
    }
  }

  const tags: string[] = new Array(words.length);
  let curr = bestEnd;
  for (let i = words.length - 1; i >= 0; i--) {
    tags[i] = curr;
    curr = steps[i].backpointer.get(curr) ?? START_TAG;
  }

  return { tags, score: bestScore, steps };
}

/**
 * Convenience: tag a sentence with a trained model and return just the tags.
 */
export function tag(model: HmmModel, sentence: string): string[] {
  return viterbi(model, sentence).tags;
}
