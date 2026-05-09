"use client";

import { useState } from "react";
import type { ProjectCheckpoint } from "@/lib/registry/projectRegistry";
import { publicPath } from "@/lib/site/publicPath";

interface CheckpointTimelineProps {
  checkpoints: ProjectCheckpoint[];
}

export function CheckpointTimeline({ checkpoints }: CheckpointTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = checkpoints[activeIndex] ?? checkpoints[0];

  if (!active) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <h2 className="text-lg font-semibold">Checkpoint timeline</h2>
      <p className="text-sm text-foreground/70">
        How the project evolved across submissions. Pick a checkpoint to view
        the source for that snapshot.
      </p>
      <div role="tablist" className="flex flex-wrap gap-2">
        {checkpoints.map((cp, i) => {
          const selected = i === activeIndex;
          return (
            <button
              key={cp.path}
              role="tab"
              aria-selected={selected}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={
                "rounded-md border px-3 py-1 text-sm transition-colors " +
                (selected
                  ? "border-foreground/60 bg-foreground text-background"
                  : "border-foreground/15 hover:bg-foreground/5")
              }
            >
              {cp.label}
            </button>
          );
        })}
      </div>
      {active.description && (
        <p className="text-sm text-foreground/80">{active.description}</p>
      )}
      <p className="text-sm">
        <a
          href={publicPath(active.path)}
          className="font-medium underline underline-offset-4"
        >
          View {active.label} source ({active.path.split("/").pop()})
        </a>
      </p>
    </section>
  );
}
