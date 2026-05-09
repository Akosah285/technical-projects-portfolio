"use client";

import { useEffect, useRef, useState } from "react";
import { Counter, Timer, formatCounter, formatTimer } from "@/lib/projects/oop/counterTimer";

const MAX_LOG = 12;

export function CounterAndTimerPlayer() {
  return (
    <section className="space-y-6">
      <p className="text-sm text-foreground/70">
        Two small classes from the OOP lab, ported faithfully to TypeScript and
        wired up to live UI controls. Each panel shows the same encapsulated state +
        public methods the original Python defines, plus a method-call log so the
        abstraction stays visible as you click.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <CounterPanel />
        <TimerPanel />
      </div>
    </section>
  );
}

function CounterPanel() {
  const [limit, setLimit] = useState(10);
  const [minDigits, setMinDigits] = useState(2);
  const [counter, setCounter] = useState<Counter>(() => new Counter(10, 9, 2));
  const [version, setVersion] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  function call(method: string, body: () => void) {
    body();
    setLog((l) => [`${new Date().toLocaleTimeString()}  Counter.${method}`, ...l].slice(0, MAX_LOG));
    setVersion((n) => n + 1);
  }

  function rebuild() {
    setCounter(new Counter(limit, limit - 1, minDigits));
    setLog((l) => [`${new Date().toLocaleTimeString()}  new Counter(${limit}, ${limit - 1}, ${minDigits})`, ...l].slice(0, MAX_LOG));
    setVersion((n) => n + 1);
  }

  // version is read so React knows to re-render after in-place mutations
  void version;

  return (
    <div className="space-y-3 rounded-lg border border-foreground/15 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Counter</h2>
        <code className="text-xs text-foreground/60">counterclass.py</code>
      </div>

      <div className="grid grid-cols-3 items-end gap-3 text-xs">
        <label className="space-y-1">
          <span>limit</span>
          <input
            type="number"
            min={1}
            max={9999}
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-md border border-foreground/20 bg-background px-2 py-1"
          />
        </label>
        <label className="space-y-1">
          <span>min_digits</span>
          <input
            type="number"
            min={1}
            max={6}
            value={minDigits}
            onChange={(e) => setMinDigits(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-md border border-foreground/20 bg-background px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={rebuild}
          className="rounded-md border border-foreground/20 px-2 py-1 hover:bg-foreground/5"
        >
          Rebuild
        </button>
      </div>

      <div className="rounded-md border border-foreground/15 bg-zinc-950 px-4 py-6 text-center font-mono text-4xl text-emerald-300">
        {formatCounter(counter)}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => call("tick()", () => counter.tick())}
          className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90"
        >
          tick()
        </button>
        <button
          type="button"
          onClick={() => call("get_value()", () => {})}
          className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          get_value() → {counter.getValue()}
        </button>
        <button
          type="button"
          onClick={rebuild}
          className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          reset
        </button>
      </div>

      <MethodLog title="Counter — method calls" log={log} />
    </div>
  );
}

function TimerPanel() {
  const [hh, setHh] = useState(0);
  const [mm, setMm] = useState(1);
  const [ss, setSs] = useState(30);
  const [timer, setTimer] = useState<Timer>(() => new Timer(0, 1, 30));
  const [version, setVersion] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  function appendLog(line: string) {
    setLog((l) => [`${new Date().toLocaleTimeString()}  Timer.${line}`, ...l].slice(0, MAX_LOG));
  }

  function rebuild() {
    setTimer(new Timer(hh, mm, ss));
    setRunning(false);
    appendLog(`new Timer(${hh}, ${mm}, ${ss})`);
    setVersion((n) => n + 1);
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      timer.tick();
      setVersion((n) => n + 1);
      if (timer.isZero()) {
        setRunning(false);
      }
    }, 1000);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, timer]);

  void version;

  return (
    <div className="space-y-3 rounded-lg border border-foreground/15 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Timer</h2>
        <code className="text-xs text-foreground/60">timer.py</code>
      </div>

      <div className="grid grid-cols-4 items-end gap-2 text-xs">
        <label className="space-y-1">
          <span>hh</span>
          <input
            type="number"
            min={0}
            max={23}
            value={hh}
            onChange={(e) => setHh(Math.max(0, Math.min(23, Number(e.target.value))))}
            className="w-full rounded-md border border-foreground/20 bg-background px-2 py-1"
          />
        </label>
        <label className="space-y-1">
          <span>mm</span>
          <input
            type="number"
            min={0}
            max={59}
            value={mm}
            onChange={(e) => setMm(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full rounded-md border border-foreground/20 bg-background px-2 py-1"
          />
        </label>
        <label className="space-y-1">
          <span>ss</span>
          <input
            type="number"
            min={0}
            max={59}
            value={ss}
            onChange={(e) => setSs(Math.max(0, Math.min(59, Number(e.target.value))))}
            className="w-full rounded-md border border-foreground/20 bg-background px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={rebuild}
          className="rounded-md border border-foreground/20 px-2 py-1 hover:bg-foreground/5"
        >
          Rebuild
        </button>
      </div>

      <div className="rounded-md border border-foreground/15 bg-zinc-950 px-4 py-6 text-center font-mono text-4xl text-emerald-300">
        {formatTimer(timer)}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            if (!running) {
              setRunning(true);
              appendLog("start  (1-second tick interval)");
            }
          }}
          disabled={running || timer.isZero()}
          className="rounded-md bg-foreground px-3 py-1 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          ▶ start
        </button>
        <button
          type="button"
          onClick={() => {
            if (running) {
              setRunning(false);
              appendLog("pause");
            }
          }}
          disabled={!running}
          className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5 disabled:opacity-40"
        >
          ❚❚ pause
        </button>
        <button
          type="button"
          onClick={() => {
            timer.tick();
            appendLog("tick()");
            setVersion((n) => n + 1);
          }}
          className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          tick()
        </button>
        <button
          type="button"
          onClick={rebuild}
          className="rounded-md border border-foreground/20 px-3 py-1 text-sm hover:bg-foreground/5"
        >
          reset
        </button>
      </div>

      {timer.isZero() && (
        <p className="text-xs text-amber-600">Timer reached 00:00:00 (is_zero() → true).</p>
      )}

      <MethodLog title="Timer — method calls" log={log} />
    </div>
  );
}

function MethodLog({ title, log }: { title: string; log: string[] }) {
  return (
    <div className="rounded-md border border-foreground/15 bg-foreground/5 p-2">
      <div className="text-xs font-medium text-foreground/70">{title}</div>
      <pre className="mt-1 max-h-40 overflow-auto font-mono text-[11px] leading-relaxed text-foreground/80">
        {log.length === 0 ? "(no calls yet)" : log.join("\n")}
      </pre>
    </div>
  );
}
