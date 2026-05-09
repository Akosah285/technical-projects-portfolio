"use client";

import { useMemo, useState } from "react";
import { SinglyLinkedHT } from "@/lib/projects/linkedList/linkedList";

type Op =
  | { kind: "add"; idx: number; value: string }
  | { kind: "remove"; idx: number }
  | { kind: "set"; idx: number; value: string }
  | { kind: "appendOther"; values: string[] };

interface Step {
  op: Op;
  before: string[];
  after: string[];
  headEqualsTail: boolean;
  size: number;
}

const SCRIPT_PRESETS: Array<{ label: string; ops: Op[] }> = [
  {
    label: "Build a, b, c at tail",
    ops: [
      { kind: "add", idx: 0, value: "a" },
      { kind: "add", idx: 1, value: "b" },
      { kind: "add", idx: 2, value: "c" },
    ],
  },
  {
    label: "Push to head three times",
    ops: [
      { kind: "add", idx: 0, value: "z" },
      { kind: "add", idx: 0, value: "y" },
      { kind: "add", idx: 0, value: "x" },
    ],
  },
  {
    label: "Append [b, c] onto [a]",
    ops: [
      { kind: "add", idx: 0, value: "a" },
      { kind: "appendOther", values: ["b", "c"] },
      { kind: "add", idx: 3, value: "d" },
    ],
  },
  {
    label: "Remove tail then re-add",
    ops: [
      { kind: "add", idx: 0, value: "a" },
      { kind: "add", idx: 1, value: "b" },
      { kind: "add", idx: 2, value: "c" },
      { kind: "remove", idx: 2 },
      { kind: "add", idx: 2, value: "C" },
    ],
  },
];

function runOps(ops: Op[]): { final: string[]; steps: Step[] } {
  const list = new SinglyLinkedHT<string>();
  const steps: Step[] = [];
  for (const op of ops) {
    const before = list.toArray();
    try {
      if (op.kind === "add") list.add(op.idx, op.value);
      else if (op.kind === "remove") list.remove(op.idx);
      else if (op.kind === "set") list.set(op.idx, op.value);
      else if (op.kind === "appendOther") {
        const other = new SinglyLinkedHT<string>();
        for (let i = 0; i < op.values.length; i++) other.add(i, op.values[i]);
        list.append(other);
      }
    } catch {
      // Show the failed op so users can see what doesn't work.
    }
    steps.push({
      op,
      before,
      after: list.toArray(),
      headEqualsTail: list.headEqualsTail(),
      size: list.size(),
    });
  }
  return { final: list.toArray(), steps };
}

function describeOp(op: Op): string {
  if (op.kind === "add") return `add(${op.idx}, "${op.value}")`;
  if (op.kind === "remove") return `remove(${op.idx})`;
  if (op.kind === "set") return `set(${op.idx}, "${op.value}")`;
  return `append([${op.values.map((v) => `"${v}"`).join(", ")}])`;
}

function ListDiagram({ items, headEqualsTail }: { items: string[]; headEqualsTail: boolean }) {
  if (items.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30 text-sm text-slate-500">
        head → null,&nbsp; tail → null
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-start gap-2">
      <div className="flex flex-col items-center text-xs text-sky-400">
        <span className="rounded bg-sky-500/20 px-2 py-0.5">head</span>
        <span className="text-slate-500">↓</span>
      </div>
      {items.map((v, i) => {
        const isTail = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-mono ${
                isTail ? "border-emerald-500 bg-emerald-500/10" : "border-slate-600 bg-slate-900"
              }`}
            >
              <span className="text-slate-100">{v}</span>
              <span className="text-[10px] text-slate-500">{i}</span>
            </div>
            {i < items.length - 1 ? (
              <span className="text-slate-500">→</span>
            ) : (
              <span className="text-slate-500">→ null</span>
            )}
          </div>
        );
      })}
      <div className="ml-2 flex flex-col items-center text-xs text-emerald-400">
        <span className="text-slate-500">↑</span>
        <span className="rounded bg-emerald-500/20 px-2 py-0.5">tail</span>
      </div>
      {headEqualsTail && (
        <span className="ml-2 self-center rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
          head === tail
        </span>
      )}
    </div>
  );
}

export function LinkedListPlayer() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const { steps } = useMemo(() => runOps(SCRIPT_PRESETS[presetIdx].ops), [presetIdx]);
  const currentStep = steps[stepIdx] ?? null;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 text-slate-100">
      <header>
        <h2 className="text-lg font-semibold">SinglyLinkedHT step-through</h2>
        <p className="mt-1 max-w-xl text-sm text-slate-300">
          A singly-linked list with both head AND tail pointers, ported from
          the SA_3 SinglyLinkedHT.java exercise. The tail pointer makes
          appends O(1) instead of O(n). Pick a script and step through it to
          watch every pointer move.
        </p>
      </header>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Pick a script
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {SCRIPT_PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPresetIdx(i);
                setStepIdx(0);
              }}
              className={`rounded-full border px-3 py-1 text-xs ${
                presetIdx === i
                  ? "border-sky-500 bg-sky-500/20 text-sky-200"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Step {stepIdx + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs disabled:opacity-40"
            >
              ◀ Prev
            </button>
            <button
              type="button"
              onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              disabled={stepIdx >= steps.length - 1}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs disabled:opacity-40"
            >
              Next ▶
            </button>
            <button
              type="button"
              onClick={() => setStepIdx(0)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        {currentStep && (
          <>
            <p className="mt-3 font-mono text-sm text-sky-300">
              list.{describeOp(currentStep.op)};
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Before</p>
                <ListDiagram items={currentStep.before} headEqualsTail={false} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">After</p>
                <ListDiagram
                  items={currentStep.after}
                  headEqualsTail={currentStep.headEqualsTail}
                />
              </div>
              <p className="text-xs text-slate-400">
                size = {currentStep.size}
              </p>
            </div>
          </>
        )}
      </div>

      <details className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">
          All steps in this script
        </summary>
        <ol className="mt-3 space-y-2 text-xs font-mono text-slate-300">
          {steps.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500">{i + 1}.</span>
              <span className="text-sky-300">{describeOp(s.op)}</span>
              <span className="text-slate-500">→</span>
              <span>[{s.after.join(", ")}]</span>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
