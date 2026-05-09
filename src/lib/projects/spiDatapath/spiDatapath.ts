/**
 * SPI receiver datapath (Lab 4 of ENGS 31, SP20).
 *
 * Mirrors `lab4_datapath.vhd`:
 *
 *   shift_register : 16-bit  — left-shifts on (sclk↑ ∧ shift_en)
 *                              with spi_sdata entering the LSB
 *   output_register : 12-bit — captures shift_register[11:0]
 *                              on (sclk↑ ∧ load_en)
 *   ad_data         : combinational alias of output_register
 *
 * The shift register is unsigned. We keep it as a plain JS number
 * masked to 16 bits.
 */

export const SHIFT_WIDTH = 16;
export const OUTPUT_WIDTH = 12;
export const SHIFT_MASK = 0xffff; // 16-bit
export const OUTPUT_MASK = 0x0fff; // 12-bit

export interface DatapathState {
  shiftRegister: number;
  outputRegister: number;
}

export const INITIAL: DatapathState = {
  shiftRegister: 0,
  outputRegister: 0,
};

export interface ClockEdgeInputs {
  shift_en: 0 | 1;
  load_en: 0 | 1;
  /** Serial data bit captured on this rising edge. */
  spi_sdata: 0 | 1;
}

/** Apply one rising sclk edge to the datapath, returning a fresh state. */
export function tick(state: DatapathState, inputs: ClockEdgeInputs): DatapathState {
  let shift = state.shiftRegister;
  let out = state.outputRegister;

  if (inputs.shift_en === 1) {
    // shift_register <= shift_register(14 downto 0) & spi_sdata
    shift = ((shift << 1) | (inputs.spi_sdata & 1)) & SHIFT_MASK;
  }
  // Per VHDL, both ifs run independently — load uses the value from
  // BEFORE this edge's shift (non-blocking semantics). We capture that.
  if (inputs.load_en === 1) {
    // The load reads the same shift_register snapshot the shift used
    // (registers update simultaneously). We use the value at the
    // start of the edge.
    out = state.shiftRegister & OUTPUT_MASK;
  }
  return { shiftRegister: shift, outputRegister: out };
}

/**
 * Convenience: shift in N bits MSB-first, returning the trace.
 * The bits arrive one per sclk; shift_en should be 1 the whole time.
 */
export function shiftIn(start: DatapathState, bits: (0 | 1)[]): DatapathState[] {
  const trace: DatapathState[] = [start];
  let s = start;
  for (const b of bits) {
    s = tick(s, { shift_en: 1, load_en: 0, spi_sdata: b });
    trace.push(s);
  }
  return trace;
}

/** Format a register as a fixed-width binary string (MSB first). */
export function toBinary(val: number, width: number): string {
  return (val & ((1 << width) - 1)).toString(2).padStart(width, "0");
}

/** Format a register as 0xHHHH. */
export function toHex(val: number, width: number): string {
  const hexDigits = Math.ceil(width / 4);
  return "0x" + (val & ((1 << width) - 1)).toString(16).padStart(hexDigits, "0").toUpperCase();
}

/** Convert a string of '0'/'1' chars (MSB first) into a tuple of bits. */
export function bitsFromString(s: string): (0 | 1)[] {
  const out: (0 | 1)[] = [];
  for (const c of s) {
    if (c === "0") out.push(0);
    else if (c === "1") out.push(1);
    else throw new Error(`bitsFromString: '${c}' is not 0 or 1`);
  }
  return out;
}
