"use client";

import { useMemo, useState } from "react";
import { trainHmm, viterbi, type TrainingExample } from "@/lib/projects/posTagger/posTagger";

// Compact training corpus drawn from the PS_5 hardCoded train files
// (sentence file + tag file, line-aligned).
const HARD_CODED_CORPUS: TrainingExample[] = [
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
    words:
      "He performs a dance of disdain as he lifts and lowers each paw .".split(" "),
    tags: "PRO V DET N P N CNJ PRO V CNJ V ADJ N .".split(" "),
  },
  {
    words: "with the delicacy of a ballet dancer .".split(" "),
    tags: "CNJ DET N P DET ADJ N .".split(" "),
  },
  {
    words: "His pride , however , does not extend to his appearance .".split(" "),
    tags: "PRO N , ADV , V V TO PRO N .".split(" "),
  },
  {
    words: "for he spends most of his time indoors watching television .".split(" "),
    tags: "CNJ PRO V ADJ CNJ PRO N N V N .".split(" "),
  },
  {
    words: "and growing fat .".split(" "),
    tags: "CNJ V ADJ .".split(" "),
  },
];

// Smaller "story-book" corpus that is friendlier for first-time users.
const STORY_CORPUS: TrainingExample[] = [
  { words: "the cat saw the dog .".split(" "), tags: "DET N V DET N .".split(" ") },
  { words: "the dog chased the cat .".split(" "), tags: "DET N V DET N .".split(" ") },
  { words: "a cat ran fast .".split(" "), tags: "DET N V ADV .".split(" ") },
  { words: "a dog ran .".split(" "), tags: "DET N V .".split(" ") },
  { words: "she saw a cat .".split(" "), tags: "PRO V DET N .".split(" ") },
  { words: "he chased the dog .".split(" "), tags: "PRO V DET N .".split(" ") },
];

const PRESETS = [
  { label: "Gregory's pride", value: "His pride does not extend to his appearance ." },
  { label: "Practice from training", value: "He performs a dance ." },
  { label: "Plays with grace", value: "Gregory walks with pride and grace ." },
  { label: "Story sentence", value: "the dog chased the cat ." },
];

const POS_GLOSSARY: Record<string, string> = {
  "#": "start of sentence",
  N: "noun",
  V: "verb",
  ADJ: "adjective",
  ADV: "adverb",
  DET: "determiner",
  PRO: "pronoun",
  P: "preposition",
  CNJ: "conjunction",
  MOD: "modal verb",
  TO: "infinitival 'to'",
  NP: "proper noun",
  ".": "sentence-ending punctuation",
  ",": "comma",
  "?": "unknown",
};

type CorpusKey = "hardCoded" | "story";

export function PosTaggerPlayer() {
  const [corpusKey, setCorpusKey] = useState<CorpusKey>("hardCoded");
  const [sentence, setSentence] = useState(PRESETS[0].value);

  const corpus = corpusKey === "hardCoded" ? HARD_CODED_CORPUS : STORY_CORPUS;
  const model = useMemo(() => trainHmm(corpus), [corpus]);
  const result = useMemo(() => viterbi(model, sentence), [model, sentence]);

  const knownTags = useMemo(() => Array.from(model.tags).sort(), [model]);

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">HMM Viterbi tagger</h2>
        <p className="text-sm text-slate-300">
          Train a hidden Markov model on a tiny labelled corpus, then tag any
          sentence with the most-likely sequence of parts of speech using
          Viterbi decoding. Words unseen during training fall back to the
          transition prior with a fixed log-penalty (matching the Java
          original).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Training corpus
          </label>
          <select
            value={corpusKey}
            onChange={(e) => setCorpusKey(e.target.value as CorpusKey)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="hardCoded">PS_5 hardCoded (Gregory the cat)</option>
            <option value="story">Tiny story corpus (cats & dogs)</option>
          </select>
          <p className="mt-2 text-xs text-slate-400">
            {corpus.length} sentences, tags learned: {knownTags.join(", ")}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preset sentences
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setSentence(p.value)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 hover:border-sky-500 hover:text-sky-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Sentence to tag
        </label>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-sm font-semibold text-slate-200">Viterbi tags</h3>
        {result.tags.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            Type a sentence above to see its tag sequence.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.steps.map((step, i) => {
                const tag = result.tags[i];
                const tagLabel = POS_GLOSSARY[tag] ?? "tag";
                return (
                  <div
                    key={`${i}-${step.word}`}
                    className={`rounded-lg border px-3 py-2 text-center ${
                      step.unseen
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-slate-700 bg-slate-950"
                    }`}
                    title={`${tagLabel}${step.unseen ? " (word unseen — penalty applied)" : ""}`}
                  >
                    <div className="font-mono text-base text-slate-100">{step.word}</div>
                    <div className="mt-1 text-xs font-semibold text-sky-400">{tag}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              log P(best path) = {result.score.toFixed(3)}.{" "}
              {result.steps.some((s) => s.unseen) && (
                <span className="text-amber-300">
                  Highlighted words were never seen during training; the tag
                  comes purely from the transition prior plus the penalty.
                </span>
              )}
            </p>
          </>
        )}
      </div>

      <details className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">
          Tag glossary
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          {knownTags.map((t) => (
            <div key={t} className="flex gap-2">
              <dt className="font-mono text-sky-400">{t}</dt>
              <dd className="text-slate-300">{POS_GLOSSARY[t] ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
