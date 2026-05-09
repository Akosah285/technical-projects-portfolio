import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme, listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";

export function generateStaticParams() {
  const params: Array<{ course: string; theme: string }> = [];
  for (const course of listAllCourses()) {
    for (const theme of course.themes) {
      params.push({ course: course.slug, theme: theme.slug });
    }
  }
  return params;
}

interface PageParams {
  params: Promise<{ course: string; theme: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { course, theme } = await params;
  const r = getTheme(course, theme);
  if (!r) return {};
  return { title: `${r.theme.title} — ${r.course.title}` };
}

export default async function ThemePage({ params }: PageParams) {
  const { course, theme } = await params;
  const r = getTheme(course, theme);
  if (!r) notFound();
  const projects = listProjectsForTheme(course, theme);

  return (
    <main className="mx-auto max-w-3xl space-y-10 p-6">
      <nav className="text-sm text-foreground/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${r.course.slug}/`} className="hover:underline">
          {r.course.slug}
        </Link>
        <span className="mx-2">/</span>
        <span>{r.theme.slug}</span>
      </nav>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{r.course.subtitle}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{r.theme.title}</h1>
        <p className="text-foreground/80">{r.theme.description}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Projects in this theme
        </h2>
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <Link
                href={`/courses/${project.course}/${project.theme}/${project.slug}/`}
                className="block space-y-1"
              >
                <div className="text-lg font-medium">{project.title}</div>
                <p className="text-sm text-foreground/70">{project.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
