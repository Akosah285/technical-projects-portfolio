"use client";

import { useMemo, useState } from "react";
import {
  NB_TEST_SET,
  NB_TRAINING_SET,
  classifyText,
  evaluateNb,
  trainMultinomialNb,
  type LabelledExample,
} from "@/lib/projects/naiveBayes/naiveBayes";

const PRESET_MESSAGES = [
  "Free prize winner click now",
  "Lunch at noon tomorrow",
  "URGENT cash prize click here",
  "Reminder team meeting at three",
  "You won a brand new iphone today",
  "Are we still on for dinner tonight",
];

const LABEL_COLORS: Record<string, string> = {
  spam: "#ef4444",
  ham: "#10b981",
};

function probabilityBar(label: string, p: number): string {
  const w = Math.max(0, Math.min(1, p)) * 100;
  return `linear-gradient(90deg, ${LABEL_COLORS[label] ?? "#6366f1"} ${w}%, transparent ${w}%)`;
}

export function NaiveBayesPlayer() {
  const [alpha, setAlpha] = useState(1);
  const [text, setText] = useState("Free prize winner click now");
  const [training, setTraining] = useState<LabelledExample[]>(NB_TRAINING_SET);
  const [draftText, setDraftText] = useState("");
  const [draftLabel, setDraftLabel] = useState<string>("spam");

  const model = useMemo(() => trainMultinomialNb(training, alpha), [training, alpha]);
  const evalResult = useMemo(() => evaluateNb(model, NB_TEST_SET), [model]);
  const result = useMemo(() => classifyText(model, text), [model, text]);

  const labels = model.labels;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Multinomial Naïve Bayes — spam vs ham</h2>
        <p className="text-sm text-foreground/70">
          Type a message and watch the classifier break down each word&apos;s log-probability
          contribution to each class. Adjust the smoothing α or extend the training set
          with your own examples to see the boundary shift in real time.
        </p>
      </header>

      <section className="space-y-3 rounded-md border border-foreground/15 p-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Message</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full rounded border border-foreground/20 bg-background px-3 py-2 font-mono text-sm"
            placeholder="Type a message…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => setText(msg)}
              className="rounded border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/10"
            >
              {msg}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {labels.map((label) => (
            <div
              key={label}
              className="space-y-1 rounded border border-foreground/15 p-3"
              style={{
                outline:
                  result.predictedLabel === label
                    ? `2px solid ${LABEL_COLORS[label] ?? "#6366f1"}`
                    : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {label}
                </span>
                <span className="font-mono text-sm">
                  {(result.posterior[label] * 100).toFixed(1)}%
                </span>
              </div>
              <div
                className="h-2 w-full rounded bg-foreground/10"
                style={{ background: probabilityBar(label, result.posterior[label]) }}
              />
              <div className="text-xs text-foreground/60">
                log-score {result.logScores[label].toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-foreground/15 p-4">
        <h3 className="text-sm font-semibold">Per-word contribution</h3>
        <p className="text-xs text-foreground/60">
          Each token contributes <code>count · log P(word | class)</code> to that class&apos;s
          log-score. Bigger (less negative) is more support for that class.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-foreground/15 text-left">
                <th className="px-2 py-1">word</th>
                <th className="px-2 py-1">count</th>
                {labels.map((l) => (
                  <th key={l} className="px-2 py-1 text-right">
                    log P(w | {l})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.wordContributions[labels[0]].map((wc, i) => {
                const winningLabel = labels.reduce((best, l) =>
                  result.wordContributions[l][i].contribution >
                  result.wordContributions[best][i].contribution
                    ? l
                    : best,
                );
                return (
                  <tr key={`${wc.word}-${i}`} className="border-b border-foreground/10">
                    <td className="px-2 py-1 font-mono">
                      {wc.word}
                      {!wc.inVocabulary && (
                        <span className="ml-1 text-foreground/50">(OOV)</span>
                      )}
                    </td>
                    <td className="px-2 py-1 font-mono">{wc.count}</td>
                    {labels.map((l) => (
                      <td
                        key={l}
                        className="px-2 py-1 text-right font-mono"
                        style={{
                          color:
                            l === winningLabel
                              ? LABEL_COLORS[l] ?? "inherit"
                              : "inherit",
                          fontWeight: l === winningLabel ? 600 : 400,
                        }}
                      >
                        {result.wordContributions[l][i].contribution.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-md border border-foreground/15 p-4">
        <h3 className="text-sm font-semibold">Smoothing α</h3>
        <p className="text-xs text-foreground/60">
          Laplace smoothing adds α to every word-count before normalisation. Larger α makes
          the classifier more conservative — every word looks more &ldquo;possible&rdquo; under
          every class. α → 0 makes any unseen word a hard veto.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.01}
            max={5}
            step={0.01}
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 text-right font-mono text-sm">α = {alpha.toFixed(2)}</span>
        </div>
      </section>

      <section className="space-y-2 rounded-md border border-foreground/15 p-4">
        <h3 className="text-sm font-semibold">Test-set accuracy</h3>
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
          <div>
            <div className="text-foreground/60">accuracy</div>
            <div className="font-mono text-base">
              {(evalResult.accuracy * 100).toFixed(1)}%
            </div>
          </div>
          {labels.map((l) => (
            <div key={l}>
              <div className="text-foreground/60">F1 ({l})</div>
              <div className="font-mono text-base">
                {evalResult.perLabel[l].f1.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
        <details className="text-xs text-foreground/70">
          <summary className="cursor-pointer font-medium">
            test set ({NB_TEST_SET.length} examples)
          </summary>
          <ul className="mt-2 space-y-1 font-mono">
            {NB_TEST_SET.map((ex, i) => {
              const pred = classifyText(model, ex.text).predictedLabel;
              const ok = pred === ex.label;
              return (
                <li key={i} className={ok ? "" : "text-red-500"}>
                  [{ex.label} → {pred}] {ex.text}
                </li>
              );
            })}
          </ul>
        </details>
      </section>

      <section className="space-y-3 rounded-md border border-foreground/15 p-4">
        <h3 className="text-sm font-semibold">
          Training set ({training.length} examples)
        </h3>
        <p className="text-xs text-foreground/60">
          Add your own labelled examples to extend the model. Retrains immediately.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <input
            type="text"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="new example…"
            className="flex-1 rounded border border-foreground/20 bg-background px-2 py-1 font-mono text-sm"
          />
          <select
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            className="rounded border border-foreground/20 bg-background px-2 py-1 text-sm"
          >
            {labels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (draftText.trim().length === 0) return;
              setTraining((prev) => [...prev, { text: draftText, label: draftLabel }]);
              setDraftText("");
            }}
            className="rounded bg-foreground px-3 py-1 text-sm text-background"
          >
            Add example
          </button>
          <button
            onClick={() => setTraining(NB_TRAINING_SET)}
            className="rounded border border-foreground/20 px-3 py-1 text-sm"
          >
            Reset
          </button>
        </div>
        <details className="text-xs text-foreground/70">
          <summary className="cursor-pointer font-medium">show training data</summary>
          <ul className="mt-2 space-y-1 font-mono">
            {training.map((ex, i) => (
              <li key={i}>
                <span style={{ color: LABEL_COLORS[ex.label] }}>[{ex.label}]</span>{" "}
                {ex.text}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
