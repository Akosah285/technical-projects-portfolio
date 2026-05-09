import type { ReactNode } from "react";

interface AchievementBadgeProps {
  icon?: ReactNode;
  label: string;
  value: string;
  tone?: "blue" | "emerald" | "pink" | "amber";
  className?: string;
}

const TONE_STYLES: Record<NonNullable<AchievementBadgeProps["tone"]>, string> = {
  blue: "border-blue-400/40 bg-blue-500/15 text-blue-100",
  emerald: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  pink: "border-pink-400/40 bg-pink-500/15 text-pink-100",
  amber: "border-amber-400/40 bg-amber-500/15 text-amber-100",
};

/**
 * Pill-style achievement badge. Shows a label + bold value, optionally with
 * an icon glyph. Mirrors the "Globe Trotter — 47 cities" overlay pills on
 * flightrecap.com.
 */
export function AchievementBadge({
  icon,
  label,
  value,
  tone = "blue",
  className = "",
}: AchievementBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur",
        TONE_STYLES[tone],
        className,
      ].join(" ")}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span className="text-white/70">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </span>
  );
}
