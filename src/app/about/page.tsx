import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EyebrowHeading } from "@/components/EyebrowHeading";

export const metadata = {
  title: "About — Technical Projects Portfolio",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 text-white">
      <nav className="text-xs text-white/50">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/80">about</span>
      </nav>

      <ScrollReveal>
        <header className="mt-8">
          <EyebrowHeading eyebrow="About">
            Akwasi Akosah,
            <br />
            <span className="text-white/60">in his own words.</span>
          </EyebrowHeading>
        </header>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-12 space-y-5 text-lg leading-relaxed text-white/75">
          <p>
            This site is a re-rendering of selected undergraduate coursework
            from Dartmouth (2018&ndash;2021) as live, in-browser demonstrations
            you can actually play with — across six courses, twenty-eight
            themes, and forty-nine projects.
          </p>
          <p>
            The original submissions were Python, C, C++, Arduino, and VHDL
            running on lab hardware. Every project page links the original
            file. The playable version is a hand-rewritten TypeScript port,
            covered by 600+ vitest tests, so the demo you interact with does
            the same thing as the original submission — just in a runtime that
            happens to live in your browser.
          </p>
          <p>
            I built it this way because the most interesting thing about
            coursework isn&rsquo;t the code itself; it&rsquo;s seeing the
            algorithms, simulations, controllers and games run. A printout of{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">
              quicksort.py
            </code>{" "}
            doesn&rsquo;t convey nearly as much as stepping through the
            partitioning pointers one swap at a time.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="https://github.com/Akosah285"
                className="font-medium text-white hover:text-blue-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub — @Akosah285 ↗
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Akosah285/technical-projects-portfolio"
                className="font-medium text-white hover:text-blue-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code for this site ↗
              </a>
            </li>
          </ul>
        </section>
      </ScrollReveal>
    </main>
  );
}
