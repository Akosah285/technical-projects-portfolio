export interface Project {
  course: string;
  theme: string;
  slug: string;
  title: string;
  summary: string;
  originalSourcePath: string;
}

const PROJECTS: Project[] = [
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "towers-of-hanoi",
    title: "Towers of Hanoi",
    summary:
      "A recursive solver that prints the optimal move sequence for the Towers of Hanoi puzzle, ported from a Fall 2018 introductory programming submission.",
    originalSourcePath:
      "/sources/intro-to-programming/towers-of-hanoi/solve_hanoi.py",
  },
];

export function getProject(
  course: string,
  theme: string,
  slug: string,
): Project | null {
  return (
    PROJECTS.find(
      (p) => p.course === course && p.theme === theme && p.slug === slug,
    ) ?? null
  );
}

export function listProjectsForTheme(
  course: string,
  theme: string,
): Project[] {
  return PROJECTS.filter((p) => p.course === course && p.theme === theme);
}

export function listAllProjectPaths(): Array<
  Pick<Project, "course" | "theme" | "slug">
> {
  return PROJECTS.map(({ course, theme, slug }) => ({ course, theme, slug }));
}
