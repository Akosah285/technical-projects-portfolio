import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse, listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EyebrowHeading } from "@/components/EyebrowHeading";
import { AchievementBadge } from "@/components/AchievementBadge";

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

  const totalProjects = c.themes.reduce(
    (n, t) => n + listProjectsForTheme(c.slug, t.slug).length,
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 text-white">
      <nav className="text-xs text-white/50">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{c.slug}</span>
      </nav>

      <ScrollReveal>
        <header className="mt-8">
          <EyebrowHeading eyebrow={c.subtitle}>{c.title}</EyebrowHeading>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            {c.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <AchievementBadge label="Themes" value={`${c.themes.length}`} />
            <AchievementBadge tone="emerald" label="Projects" value={`${totalProjects}`} />
          </div>
        </header>
      </ScrollReveal>

      <section className="mt-16 space-y-6">
        <ul className="grid gap-4 sm:grid-cols-2">
          {c.themes.map((theme, i) => {
            const projects = listProjectsForTheme(c.slug, theme.slug);
            return (
              <ScrollReveal key={theme.slug} delay={i * 60}>
                <li className="h-full">
                  <Link
                    href={`/courses/${c.slug}/${theme.slug}/`}
                    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-lg font-semibold text-white group-hover:text-blue-200">
                        {theme.title}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60">
                        {projects.length}{" "}
                        {projects.length === 1 ? "project" : "projects"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                      {theme.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-blue-300/90 group-hover:text-blue-200">
                      Open theme <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              </ScrollReveal>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
