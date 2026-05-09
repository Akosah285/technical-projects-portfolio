import Link from "next/link";
import { listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";

export default function Home() {
  const courses = listAllCourses();

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

      {courses.map((course) => (
        <section key={course.slug} className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {course.subtitle}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              <Link
                href={`/courses/${course.slug}/`}
                className="hover:underline"
              >
                {course.title}
              </Link>
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {course.description}
            </p>
          </div>

          <ul className="space-y-6">
            {course.themes.map((theme) => {
              const projects = listProjectsForTheme(course.slug, theme.slug);
              if (projects.length === 0) return null;
              return (
                <li key={theme.slug} className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold">
                      <Link
                        href={`/courses/${course.slug}/${theme.slug}/`}
                        className="hover:underline"
                      >
                        {theme.title}
                      </Link>
                    </h3>
                    <span className="text-xs text-zinc-500">
                      {projects.length} {projects.length === 1 ? "project" : "projects"}
                    </span>
                  </div>
                  <ul className="space-y-2 pl-1">
                    {projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          href={`/courses/${project.course}/${project.theme}/${project.slug}/`}
                          className="group block rounded-lg border border-zinc-200 px-3 py-2 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                        >
                          <div className="text-sm font-medium group-hover:underline">
                            {project.title}
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {project.summary}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
