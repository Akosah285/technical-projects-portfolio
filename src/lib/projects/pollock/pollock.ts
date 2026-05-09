/**
 * Pollock canvas — a swarm of wandering pixels that leave a colour trail
 * wherever they go.
 *
 * Faithful TypeScript port of the WI19 SA_2 Pollock + WanderingPixel + Blob
 * trio (Pollock.java, WanderingPixel.java, plus the implicit Wanderer
 * superclass that randomised dx/dy each step).
 *
 * The Java original used a Swing JFrame and a BufferedImage; here the
 * "canvas" is just a `Trail` matrix of RGB strings the player can render to
 * a real <canvas>. The deep module stays UI-agnostic so it can be tested
 * deterministically by injecting an RNG.
 */

export type Rng = () => number;

export interface PixelState {
  x: number;
  y: number;
  /** CSS colour string (e.g. "#ff8800"). */
  color: string;
}

export interface PollockConfig {
  width: number;
  height: number;
  pixelCount: number;
  /** A 0..1 RNG, defaults to Math.random. */
  rng?: Rng;
}

export class Pollock {
  readonly width: number;
  readonly height: number;
  pixels: PixelState[];
  /** rgb string at each (y * width + x) cell, or null if unpainted. */
  trail: (string | null)[];

  private rng: Rng;

  constructor(config: PollockConfig) {
    if (config.width <= 0 || config.height <= 0) {
      throw new Error("Canvas dimensions must be positive");
    }
    this.width = config.width;
    this.height = config.height;
    this.rng = config.rng ?? Math.random;
    this.trail = new Array(this.width * this.height).fill(null);
    this.pixels = [];
    for (let i = 0; i < config.pixelCount; i++) {
      this.pixels.push(this.spawnPixel());
    }
  }

  private spawnPixel(): PixelState {
    const x = Math.floor(this.rng() * this.width);
    const y = Math.floor(this.rng() * this.height);
    const hue = Math.floor(this.rng() * 360);
    const sat = 60 + Math.floor(this.rng() * 40);
    const light = 45 + Math.floor(this.rng() * 25);
    return { x, y, color: `hsl(${hue}, ${sat}%, ${light}%)` };
  }

  /**
   * Advance `count` randomly-chosen pixels by one step. Each step:
   *  1. paint the pixel's current cell with its colour (the trail)
   *  2. nudge the pixel one cell in a random ±1 direction (per axis)
   *  3. clamp to the canvas
   */
  step(count: number): void {
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(this.rng() * this.pixels.length);
      const p = this.pixels[idx];
      if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
        this.trail[p.y * this.width + p.x] = p.color;
      }
      const dx = Math.floor(this.rng() * 3) - 1;
      const dy = Math.floor(this.rng() * 3) - 1;
      p.x = Math.max(0, Math.min(this.width - 1, p.x + dx));
      p.y = Math.max(0, Math.min(this.height - 1, p.y + dy));
    }
  }

  /** Number of trail cells that have been painted at least once. */
  paintedCells(): number {
    let n = 0;
    for (const cell of this.trail) {
      if (cell !== null) n++;
    }
    return n;
  }

  /** Wipe the trail and respawn every pixel. */
  reset(pixelCount?: number): void {
    this.trail.fill(null);
    const n = pixelCount ?? this.pixels.length;
    this.pixels = [];
    for (let i = 0; i < n; i++) {
      this.pixels.push(this.spawnPixel());
    }
  }
}
