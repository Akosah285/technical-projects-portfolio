import type { ProjectCheckpoint } from "@/lib/registry/projectRegistry";
import { publicPath } from "@/lib/site/publicPath";

interface RelatedSourcesProps {
  sources: ProjectCheckpoint[];
}

export function RelatedSources({ sources }: RelatedSourcesProps) {
  return (
    <section className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
      <h2 className="text-lg font-semibold">Source files</h2>
      <p className="text-sm text-foreground/70">
        All Python source files that were submitted together to make this
        project work.
      </p>
      <ul className="space-y-2">
        {sources.map((s) => (
          <li key={s.path} className="text-sm">
            <a
              href={publicPath(s.path)}
              className="font-mono font-medium underline underline-offset-4"
            >
              {s.label}
            </a>
            {s.description && (
              <span className="ml-2 text-foreground/70">— {s.description}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
