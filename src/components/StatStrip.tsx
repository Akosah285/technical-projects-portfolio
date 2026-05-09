interface StatProps {
  value: string;
  label: string;
}

interface StatStripProps {
  stats: StatProps[];
  className?: string;
}

/**
 * Horizontal grid of big numbers + small labels. The flightrecap hero uses
 * a similar strip ("47 cities · 132 flights · 8 airlines · …").
 */
export function StatStrip({ stats, className = "" }: StatStripProps) {
  return (
    <dl
      className={[
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
        className,
      ].join(" ")}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center backdrop-blur sm:text-left"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {s.label}
          </dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
