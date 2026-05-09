import { describe, expect, it } from "vitest";
import {
  buildCodeMap,
  buildFrequencyMap,
  buildTree,
  compressionRatio,
  decode,
  encode,
  isInner,
  isLeaf,
} from "./huffman";

describe("buildFrequencyMap", () => {
  it("returns an empty map for an empty string", () => {
    expect(buildFrequencyMap("").size).toBe(0);
  });

  it("counts every character", () => {
    const f = buildFrequencyMap("aab");
    expect(f.get("a")).toBe(2);
    expect(f.get("b")).toBe(1);
  });

  it("is case-sensitive", () => {
    const f = buildFrequencyMap("aA");
    expect(f.get("a")).toBe(1);
    expect(f.get("A")).toBe(1);
  });
});

describe("buildTree", () => {
  it("returns null for an empty frequency map", () => {
    expect(buildTree(new Map())).toBeNull();
  });

  it("returns a single leaf for a single character", () => {
    const t = buildTree(new Map([["a", 5]]))!;
    expect(isLeaf(t)).toBe(true);
    if (isLeaf(t)) expect(t.data).toBe("a");
  });

  it("root frequency equals total of all character frequencies", () => {
    const t = buildTree(new Map([["a", 3], ["b", 2], ["c", 1]]))!;
    expect(t.frequency).toBe(6);
  });

  it("two characters produce a tree of depth 1", () => {
    const t = buildTree(new Map([["a", 1], ["b", 1]]))!;
    expect(isInner(t)).toBe(true);
    if (isInner(t)) {
      expect(isLeaf(t.left)).toBe(true);
      expect(isLeaf(t.right)).toBe(true);
    }
  });
});

describe("buildCodeMap", () => {
  it("returns an empty map for a null tree", () => {
    expect(buildCodeMap(null).size).toBe(0);
  });

  it("a single-leaf tree gets the code '0' so it can still be encoded", () => {
    const t = buildTree(new Map([["a", 5]]))!;
    expect(buildCodeMap(t).get("a")).toBe("0");
  });

  it("every character is reachable in a multi-character tree", () => {
    const t = buildTree(new Map([["a", 3], ["b", 2], ["c", 1]]))!;
    const codes = buildCodeMap(t);
    expect(codes.get("a")).toBeTypeOf("string");
    expect(codes.get("b")).toBeTypeOf("string");
    expect(codes.get("c")).toBeTypeOf("string");
  });

  it("the most-frequent character has a code shorter than (or equal to) the rarest", () => {
    const t = buildTree(new Map([["a", 100], ["b", 5], ["c", 3], ["d", 1]]))!;
    const codes = buildCodeMap(t);
    const aLen = codes.get("a")!.length;
    const dLen = codes.get("d")!.length;
    expect(aLen).toBeLessThanOrEqual(dLen);
  });

  it("no two characters share a code (prefix property)", () => {
    const t = buildTree(buildFrequencyMap("the quick brown fox jumps over the lazy dog"))!;
    const codes = buildCodeMap(t);
    const set = new Set(codes.values());
    expect(set.size).toBe(codes.size);
  });
});

describe("encode + decode round-trip", () => {
  it("recovers the original empty string", () => {
    const text = "";
    const t = buildTree(buildFrequencyMap(text));
    const codes = buildCodeMap(t);
    const bits = encode(text, codes);
    expect(decode(bits, t)).toBe("");
  });

  it("recovers a single-character input", () => {
    const text = "aaaaa";
    const t = buildTree(buildFrequencyMap(text))!;
    const codes = buildCodeMap(t);
    const bits = encode(text, codes);
    expect(bits).toBe("00000");
    expect(decode(bits, t)).toBe("aaaaa");
  });

  it("recovers a longer mixed string", () => {
    const text = "she sells seashells by the seashore";
    const t = buildTree(buildFrequencyMap(text))!;
    const codes = buildCodeMap(t);
    const bits = encode(text, codes);
    expect(decode(bits, t)).toBe(text);
  });

  it("encode throws when asked to encode a character with no code", () => {
    const t = buildTree(buildFrequencyMap("abc"))!;
    const codes = buildCodeMap(t);
    expect(() => encode("d", codes)).toThrow();
  });
});

describe("compressionRatio", () => {
  it("is 0 for an empty input", () => {
    expect(compressionRatio("", "")).toBe(0);
  });

  it("is encoded.length / (text.length * 8)", () => {
    expect(compressionRatio("aaaa", "0000")).toBe(4 / (4 * 8));
  });
});
