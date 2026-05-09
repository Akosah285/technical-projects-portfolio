export interface ProjectCheckpoint {
  label: string;
  path: string;
  description?: string;
}

export interface Project {
  course: string;
  theme: string;
  slug: string;
  title: string;
  summary: string;
  originalSourcePath: string;
  checkpoints?: ProjectCheckpoint[];
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
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "quicksort",
    title: "Quicksort",
    summary:
      "An animated walk-through of Lomuto-style quicksort: pivot selection at the right end, the i/j partition pointers, the swaps that build the low-side region, and the final pivot placement that drives the recursive descent.",
    originalSourcePath:
      "/sources/intro-to-programming/quicksort/quicksort.py",
  },
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "scan",
    title: "Scan",
    summary:
      "A step-by-step visualization of inclusive and exclusive prefix-scan operations with both plus and times. Toggle the operation, switch modes, and watch each cell update from the previous one.",
    originalSourcePath: "/sources/intro-to-programming/scan/scan.py",
  },
  {
    course: "intro-to-programming",
    theme: "interactive-worlds",
    slug: "pong",
    title: "Pong",
    summary:
      "A reimplementation of an Atari-style two-player Pong game, originally built in Fall 2018 with the cs1lib graphics library. Two checkpoints show the project growing from paddles-only motion into a full game with ball physics, collisions, and scoring.",
    originalSourcePath:
      "/sources/intro-to-programming/pong/pong_game_Akosa.py",
    checkpoints: [
      {
        label: "Paddles only",
        path: "/sources/intro-to-programming/pong/atari_pong_akosah.py",
        description:
          "First checkpoint: two paddles that respond to keyboard input, no ball yet.",
      },
      {
        label: "Full game",
        path: "/sources/intro-to-programming/pong/pong_game_Akosa.py",
        description:
          "Final submission: ball physics, paddle collisions, wall bouncing, scoring, and serve direction.",
      },
    ],
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
