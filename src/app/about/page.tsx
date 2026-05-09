import Link from "next/link";

export const metadata = {
  title: "About — Technical Projects Portfolio",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <nav className="text-sm text-foreground/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>about</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      </header>

      <section className="space-y-4 text-foreground/80 leading-relaxed">
        <p>
          I&apos;m Akwasi Akosah. This site is a re-rendering of selected
          coursework — starting with my first computer-science course at
          Dartmouth (COSC 1, Fall 2018) — as live, in-browser demonstrations
          you can actually play with.
        </p>
        <p>
          Each project here was originally a Python submission running under{" "}
          <code>cs1lib</code> on a desktop. The original files are still
          available to download from every project page. The browser
          re-implementations are TypeScript ports built test-first against the
          same algorithm or behaviour, so the demo you see and the original
          submission do the same thing — just in different runtimes.
        </p>
        <p>
          I built the site this way because the most interesting thing about
          early coursework isn&apos;t the code itself; it&apos;s seeing the
          algorithms, simulations, and games run. A printout of{" "}
          <code>quicksort.py</code> doesn&apos;t convey nearly as much as
          stepping through the partitioning pointers one swap at a time.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Get in touch
        </h2>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="https://github.com/Akosah285"
              className="underline underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub — @Akosah285
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Akosah285/technical-projects-portfolio"
              className="underline underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code for this site
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
