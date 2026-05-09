import type { ReactNode } from "react";

interface FeatureRowProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
  className?: string;
}

/**
 * Alternating "story" row used on the home page: copy on one side, a visual
 * (image, dial, plot) on the other. Matches flightrecap.com's main feature
 * rhythm ("From Boring Emails to Beautiful Insights" + screenshot).
 */
export function FeatureRow({
  eyebrow,
  title,
  description,
  visual,
  reverse = false,
  className = "",
}: FeatureRowProps) {
  return (
    <div
      className={[
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        className,
      ].join(" ")}
    >
      <div className={reverse ? "lg:order-2" : ""}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h3>
        <div className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
          {description}
        </div>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}
