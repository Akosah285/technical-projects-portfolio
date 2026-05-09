import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourse, listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";

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

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-6">
      <nav className="text-sm text-foreground/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{c.slug}</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{c.subtitle}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{c.title}</h1>
        <p className="text-foreground/80">{c.description}</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Themes
        </h2>
        <ul className="space-y-3">
          {c.themes.map((theme) => {
            const projects = listProjectsForTheme(c.slug, theme.slug);
            return (
              <li
                key={theme.slug}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <Link href={`/courses/${c.slug}/${theme.slug}/`} className="block space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-lg font-medium">{theme.title}</div>
                    <div className="text-xs text-zinc-500">
                      {projects.length} {projects.length === 1 ? "project" : "projects"}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70">{theme.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
