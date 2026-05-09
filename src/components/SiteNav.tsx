import Link from "next/link";

interface SiteNavProps {
  current?: "home" | "courses" | "about";
}

/**
 * Slim top nav bar — brand on the left, nav items on the right.
 */
export function SiteNav({ current = "home" }: SiteNavProps) {
  const items: Array<{ href: string; label: string; key: SiteNavProps["current"] }> = [
    { href: "/", label: "Home", key: "home" },
    { href: "/#courses", label: "Courses", key: "courses" },
    { href: "/about/", label: "About", key: "about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
            AA
          </span>
          <span className="text-sm font-semibold text-white/90 group-hover:text-white">
            Akwasi Akosah
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {items.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className={[
                "rounded-full px-3 py-1.5 transition",
                current === it.key
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              {it.label}
            </Link>
          ))}
          <a
            href="https://github.com/Akosah285/technical-projects-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.4c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.97 0-.88.31-1.6.83-2.16-.08-.2-.36-1.02.08-2.13 0 0 .68-.22 2.22.83a7.71 7.71 0 014.04 0c1.54-1.05 2.22-.83 2.22-.83.44 1.11.16 1.93.08 2.13.52.56.83 1.28.83 2.16 0 3.09-1.87 3.77-3.66 3.97.29.25.54.74.54 1.49v2.21c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
