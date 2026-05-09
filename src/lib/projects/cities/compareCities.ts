export interface City {
  name: string;
  population: number;
  latitude: number;
  longitude: number;
}

export function compareLexically(a: City, b: City): boolean {
  return a.name.toLowerCase() < b.name.toLowerCase();
}

export function comparePopulation(a: City, b: City): boolean {
  return a.population >= b.population;
}

export function compareLatitude(a: City, b: City): boolean {
  return a.latitude <= b.latitude;
}
