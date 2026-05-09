"use client";

import { useEffect, useRef, useState } from "react";
import {
  simulatePortia,
  simulateRich,
  PORTIA_CONSTANTS,
  RICH_CONSTANTS,
  type PortiaYear,
  type RichYear,
} from "@/lib/projects/firstPrograms/firstPrograms";

const TICK_MS = 4;

export function PortiaPlayer() {
  return (
    <CompoundInterestPlayer
      title="Portia vs Brutus"
      subtitle={`Brutus deposits $${PORTIA_CONSTANTS.brutusInitial.toFixed(2)} at ${PORTIA_CONSTANTS.brutusRate}% per year. Portia deposits $${PORTIA_CONSTANTS.portiaInitial.toLocaleString()} at ${PORTIA_CONSTANTS.portiaRate}% per year. Press Run to fast-forward year by year.`}
      build={() => buildPortiaLog()}
    />
  );
}

export function RichPlayer() {
  return (
    <CompoundInterestPlayer
      title="From One Dollar to a Border Wall"
      subtitle={`Brutus deposits $${RICH_CONSTANTS.brutusInitial.toFixed(2)} at year 1 AD at ${RICH_CONSTANTS.brutusRate}% per year. By ${RICH_CONSTANTS.currentYear}, how many $21.6-billion border walls could that fund?`}
      build={() => buildRichLog()}
    />
  );
}

function buildPortiaLog(): string[] {
  const log = simulatePortia();
  const lines: string[] = [
    `Year 1: Brutus = $${formatMoney(log[0].brutus)}, Portia = $${formatMoney(log[0].portia)}`,
  ];
  if (log.length > 1) {
    const last = log[log.length - 1];
    const sample = sampleProgress(log);
    for (const entry of sample) {
      lines.push(`Year ${entry.year}: Brutus = $${formatMoney(entry.brutus)}, Portia = $${formatMoney(entry.portia)}`);
    }
    lines.push("");
    lines.push(`${last.year} is the first time Brutus' balance exceeded Portia's.`);
    lines.push(`In that year, Brutus = $${formatMoney(last.brutus)}, Portia = $${formatMoney(last.portia)}.`);
  }
  return lines;
}

function buildRichLog(): string[] {
  const log = simulateRich();
  const last = log[log.length - 1];
  const lines: string[] = [
    `Year 1: balance = $${formatMoney(log[0].balance)}, walls fundable = ${log[0].walls.toLocaleString()}`,
  ];
  const sample = sampleProgress(log);
  for (const entry of sample) {
    lines.push(`Year ${entry.year}: balance = $${formatMoney(entry.balance)}, walls = ${entry.walls.toLocaleString()}`);
  }
  lines.push("");
  lines.push(`At year ${RICH_CONSTANTS.currentYear}, the balance is $${formatMoney(last.balance)}.`);
  lines.push(`Walls fundable at $${RICH_CONSTANTS.wallCost.toExponential(2)} each: ${last.walls.toLocaleString()}.`);
  return lines;
}

function sampleProgress<T extends PortiaYear | RichYear>(log: T[]): T[] {
  if (log.length <= 12) return log.slice(1);
  const sampled: T[] = [];
  const stride = Math.floor(log.length / 10);
  for (let i = stride; i < log.length - 1; i += stride) sampled.push(log[i]);
  return sampled;
}

function formatMoney(value: number): string {
  if (value >= 1e9) return value.toExponential(4);
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface CompoundInterestPlayerProps {
  title: string;
  subtitle: string;
  build: () => string[];
}

function CompoundInterestPlayer({ title, subtitle, build }: CompoundInterestPlayerProps) {
  const [allLines, setAllLines] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running || revealed >= allLines.length) return;
    intervalRef.current = window.setInterval(() => {
      setRevealed((r) => Math.min(r + 1, allLines.length));
    }, TICK_MS);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, revealed, allLines.length]);

  function handleRun() {
    if (allLines.length === 0) {
      const lines = build();
      setAllLines(lines);
      setRevealed(0);
      setRunning(true);
    } else if (revealed >= allLines.length) {
      setRevealed(0);
      setRunning(true);
    } else {
      setRunning(true);
    }
  }

  function handleStop() {
    setRunning(false);
  }

  function handleReveal() {
    if (allLines.length === 0) {
      const lines = build();
      setAllLines(lines);
      setRevealed(lines.length);
    } else {
      setRevealed(allLines.length);
    }
    setRunning(false);
  }

  function handleClear() {
    setAllLines([]);
    setRevealed(0);
    setRunning(false);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-foreground/70">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="rounded-md bg-foreground px-3 py-1 font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          ▶ Run
        </button>
        <button
          type="button"
          onClick={handleStop}
          disabled={!running}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          ■ Stop
        </button>
        <button
          type="button"
          onClick={handleReveal}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Reveal all
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Clear
        </button>
      </div>

      <pre className="max-h-96 overflow-auto rounded-md border border-foreground/15 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-emerald-300">
        {allLines.length === 0 ? (
          <span className="text-zinc-500">$ python {title === "Portia vs Brutus" ? "portia.py" : "rich.py"}{"\n"}</span>
        ) : (
          allLines
            .slice(0, revealed)
            .map((line) => `${line}\n`)
            .join("")
        )}
        {running && <span className="animate-pulse text-emerald-400">▌</span>}
      </pre>
    </section>
  );
}
