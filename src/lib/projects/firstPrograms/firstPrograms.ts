export function choose(n: number, k: number): number {
  if (k === 0 || k === n) return 1;
  return choose(n - 1, k) + choose(n - 1, k - 1);
}

export const PORTIA_CONSTANTS = {
  brutusRate: 5,
  brutusInitial: 1.0,
  portiaRate: 4,
  portiaInitial: 100000.0,
  currentYear: 2018,
} as const;

export interface PortiaYear {
  year: number;
  brutus: number;
  portia: number;
}

export function simulatePortia(): PortiaYear[] {
  const { brutusRate, brutusInitial, portiaRate, portiaInitial, currentYear } = PORTIA_CONSTANTS;
  const log: PortiaYear[] = [];

  let year = 1;
  let brutus = (1 + brutusRate / 100) * brutusInitial;
  let portia = (1 + portiaRate / 100) * portiaInitial;
  log.push({ year, brutus, portia });

  while (year < currentYear && brutus < portia) {
    year += 1;
    brutus = brutus * (1 + brutusRate / 100);
    portia = portia * (1 + portiaRate / 100);
    log.push({ year, brutus, portia });
  }

  return log;
}

export const RICH_CONSTANTS = {
  brutusRate: 5,
  brutusInitial: 1.0,
  currentYear: 2018,
  wallCost: 2.16e10,
} as const;

export interface RichYear {
  year: number;
  balance: number;
  walls: number;
}

export function simulateRich(): RichYear[] {
  const { brutusRate, brutusInitial, currentYear, wallCost } = RICH_CONSTANTS;
  const log: RichYear[] = [];

  let year = 1;
  let balance = (1 + brutusRate / 100) * brutusInitial;
  log.push({ year, balance, walls: Math.floor(balance / wallCost) });

  while (year < currentYear) {
    year += 1;
    balance = balance * (1 + brutusRate / 100);
    log.push({ year, balance, walls: Math.floor(balance / wallCost) });
  }

  return log;
}
