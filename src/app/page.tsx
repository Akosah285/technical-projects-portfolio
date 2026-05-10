import Link from "next/link";
import { listAllCourses } from "@/lib/registry/courseRegistry";
import {
  listAllProjectPaths,
  listProjectsForTheme,
} from "@/lib/registry/projectRegistry";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EyebrowHeading } from "@/components/EyebrowHeading";
import { AchievementBadge } from "@/components/AchievementBadge";
import { StatStrip } from "@/components/StatStrip";
import { FeatureRow } from "@/components/FeatureRow";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  COURSE_GLYPH,
  COURSE_TONE,
  teaser,
} from "@/lib/courseStyle";

export default function Home() {
  const courses = listAllCourses();
  const totalThemes = courses.reduce((n, c) => n + c.themes.length, 0);
  const totalProjects = listAllProjectPaths().length;

  return (
    <main className="text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <ScrollReveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-blue-300/80 backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                Now: {courses.length} courses · {totalProjects} projects
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Four years of coursework.
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
                  Brought to life.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                Every project from my undergraduate engineering and computer-science
                courses, re-implemented in the browser. Drag the sliders, run the
                simulators, watch the algorithms — then read the original lab code
                that inspired each one.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#courses"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
                >
                  Browse the courses
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="https://github.com/Akosah285/technical-projects-portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  View source on GitHub
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <HeroVisual />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* STAT STRIP */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <ScrollReveal>
          <StatStrip
            stats={[
              { value: `${courses.length}`, label: "Courses" },
              { value: `${totalThemes}`, label: "Themes" },
              { value: `${totalProjects}`, label: "Interactive projects" },
              { value: "600+", label: "Tests passing" },
            ]}
          />
        </ScrollReveal>
      </section>

      {/* COURSE SHOWCASE */}
      <section id="courses" className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <EyebrowHeading eyebrow="The Catalogue">
            Six courses,
            <br />
            <span className="text-white/60">told as interactive stories.</span>
          </EyebrowHeading>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Each course is grouped into themes; each theme holds one or more
            playable projects with the original source attached.
          </p>
        </ScrollReveal>

        <div className="mt-16 space-y-24">
          {courses.map((course, i) => {
            const projectsInCourse = course.themes.reduce(
              (n, t) => n + listProjectsForTheme(course.slug, t.slug).length,
              0,
            );
            return (
              <ScrollReveal key={course.slug} delay={i * 50}>
                <FeatureRow
                  reverse={i % 2 === 1}
                  eyebrow={course.subtitle}
                  title={
                    <Link
                      href={`/courses/${course.slug}/`}
                      className="hover:text-blue-300"
                    >
                      {course.title}
                    </Link>
                  }
                  description={
                    <>
                      <p className="text-white/70">
                        {teaser(course.description, 180)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <AchievementBadge
                          tone={COURSE_TONE[course.slug] ?? "blue"}
                          label="Themes"
                          value={`${course.themes.length}`}
                        />
                        <AchievementBadge
                          tone={COURSE_TONE[course.slug] ?? "blue"}
                          label="Projects"
                          value={`${projectsInCourse}`}
                        />
                      </div>
                      <Link
                        href={`/courses/${course.slug}/`}
                        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-300 hover:text-blue-200"
                      >
                        Open the course
                        <span aria-hidden>→</span>
                      </Link>
                    </>
                  }
                  visual={
                    <CourseVisual
                      glyph={COURSE_GLYPH[course.slug] ?? "•"}
                      tone={COURSE_TONE[course.slug] ?? "blue"}
                      themes={course.themes.map((t) => ({
                        title: t.title,
                        slug: t.slug,
                        course: course.slug,
                        count: listProjectsForTheme(course.slug, t.slug).length,
                      }))}
                    />
                  }
                />
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* WHAT YOU'LL FIND */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <EyebrowHeading eyebrow="What you'll find" align="center">
            Every project, three ways.
          </EyebrowHeading>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
            A consistent format so you can dive straight into the part that
            interests you.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {WHAT_YOULL_FIND.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-6 backdrop-blur">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">
                  {card.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {card.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <ScrollReveal>
          <EyebrowHeading eyebrow="FAQ" align="center">
            Curiosity, answered.
          </EyebrowHeading>
        </ScrollReveal>
        <ScrollReveal>
          <div className="mt-12">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </ScrollReveal>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-violet-500/15 to-pink-500/15 px-8 py-16 text-center backdrop-blur">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pick a project, hit Play.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/70 sm:text-lg">
              Forty-nine interactive demos waiting to be poked, prodded, and
              read in detail.
            </p>
            <Link
              href="#courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:shadow-xl"
            >
              Start exploring
              <span aria-hidden>→</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}

/* ----------------------------- visuals -------------------------------- */

function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-md mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent blur-3xl" />
      <svg viewBox="0 0 320 320" className="relative h-full w-full">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        {/* Soft core */}
        <circle cx="160" cy="160" r="80" fill="url(#core)" />
        {/* Orbits */}
        <g className="origin-center animate-orbit">
          <circle cx="160" cy="160" r="70" stroke="rgba(255,255,255,0.12)" fill="none" strokeWidth="1" />
          <circle cx="160" cy="160" r="100" stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="1" />
          <circle cx="160" cy="160" r="130" stroke="rgba(255,255,255,0.05)" fill="none" strokeWidth="1" />
          <circle cx="230" cy="160" r="6" fill="#60a5fa" />
          <circle cx="160" cy="60" r="5" fill="#c084fc" />
          <circle cx="80" cy="200" r="4" fill="#f472b6" />
          <circle cx="220" cy="220" r="4" fill="#34d399" />
        </g>
        {/* Static labels */}
        <g fontFamily="var(--font-geist-mono)" fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle">
          <text x="160" y="20">algorithms</text>
          <text x="20" y="170">circuits</text>
          <text x="300" y="170">control</text>
          <text x="160" y="310">data</text>
        </g>
      </svg>

      <div className="absolute -left-2 top-6 sm:-left-6">
        <AchievementBadge tone="emerald" label="Tests" value="600+" />
      </div>
      <div className="absolute -right-2 top-1/2 sm:-right-6">
        <AchievementBadge tone="pink" label="Projects" value="49" />
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <AchievementBadge tone="amber" label="Courses" value="6" />
      </div>
    </div>
  );
}

function CourseVisual({
  glyph,
  tone,
  themes,
}: {
  glyph: string;
  tone: "blue" | "emerald" | "pink" | "amber";
  themes: Array<{ title: string; slug: string; course: string; count: number }>;
}) {
  const ringColor = {
    blue: "from-blue-500/30 to-indigo-500/20",
    emerald: "from-emerald-500/30 to-teal-500/20",
    pink: "from-pink-500/30 to-rose-500/20",
    amber: "from-amber-500/30 to-orange-500/20",
  }[tone];

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${ringColor} text-2xl font-semibold text-white`}
        >
          {glyph}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/50">
          Themes
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {themes.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/courses/${t.course}/${t.slug}/`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <span className="text-white/85 group-hover:text-white">
                {t.title}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                {t.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const WHAT_YOULL_FIND = [
  {
    icon: "▶",
    title: "Live, in-browser demo",
    desc: "Drag a slider, click a button, hit play. Each project is fully interactive — no install required, mobile and desktop alike.",
  },
  {
    icon: "{ }",
    title: "Original source",
    desc: "Every page links the original lab submission — Python, C, C++, Arduino, VHDL — exactly as written for the course.",
  },
  {
    icon: "✓",
    title: "TDD-tested rewrite",
    desc: "The TypeScript implementations are covered by 600+ vitest tests. The maths is verified to match the lab firmware where applicable.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Are these the original projects?",
    a: (
      <>
        The <em>logic</em> and <em>maths</em> are faithful re-implementations.
        The original lab code (Python, C, Arduino, VHDL) is linked on every
        project page, but the playable version is hand-rewritten in TypeScript
        so it can run in the browser, has tests, and uses modern UI patterns.
      </>
    ),
  },
  {
    q: "Why TypeScript and not the original languages?",
    a: (
      <>
        Browser-native, easy to share, and lets the project pages double as a
        living portfolio of front-end work. For VHDL labs the digital-logic is
        modelled in TS; for Arduino labs the plant + control loop is simulated
        with the same gains and sample periods used in the firmware.
      </>
    ),
  },
  {
    q: "Can I see the test suite?",
    a: (
      <>
        Yes — every interactive module has a sibling{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs">
          *.test.ts
        </code>{" "}
        in the same folder, all green via{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs">vitest</code>.
        The whole repo is open source on GitHub.
      </>
    ),
  },
  {
    q: "How do I navigate?",
    a: (
      <>
        Pick a course → pick a theme → pick a project. Each project page has
        the demo, the original source link, and where applicable a list of
        related lab files.
      </>
    ),
  },
];
