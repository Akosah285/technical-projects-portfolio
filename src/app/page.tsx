import Link from "next/link";
import {
  getProject,
  listAllProjectPaths,
} from "@/lib/registry/projectRegistry";

export default function Home() {
  const projects = listAllProjectPaths().map((p) => ({
    ...p,
    project: getProject(p.course, p.theme, p.slug)!,
  }));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-20">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          Technical Project Portfolio
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Akwasi Akosah
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          A growing collection of engineering and computer-science projects,
          presented as live, in-browser demonstrations alongside the original
          source code.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Featured projects
        </h2>
        <ul className="space-y-3">
          {projects.map(({ course, theme, slug, project }) => (
            <li
              key={`${course}/${theme}/${slug}`}
              className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <Link
                href={`/courses/${course}/${theme}/${slug}/`}
                className="block space-y-1"
              >
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  {course} · {theme}
                </div>
                <div className="text-lg font-medium">{project.title}</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {project.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
