export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl space-y-6 text-center">
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
        <p className="text-sm text-zinc-500">
          The first course is being added now. Check back soon.
        </p>
      </div>
    </main>
  );
}
