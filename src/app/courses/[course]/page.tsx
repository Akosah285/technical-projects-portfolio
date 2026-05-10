import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getCourse, listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProjectExplorer } from "@/components/ProjectExplorer";
import { getCourseTone, getCourseGlyph } from "@/lib/courseStyle";

export function generateStaticParams() {
  return listAllCourses().map((c) => ({ course: c.slug }));
}

interface PageParams {
  params: Promise<{ course: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { course } = await params;
  const c = getCourse(course);
  if (!c) return {};
  return { title: `${c.title} — Technical Projects Portfolio` };
}

export default async function CoursePage({ params }: PageParams) {
  const { course } = await params;
  const c = getCourse(course);
  if (!c) notFound();

  const themesWithCounts = c.themes.map((t) => {
    const projects = listProjectsForTheme(c.slug, t.slug);
    return { slug: t.slug, title: t.title, count: projects.length };
  });

  const allProjects = c.themes.flatMap((t) =>
    listProjectsForTheme(c.slug, t.slug).map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      course: p.course,
      theme: p.theme,
    })),
  );

  const tone = getCourseTone(c.slug);
  const glyph = getCourseGlyph(c.slug);

  const heroGradient =
    tone === "blue"
      ? "from-blue-500/30 to-indigo-500/20"
      : tone === "emerald"
        ? "from-emerald-500/30 to-teal-500/20"
        : tone === "pink"
          ? "from-pink-500/30 to-rose-500/20"
          : "from-amber-500/30 to-orange-500/20";

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 text-white">
      <nav className="text-xs text-white/40">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{c.title}</span>
      </nav>

      <ScrollReveal>
        <header className="mt-6 flex items-center gap-4">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br text-xl font-semibold text-white ${heroGradient}`}
          >
            {glyph}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              {c.subtitle}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {c.title}
            </h1>
            <p className="mt-0.5 text-xs text-white/50">
              {c.themes.length} themes · {allProjects.length} interactive projects
            </p>
          </div>
        </header>
      </ScrollReveal>

      <section className="mt-10">
        <Suspense
          fallback={
            <div className="text-xs text-white/40">Loading projects…</div>
          }
        >
          <ProjectExplorer
            courseSlug={c.slug}
            themes={themesWithCounts}
            projects={allProjects}
            tone={tone}
          />
        </Suspense>
      </section>

      <details className="mt-12 group">
        <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white/60">
          About this course
        </summary>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
          {c.description}
        </p>
      </details>
    </main>
  );
}
