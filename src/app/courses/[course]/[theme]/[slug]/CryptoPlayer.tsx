"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  xorBytes,
  formatByteCell,
  bytesFromText,
} from "@/lib/projects/crypto/xorCipher";

const DEFAULT_PLAINTEXT = "ATTACK AT DAWN";
const DEFAULT_KEY = "MY-SECRET-PAD-9";
const STEP_INTERVAL_MS = 250;
const MAX_LENGTH = 64;

export function CryptoPlayer() {
  const [plaintext, setPlaintext] = useState(DEFAULT_PLAINTEXT);
  const [key, setKey] = useState(DEFAULT_KEY);
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const plainBytes = useMemo(() => bytesFromText(plaintext), [plaintext]);
  const keyBytes = useMemo(() => bytesFromText(key), [key]);

  const usableLength = Math.min(plainBytes.length, keyBytes.length);
  const cipherBytes = useMemo(() => {
    if (usableLength === 0) return new Uint8Array(0);
    const trimmedKey = keyBytes.subarray(0, usableLength);
    const trimmedBlock = plainBytes.subarray(0, usableLength);
    return xorBytes(trimmedKey, trimmedBlock);
  }, [plainBytes, keyBytes, usableLength]);

  const decryptedBytes = useMemo(() => {
    if (usableLength === 0) return new Uint8Array(0);
    const trimmedKey = keyBytes.subarray(0, usableLength);
    return xorBytes(trimmedKey, cipherBytes);
  }, [cipherBytes, keyBytes, usableLength]);

  useEffect(() => {
    if (!isPlaying || usableLength === 0) return;
    if (step >= usableLength) return;
    intervalRef.current = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, usableLength));
    }, STEP_INTERVAL_MS);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, step, usableLength]);

  function handlePlaintextChange(value: string) {
    const trimmed = value.slice(0, MAX_LENGTH);
    setPlaintext(trimmed);
    setStep(0);
    setIsPlaying(false);
  }

  function handleKeyChange(value: string) {
    const trimmed = value.slice(0, MAX_LENGTH);
    setKey(trimmed);
    setStep(0);
    setIsPlaying(false);
  }

  function handleReset() {
    setStep(0);
    setIsPlaying(false);
  }

  function handlePlay() {
    if (step >= usableLength) setStep(0);
    setIsPlaying(true);
  }

  function handleStep() {
    setIsPlaying(false);
    setStep((s) => Math.min(s + 1, usableLength));
  }

  function handleReveal() {
    setIsPlaying(false);
    setStep(usableLength);
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Plaintext</span>
          <input
            type="text"
            value={plaintext}
            onChange={(e) => handlePlaintextChange(e.target.value)}
            maxLength={MAX_LENGTH}
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 font-mono text-sm focus:border-foreground/50 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Key (one-time pad)</span>
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            maxLength={MAX_LENGTH}
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 font-mono text-sm focus:border-foreground/50 focus:outline-none"
          />
        </label>
      </div>

      {keyBytes.length < plainBytes.length && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          The key is shorter than the plaintext. Only the first {usableLength} byte
          {usableLength === 1 ? "" : "s"} can be encrypted (the original{" "}
          <code>xor_block</code> asserts the key is at least as long as the block).
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying || usableLength === 0}
          className="rounded-md bg-foreground px-3 py-1 font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          {step >= usableLength ? "Replay" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying(false)}
          disabled={!isPlaying}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={handleStep}
          disabled={step >= usableLength}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Step
        </button>
        <button
          type="button"
          onClick={handleReveal}
          disabled={step >= usableLength}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5 disabled:opacity-40"
        >
          Reveal all
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-foreground/20 px-3 py-1 hover:bg-foreground/5"
        >
          Reset
        </button>
        <span className="ml-auto rounded-md bg-foreground/5 px-2 py-1 font-mono text-xs">
          {Math.min(step, usableLength)} / {usableLength}
        </span>
      </div>

      <ByteRow
        title="Plaintext"
        bytes={plainBytes.subarray(0, usableLength)}
        activeIndex={step < usableLength ? step : null}
        revealed={usableLength}
        accent="text-emerald-600 dark:text-emerald-300"
      />
      <ByteRow
        title="Key"
        bytes={keyBytes.subarray(0, usableLength)}
        activeIndex={step < usableLength ? step : null}
        revealed={usableLength}
        accent="text-sky-600 dark:text-sky-300"
      />
      <ByteRow
        title="Ciphertext (= Plaintext XOR Key)"
        bytes={cipherBytes}
        activeIndex={step < usableLength ? step : null}
        revealed={step}
        accent="text-rose-600 dark:text-rose-300"
      />
      <ByteRow
        title="Decrypted (= Ciphertext XOR Key)"
        bytes={decryptedBytes}
        activeIndex={step < usableLength ? step : null}
        revealed={step}
        accent="text-violet-600 dark:text-violet-300"
      />

      <p className="text-xs text-foreground/60">
        Each ciphertext byte is computed by XOR-ing the corresponding plaintext byte
        with the key byte, exactly the same operation as <code>xor_block</code> in the
        original <code>crypto.py</code>. XOR is its own inverse, so applying the key a
        second time recovers the plaintext.
      </p>
    </section>
  );
}

interface ByteRowProps {
  title: string;
  bytes: Uint8Array;
  activeIndex: number | null;
  revealed: number;
  accent: string;
}

function ByteRow({ title, bytes, activeIndex, revealed, accent }: ByteRowProps) {
  return (
    <div className="space-y-2">
      <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
      <div className="flex flex-wrap gap-1 rounded-md border border-foreground/15 bg-foreground/5 p-2">
        {bytes.length === 0 ? (
          <span className="font-mono text-xs text-foreground/40">(empty)</span>
        ) : (
          Array.from(bytes).map((b, i) => {
            const isActive = i === activeIndex;
            const isRevealed = i < revealed;
            const cell = formatByteCell(b);
            return (
              <span
                key={i}
                className={[
                  "flex h-10 w-10 flex-col items-center justify-center rounded border font-mono text-xs transition-colors",
                  isActive
                    ? "border-amber-500 bg-amber-500/30"
                    : isRevealed
                      ? "border-foreground/20 bg-background"
                      : "border-dashed border-foreground/15 bg-transparent text-foreground/30",
                ].join(" ")}
              >
                <span
                  className={
                    cell.isPrintable
                      ? "text-base"
                      : "text-[10px] text-foreground/70"
                  }
                >
                  {isRevealed || isActive ? cell.text : "·"}
                </span>
                <span className="text-[9px] text-foreground/40">
                  {isRevealed || isActive ? `0x${b.toString(16).padStart(2, "0")}` : ""}
                </span>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
