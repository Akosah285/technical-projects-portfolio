import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  listAllProjectPaths,
} from "@/lib/registry/projectRegistry";
import { publicPath } from "@/lib/site/publicPath";
import { HanoiPlayer } from "./HanoiPlayer";

export function generateStaticParams() {
  return listAllProjectPaths();
}

interface PageParams {
  params: Promise<{ course: string; theme: string; slug: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { course, theme, slug } = await params;
  const project = getProject(course, theme, slug);
  if (!project) return {};
  return { title: `${project.title} — Technical Projects Portfolio` };
}

export default async function ProjectPage({ params }: PageParams) {
  const { course, theme, slug } = await params;
  const project = getProject(course, theme, slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <nav className="text-sm text-foreground/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{project.course}</span>
        <span className="mx-2">/</span>
        <span>{project.theme}</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {project.title}
        </h1>
        <p className="text-foreground/80">{project.summary}</p>
        <p className="text-sm">
          <a
            href={publicPath(project.originalSourcePath)}
            className="font-medium underline underline-offset-4"
          >
            View original Python source
          </a>
        </p>
      </header>

      {project.slug === "towers-of-hanoi" && <HanoiPlayer />}
    </main>
  );
}
