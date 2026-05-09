import { describe, expect, it } from "vitest";
import { xorBytes, formatByteCell, bytesFromText } from "./xorCipher";

describe("xorBytes", () => {
  it("returns an empty Uint8Array for an empty block", () => {
    const result = xorBytes(new Uint8Array([0, 0, 0]), new Uint8Array([]));
    expect(Array.from(result)).toEqual([]);
  });

  it("XORs a single byte against a single-byte key", () => {
    const result = xorBytes(new Uint8Array([0xff]), new Uint8Array([0x0f]));
    expect(Array.from(result)).toEqual([0xf0]);
  });

  it("XORs each byte index-aligned with the key", () => {
    const key = new Uint8Array([0xaa, 0x55, 0x0f]);
    const block = new Uint8Array([0x55, 0xaa, 0xf0]);
    expect(Array.from(xorBytes(key, block))).toEqual([0xff, 0xff, 0xff]);
  });

  it("is reversible — xor(key, xor(key, block)) === block", () => {
    const key = new Uint8Array([12, 34, 56, 78, 90]);
    const block = new Uint8Array([1, 2, 3, 4, 5]);
    const cipher = xorBytes(key, block);
    const back = xorBytes(key, cipher);
    expect(Array.from(back)).toEqual(Array.from(block));
  });

  it("returns the block unchanged when the key is all zero bytes", () => {
    const block = new Uint8Array([72, 101, 108, 108, 111]);
    const result = xorBytes(new Uint8Array([0, 0, 0, 0, 0]), block);
    expect(Array.from(result)).toEqual(Array.from(block));
  });

  it("throws when the key is shorter than the block", () => {
    expect(() => xorBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toThrow();
  });
});

describe("formatByteCell", () => {
  it("returns the printable ASCII character for printable bytes", () => {
    expect(formatByteCell(65)).toEqual({ text: "A", isPrintable: true });
    expect(formatByteCell(122)).toEqual({ text: "z", isPrintable: true });
  });

  it("returns hex for non-printable bytes", () => {
    expect(formatByteCell(0x00)).toEqual({ text: "00", isPrintable: false });
    expect(formatByteCell(0xff)).toEqual({ text: "FF", isPrintable: false });
    expect(formatByteCell(0x0a)).toEqual({ text: "0A", isPrintable: false });
  });

  it("treats space as printable but tab/newline as non-printable", () => {
    expect(formatByteCell(0x20).isPrintable).toBe(true);
    expect(formatByteCell(0x09).isPrintable).toBe(false);
  });
});

describe("bytesFromText", () => {
  it("converts ASCII text to Uint8Array of code points", () => {
    expect(Array.from(bytesFromText("Hi"))).toEqual([0x48, 0x69]);
  });

  it("encodes non-ASCII characters as UTF-8 multi-byte sequences", () => {
    const result = bytesFromText("é");
    expect(Array.from(result)).toEqual([0xc3, 0xa9]);
  });

  it("returns an empty array for an empty string", () => {
    expect(Array.from(bytesFromText(""))).toEqual([]);
  });
});
