/**
 * Huffman coding — faithful TypeScript port of the PS_3 Java HuffmanTree +
 * CompressFile classes from Dartmouth COSC 10 (Winter 2019).
 *
 * The pipeline is:
 *   text  →  frequency map
 *         →  priority queue of leaf trees, sorted by frequency
 *         →  Huffman code tree (repeatedly combine the two least-frequent
 *            trees into a new inner node whose frequency is their sum)
 *         →  code map (for each character, the bit string from root to leaf)
 *         →  encoded bit string (concatenation of each character's code)
 *
 * decode walks the tree one bit at a time, emitting a character whenever it
 * lands on a leaf and then resetting back to the root.
 */

export type HuffmanNode<E> =
  | { kind: "leaf"; data: E; frequency: number }
  | { kind: "inner"; left: HuffmanNode<E>; right: HuffmanNode<E>; frequency: number };

export function isLeaf<E>(n: HuffmanNode<E>): n is { kind: "leaf"; data: E; frequency: number } {
  return n.kind === "leaf";
}

export function isInner<E>(
  n: HuffmanNode<E>,
): n is { kind: "inner"; left: HuffmanNode<E>; right: HuffmanNode<E>; frequency: number } {
  return n.kind === "inner";
}

export function leaf<E>(data: E, frequency: number): HuffmanNode<E> {
  return { kind: "leaf", data, frequency };
}

export function inner<E>(left: HuffmanNode<E>, right: HuffmanNode<E>): HuffmanNode<E> {
  return { kind: "inner", left, right, frequency: left.frequency + right.frequency };
}

export function buildFrequencyMap(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  return freq;
}

/**
 * Build the Huffman code tree from a frequency map. Returns null for an empty
 * map. For a map with a single character, a synthetic single-leaf "tree" is
 * still produced (matches the Java original's behavior — the leaf is the root
 * and the empty bit string is its code).
 */
export function buildTree(frequency: Map<string, number>): HuffmanNode<string> | null {
  if (frequency.size === 0) return null;

  const queue: HuffmanNode<string>[] = [];
  for (const [ch, n] of frequency.entries()) {
    queue.push(leaf(ch, n));
  }
  // Maintain a min-heap-on-frequency by re-sorting after each insert. n is
  // tiny here (alphabet size), so a sort is fine.
  queue.sort((a, b) => a.frequency - b.frequency);

  if (queue.length === 1) return queue[0];

  while (queue.length > 1) {
    const a = queue.shift()!;
    const b = queue.shift()!;
    const combined = inner(a, b);
    let i = 0;
    while (i < queue.length && queue[i].frequency <= combined.frequency) i++;
    queue.splice(i, 0, combined);
  }

  return queue[0];
}

/**
 * Build a character → bit-string code map by walking the tree. Left = "0",
 * right = "1". A single-leaf tree (only one distinct character in the input)
 * gets the code "0" so it can still be encoded.
 */
export function buildCodeMap(tree: HuffmanNode<string> | null): Map<string, string> {
  const codes = new Map<string, string>();
  if (!tree) return codes;
  if (isLeaf(tree)) {
    codes.set(tree.data, "0");
    return codes;
  }
  walk(tree, "", codes);
  return codes;
}

function walk(node: HuffmanNode<string>, prefix: string, codes: Map<string, string>): void {
  if (isLeaf(node)) {
    codes.set(node.data, prefix);
    return;
  }
  walk(node.left, prefix + "0", codes);
  walk(node.right, prefix + "1", codes);
}

export function encode(text: string, codes: Map<string, string>): string {
  let out = "";
  for (const ch of text) {
    const code = codes.get(ch);
    if (code === undefined) {
      throw new Error(`No code for character: ${JSON.stringify(ch)}`);
    }
    out += code;
  }
  return out;
}

/**
 * Walk the bit string against the tree, emitting a character whenever the
 * walk lands on a leaf. Returns "" for an empty tree.
 */
export function decode(bits: string, tree: HuffmanNode<string> | null): string {
  if (!tree) return "";
  let out = "";
  let node = tree;
  // Single-leaf tree: every "0" emits its sole character.
  if (isLeaf(tree)) {
    for (let i = 0; i < bits.length; i++) out += tree.data;
    return out;
  }
  for (const bit of bits) {
    if (!isInner(node)) {
      // Defensive: a leaf encountered mid-traversal is a corrupt input.
      throw new Error("Decode error: hit a leaf with bits still remaining");
    }
    node = bit === "0" ? node.left : node.right;
    if (isLeaf(node)) {
      out += node.data;
      node = tree;
    }
  }
  return out;
}

export function compressionRatio(text: string, encoded: string): number {
  if (text.length === 0) return 0;
  const originalBits = text.length * 8;
  return encoded.length / originalBits;
}
