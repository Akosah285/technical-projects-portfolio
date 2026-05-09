import { describe, it, expect } from "vitest";
import {
  INITIAL,
  OUTPUT_MASK,
  SHIFT_MASK,
  bitsFromString,
  shiftIn,
  tick,
  toBinary,
  toHex,
} from "./spiDatapath";

describe("shift behaviour", () => {
  it("on shift_en=1, spi_sdata enters the LSB; old MSB falls off", () => {
    let s = INITIAL;
    s = tick(s, { shift_en: 1, load_en: 0, spi_sdata: 1 });
    expect(s.shiftRegister & 1).toBe(1);
  });

  it("shifting in 16 bits MSB-first reconstructs the byte at the LSB end", () => {
    // pattern 0xA5C3 = 1010 0101 1100 0011
    const pattern = 0xa5c3;
    const bits = bitsFromString(toBinary(pattern, 16));
    const trace = shiftIn(INITIAL, bits);
    expect(trace[trace.length - 1].shiftRegister).toBe(pattern);
  });

  it("ignores spi_sdata when shift_en=0", () => {
    const s = tick(INITIAL, { shift_en: 0, load_en: 0, spi_sdata: 1 });
    expect(s.shiftRegister).toBe(0);
  });

  it("masks to 16 bits — overflow truncates the top bit", () => {
    // pre-load with all ones
    const start = { shiftRegister: SHIFT_MASK, outputRegister: 0 };
    const next = tick(start, { shift_en: 1, load_en: 0, spi_sdata: 0 });
    // 0xFFFF << 1 = 0x1FFFE → masked to 0xFFFE
    expect(next.shiftRegister).toBe(0xfffe);
  });
});

describe("load behaviour", () => {
  it("load_en=1 latches the low 12 bits into output_register", () => {
    const start = { shiftRegister: 0xa5c3, outputRegister: 0 };
    const next = tick(start, { shift_en: 0, load_en: 1, spi_sdata: 0 });
    expect(next.outputRegister).toBe(0xa5c3 & OUTPUT_MASK); // 0x5C3
  });

  it("load_en=0 keeps the previous output_register", () => {
    const start = { shiftRegister: 0xdead, outputRegister: 0x123 };
    const next = tick(start, { shift_en: 1, load_en: 0, spi_sdata: 1 });
    expect(next.outputRegister).toBe(0x123);
  });

  it("load reads the snapshot before this edge — simultaneous shift+load uses the OLD shift_register", () => {
    const start = { shiftRegister: 0xabcd, outputRegister: 0 };
    const next = tick(start, { shift_en: 1, load_en: 1, spi_sdata: 0 });
    // outputRegister should reflect the OLD low 12 bits
    expect(next.outputRegister).toBe(0xabcd & OUTPUT_MASK);
    // and shift register should have shifted with new bit
    expect(next.shiftRegister).toBe(((0xabcd << 1) | 0) & SHIFT_MASK);
  });
});

describe("formatting helpers", () => {
  it("toBinary pads to width", () => {
    expect(toBinary(5, 8)).toBe("00000101");
    expect(toBinary(0xffff, 16)).toBe("1111111111111111");
  });
  it("toHex pads to ceil(width/4)", () => {
    expect(toHex(0xa, 16)).toBe("0x000A");
    expect(toHex(0xabcd, 16)).toBe("0xABCD");
  });
  it("bitsFromString rejects non-binary characters", () => {
    expect(() => bitsFromString("01x10")).toThrow();
  });
});

describe("end-to-end SPI capture", () => {
  it("shift 16 bits, then a single load → output = low 12 bits", () => {
    const pattern = 0xbeef;
    const bits = bitsFromString(toBinary(pattern, 16));
    const trace = shiftIn(INITIAL, bits);
    const final = tick(trace[trace.length - 1], {
      shift_en: 0,
      load_en: 1,
      spi_sdata: 0,
    });
    expect(final.outputRegister).toBe(pattern & OUTPUT_MASK); // 0xEEF
  });
});
