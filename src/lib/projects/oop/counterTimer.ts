export class Counter {
  readonly limit: number;
  readonly minDigits: number;
  private value: number;

  constructor(limit: number, initial = 0, minDigits = 1) {
    this.limit = limit;
    this.minDigits = minDigits;
    if (initial < 0 || initial > limit - 1) {
      this.value = limit - 1;
    } else {
      this.value = initial;
    }
  }

  getValue(): number {
    return this.value;
  }

  tick(): boolean {
    if (this.value - 1 < 0) {
      this.value = this.limit - 1;
      return true;
    }
    this.value = this.value - 1;
    return false;
  }
}

export function formatCounter(c: Counter): string {
  const s = String(c.getValue());
  const pad = c.minDigits - s.length;
  return pad > 0 ? "0".repeat(pad) + s : s;
}

export class Timer {
  readonly hours: Counter;
  readonly minutes: Counter;
  readonly seconds: Counter;

  constructor(hours = 23, minutes = 59, seconds = 59) {
    this.hours = new Counter(24, hours, 2);
    this.minutes = new Counter(60, minutes, 2);
    this.seconds = new Counter(60, seconds, 2);
  }

  tick(): void {
    if (this.seconds.tick()) {
      if (this.minutes.tick()) {
        this.hours.tick();
      }
    }
  }

  isZero(): boolean {
    return (
      this.hours.getValue() === 0 &&
      this.minutes.getValue() === 0 &&
      this.seconds.getValue() === 0
    );
  }
}

export function formatTimer(t: Timer): string {
  return `${formatCounter(t.hours)}:${formatCounter(t.minutes)}:${formatCounter(t.seconds)}`;
}
