export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Not found</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          That page doesn&apos;t exist (yet).
        </p>
      </div>
    </main>
  );
}
