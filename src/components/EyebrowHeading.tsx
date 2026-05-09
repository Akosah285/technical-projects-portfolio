import type { ReactNode } from "react";

interface EyebrowHeadingProps {
  eyebrow: string;
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Section header with an uppercase tracked eyebrow above a large, tightly
 * tracked heading. Mirrors the flightrecap.com section pattern.
 */
export function EyebrowHeading({
  eyebrow,
  children,
  align = "left",
  className = "",
}: EyebrowHeadingProps) {
  return (
    <div
      className={[
        align === "center" ? "text-center" : "text-left",
        "space-y-3",
        className,
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {children}
      </h2>
    </div>
  );
}
