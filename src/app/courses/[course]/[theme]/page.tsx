import { notFound } from "next/navigation";
import Link from "next/link";
import { getTheme, listAllCourses } from "@/lib/registry/courseRegistry";
import { listProjectsForTheme } from "@/lib/registry/projectRegistry";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EyebrowHeading } from "@/components/EyebrowHeading";

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
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 text-white">
      <nav className="text-xs text-white/50">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${r.course.slug}/`} className="hover:text-white">
          {r.course.slug}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">{r.theme.slug}</span>
      </nav>

      <ScrollReveal>
        <header className="mt-8">
          <EyebrowHeading eyebrow={r.course.subtitle}>{r.theme.title}</EyebrowHeading>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            {r.theme.description}
          </p>
        </header>
      </ScrollReveal>

      <section className="mt-16 space-y-4">
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <ScrollReveal key={project.slug} delay={i * 50}>
              <li className="h-full">
                <Link
                  href={`/courses/${project.course}/${project.theme}/${project.slug}/`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/[0.07]"
                >
                  <div className="text-lg font-semibold text-white group-hover:text-blue-200">
                    {project.title}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    {project.summary}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-blue-300/90 group-hover:text-blue-200">
                    Run the demo <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </section>
    </main>
  );
}
