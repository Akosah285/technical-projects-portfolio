"use client";

import { useState, type ReactNode } from "react";

export interface FaqItem {
  q: string;
  a: ReactNode;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

/**
 * Collapsible Q&A list. Single-open behaviour — opening one closes others.
 */
export function FaqAccordion({ items, className = "" }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul
      className={[
        "divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]",
        className,
      ].join(" ")}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04]"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-white sm:text-lg">
                {item.q}
              </span>
              <span
                aria-hidden
                className={[
                  "shrink-0 text-xl text-white/50 transition-transform",
                  isOpen ? "rotate-45" : "rotate-0",
                ].join(" ")}
              >
                +
              </span>
            </button>
            <div
              className={[
                "grid overflow-hidden px-5 transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="min-h-0 text-sm leading-relaxed text-white/70">
                {item.a}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
