export interface Stick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface StringArtParams {
  stickA: Stick;
  stickB: Stick;
  n: number;
}

export interface StringArtLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface StringArtResult {
  sticks: StringArtLine[];
  strings: StringArtLine[];
}

export function stringArtLines(p: StringArtParams): StringArtResult {
  const { stickA, stickB, n } = p;
  const stickColor = "rgb(255, 0, 0)";
  const sticks: StringArtLine[] = [
    { ...stickA, color: stickColor },
    { ...stickB, color: stickColor },
  ];

  const strings: StringArtLine[] = [];
  for (let x = 0; x <= n; x++) {
    const t = x / n;
    const x1 = stickA.x1 + t * (stickA.x2 - stickA.x1);
    const y1 = stickA.y1 + t * (stickA.y2 - stickA.y1);
    const x2 = stickB.x1 + (1.0 - t) * (stickB.x2 - stickB.x1);
    const y2 = stickB.y1 + (1.0 - t) * (stickB.y2 - stickB.y1);
    const green = Math.round(t * 255);
    strings.push({ x1, y1, x2, y2, color: `rgb(0, ${green}, 255)` });
  }

  return { sticks, strings };
}
