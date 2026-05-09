export interface ProjectionInput {
  lon: number;
  lat: number;
  width: number;
  height: number;
}

export interface ProjectionOutput {
  x: number;
  y: number;
}

export function lonLatToXY(input: ProjectionInput): ProjectionOutput {
  const { lon, lat, width, height } = input;
  const x = width / 2 + (lon * width) / 360;
  const y = height / 2 - (lat * height) / 180;
  return { x, y };
}
