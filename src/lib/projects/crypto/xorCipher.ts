export function xorBytes(key: Uint8Array, block: Uint8Array): Uint8Array {
  if (key.length < block.length) {
    throw new Error(`Key (${key.length} bytes) must be at least as long as block (${block.length} bytes)`);
  }
  const out = new Uint8Array(block.length);
  for (let i = 0; i < block.length; i++) {
    out[i] = block[i] ^ key[i];
  }
  return out;
}

export interface ByteCell {
  text: string;
  isPrintable: boolean;
}

export function formatByteCell(b: number): ByteCell {
  if (b >= 0x20 && b <= 0x7e) {
    return { text: String.fromCharCode(b), isPrintable: true };
  }
  return { text: b.toString(16).toUpperCase().padStart(2, "0"), isPrintable: false };
}

export function bytesFromText(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}
