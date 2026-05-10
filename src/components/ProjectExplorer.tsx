"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export interface ProjectCard {
  slug: string;
  title: string;
  summary: string;
  course: string;
  theme: string;
}

export interface ThemeMeta {
  slug: string;
  title: string;
  count: number;
}

interface Props {
  courseSlug: string;
  themes: ThemeMeta[];
  projects: ProjectCard[];
  tone: "blue" | "emerald" | "pink" | "amber";
}

const TONE_RING: Record<string, string> = {
  blue: "ring-blue-400",
  emerald: "ring-emerald-400",
  pink: "ring-pink-400",
  amber: "ring-amber-400",
};

const TONE_BG: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-200 border-blue-400/30",
  emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  pink: "bg-pink-500/15 text-pink-200 border-pink-400/30",
  amber: "bg-amber-500/15 text-amber-200 border-amber-400/30",
};

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/[\s,;]+\S*$/, "") + "…";
}

export function ProjectExplorer({ courseSlug, themes, projects, tone }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTheme = searchParams.get("theme") ?? "all";

  const filtered = useMemo(() => {
    if (activeTheme === "all") return projects;
    return projects.filter((p) => p.theme === activeTheme);
  }, [activeTheme, projects]);

  const themeTitleByslug = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of themes) m[t.slug] = t.title;
    return m;
  }, [themes]);

  const setTheme = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("theme");
    } else {
      params.set("theme", slug);
    }
    const qs = params.toString();
    router.replace(`/courses/${courseSlug}/${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 px-2">
          Filter by theme
        </div>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          <li>
            <FilterChip
              label="All projects"
              count={projects.length}
              active={activeTheme === "all"}
              tone={tone}
              onClick={() => setTheme("all")}
            />
          </li>
          {themes.map((t) => (
            <li key={t.slug}>
              <FilterChip
                label={t.title}
                count={t.count}
                active={activeTheme === t.slug}
                tone={tone}
                onClick={() => setTheme(t.slug)}
              />
            </li>
          ))}
        </ul>
      </aside>

      <div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={`${p.theme}-${p.slug}`}>
              <Link
                href={`/courses/${p.course}/${p.theme}/${p.slug}/`}
                className="group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white group-hover:text-white">
                    {p.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${TONE_BG[tone]}`}
                    title={themeTitleByslug[p.theme] ?? p.theme}
                  >
                    {(themeTitleByslug[p.theme] ?? p.theme).split(" ")[0]}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/55 line-clamp-2">
                  {truncate(p.summary, 140)}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            No projects in this theme yet.
          </div>
        )}
      </div>

      {/* render-only sentinel so unused import linters stay quiet */}
      <span className={`hidden ${TONE_RING[tone]}`} aria-hidden />
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tone: "blue" | "emerald" | "pink" | "amber";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
        active
          ? `${TONE_BG[tone]} border`
          : "border border-transparent text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-[10px] tabular-nums text-white/40">
        {count}
      </span>
    </button>
  );
}
