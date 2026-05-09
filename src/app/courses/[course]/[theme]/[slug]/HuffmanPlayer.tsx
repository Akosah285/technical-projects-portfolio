"use client";

import { useMemo, useState } from "react";
import {
  buildCodeMap,
  buildFrequencyMap,
  buildTree,
  compressionRatio,
  decode,
  encode,
  isInner,
  isLeaf,
  type HuffmanNode,
} from "@/lib/projects/huffman/huffman";

const PRESETS: Array<{ label: string; text: string }> = [
  { label: "She sells seashells", text: "she sells seashells by the seashore" },
  { label: "Mississippi", text: "mississippi" },
  { label: "Constitution preamble", text: "We the People of the United States" },
  { label: "Single character", text: "aaaaaaaa" },
];

interface FlatNode {
  id: string;
  depth: number;
  index: number;
  parent: string | null;
  isLeaf: boolean;
  data: string | null;
  frequency: number;
  code: string;
}

function flatten(tree: HuffmanNode<string> | null): FlatNode[] {
  if (!tree) return [];
  const out: FlatNode[] = [];

  function visit(node: HuffmanNode<string>, depth: number, index: number, parent: string | null, code: string) {
    const id = `${depth}-${index}`;
    out.push({
      id,
      depth,
      index,
      parent,
      isLeaf: isLeaf(node),
      data: isLeaf(node) ? node.data : null,
      frequency: node.frequency,
      code,
    });
    if (isInner(node)) {
      visit(node.left, depth + 1, index * 2, id, code + "0");
      visit(node.right, depth + 1, index * 2 + 1, id, code + "1");
    }
  }

  visit(tree, 0, 0, null, "");
  return out;
}

function escapeForDisplay(s: string): string {
  if (s === " ") return "␠";
  if (s === "\n") return "↵";
  if (s === "\t") return "→";
  return s;
}

export function HuffmanPlayer() {
  const [text, setText] = useState(PRESETS[0].text);

  const frequency = useMemo(() => buildFrequencyMap(text), [text]);
  const tree = useMemo(() => buildTree(frequency), [frequency]);
  const codes = useMemo(() => buildCodeMap(tree), [tree]);
  const bits = useMemo(() => {
    try {
      return encode(text, codes);
    } catch {
      return "";
    }
  }, [text, codes]);
  const recovered = useMemo(() => decode(bits, tree), [bits, tree]);
  const ratio = useMemo(() => compressionRatio(text, bits), [text, bits]);

  const flat = useMemo(() => flatten(tree), [tree]);

  // Tree layout — assign each node a horizontal slot within its depth
  const maxDepth = flat.reduce((m, n) => Math.max(m, n.depth), 0);
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!tree) return map;
    const W = 760;
    const H = 60 + maxDepth * 60;
    const yStep = H / Math.max(maxDepth + 1, 1);

    function layout(node: HuffmanNode<string>, depth: number, leftX: number, rightX: number) {
      const id = flat.find((f) => f.depth === depth && f.frequency === node.frequency && (f.data ?? null) === (isLeaf(node) ? node.data : null))?.id;
      const x = (leftX + rightX) / 2;
      const y = 30 + depth * yStep;
      if (id) map.set(id, { x, y });
      if (isInner(node)) {
        const mid = (leftX + rightX) / 2;
        layout(node.left, depth + 1, leftX, mid);
        layout(node.right, depth + 1, mid, rightX);
      }
    }
    layout(tree, 0, 0, W);
    return map;
  }, [tree, flat, maxDepth]);

  const sortedFreq = useMemo(
    () => [...frequency.entries()].sort((a, b) => b[1] - a[1]),
    [frequency],
  );

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setText(p.text)}
              className="rounded border border-zinc-300 px-2 py-1 hover:border-zinc-500 dark:border-zinc-700"
            >
              {p.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full rounded border border-zinc-300 bg-transparent p-2 font-mono text-sm dark:border-zinc-700"
          placeholder="Type some text to compress..."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Frequency table</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-700">
                <th className="py-1">Character</th>
                <th className="py-1">Count</th>
                <th className="py-1">Code</th>
              </tr>
            </thead>
            <tbody>
              {sortedFreq.map(([ch, n]) => (
                <tr key={ch} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1 font-mono">{escapeForDisplay(ch)}</td>
                  <td className="py-1 font-mono">{n}</td>
                  <td className="py-1 font-mono text-blue-600 dark:text-blue-400">
                    {codes.get(ch) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Compression</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">Original size</dt>
              <dd className="font-mono">{text.length * 8} bits</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">Encoded size</dt>
              <dd className="font-mono">{bits.length} bits</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">Ratio</dt>
              <dd className="font-mono">
                {text.length === 0 ? "—" : `${Math.round(ratio * 100)}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/70">Round-trip</dt>
              <dd>
                {recovered === text ? (
                  <span className="text-green-600 dark:text-green-400">✓ matches input</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">✗ mismatch</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {tree && flat.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Huffman tree</h3>
          <svg
            viewBox={`0 0 760 ${60 + maxDepth * 60}`}
            className="block w-full max-w-[760px] rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {flat.map((node) => {
              if (!node.parent) return null;
              const me = positions.get(node.id);
              const parent = positions.get(node.parent);
              if (!me || !parent) return null;
              const bit = node.code.slice(-1);
              return (
                <g key={`edge-${node.id}`}>
                  <line
                    x1={parent.x}
                    y1={parent.y}
                    x2={me.x}
                    y2={me.y}
                    stroke="#94a3b8"
                    strokeWidth={1}
                  />
                  <text
                    x={(parent.x + me.x) / 2}
                    y={(parent.y + me.y) / 2}
                    fontSize={10}
                    fill="#3b82f6"
                    textAnchor="middle"
                  >
                    {bit}
                  </text>
                </g>
              );
            })}
            {flat.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              return (
                <g key={node.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={node.isLeaf ? 16 : 12}
                    fill={node.isLeaf ? "#facc15" : "#1e293b"}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    fontSize={node.isLeaf ? 11 : 10}
                    fill={node.isLeaf ? "#1e293b" : "#f8fafc"}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {node.isLeaf ? escapeForDisplay(node.data ?? "") : node.frequency}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500">Encoded bits</h3>
        <pre className="max-h-32 overflow-auto rounded border border-zinc-200 bg-zinc-50 p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900">
          {bits || "(empty)"}
        </pre>
      </div>

      <details className="rounded border border-zinc-200 px-4 py-3 text-sm text-foreground/80 dark:border-zinc-800">
        <summary className="cursor-pointer font-medium">How Huffman coding works</summary>
        <div className="mt-3 space-y-2">
          <p>
            Count how often each character appears. Put one tiny tree per character into a min-heap
            keyed on frequency. Repeatedly pull the two least-frequent trees and combine them under
            a new inner node whose frequency is their sum; push it back. When only one tree
            remains, it&apos;s the Huffman tree.
          </p>
          <p>
            Walk the tree to build a code map: left edges contribute &quot;0&quot;, right edges
            contribute &quot;1&quot;. Frequent characters end up near the root with short codes;
            rare ones get longer codes. Because no leaf is on the path to another leaf, the codes
            form a prefix code that decodes unambiguously.
          </p>
        </div>
      </details>
    </section>
  );
}
