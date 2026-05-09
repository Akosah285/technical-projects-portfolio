import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  listAllProjectPaths,
} from "@/lib/registry/projectRegistry";
import { publicPath } from "@/lib/site/publicPath";
import { HanoiPlayer } from "./HanoiPlayer";
import { PongPlayer } from "./PongPlayer";
import { QuicksortPlayer } from "./QuicksortPlayer";
import { ScanPlayer } from "./ScanPlayer";
import { SortCitiesPlayer } from "./SortCitiesPlayer";
import { VisualizeCitiesPlayer } from "./VisualizeCitiesPlayer";
import { BfsCampusPlayer } from "./BfsCampusPlayer";
import { CryptoPlayer } from "./CryptoPlayer";
import { GameOfLifePlayer } from "./GameOfLifePlayer";
import { SoldiersPlayer } from "./SoldiersPlayer";
import { ChoosePlayer } from "./ChoosePlayer";
import { PortiaPlayer, RichPlayer } from "./InterestPlayer";
import { EggAndHamPlayer } from "./EggAndHamPlayer";
import { StringArtPlayer } from "./StringArtPlayer";
import { LogoTurtlePlayer } from "./LogoTurtlePlayer";
import { CounterAndTimerPlayer } from "./CounterAndTimerPlayer";
import { RegionFinderPlayer } from "./RegionFinderPlayer";
import { QuadtreePlayer } from "./QuadtreePlayer";
import { HuffmanPlayer } from "./HuffmanPlayer";
import { CheckpointTimeline } from "./CheckpointTimeline";
import { RelatedSources } from "./RelatedSources";

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
        <Link href={`/courses/${project.course}/`} className="hover:underline">
          {project.course}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${project.course}/${project.theme}/`} className="hover:underline">
          {project.theme}
        </Link>
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
            View original {project.sourceLanguage ?? "Python"} source
          </a>
        </p>
      </header>

      {project.slug === "towers-of-hanoi" && <HanoiPlayer />}
      {project.slug === "pong" && <PongPlayer />}
      {project.slug === "quicksort" && <QuicksortPlayer />}
      {project.slug === "scan" && <ScanPlayer />}
      {project.slug === "sort-cities" && <SortCitiesPlayer />}
      {project.slug === "visualize-cities" && <VisualizeCitiesPlayer />}
      {project.slug === "bfs-dartmouth-campus" && <BfsCampusPlayer />}
      {project.slug === "crypto" && <CryptoPlayer />}
      {project.slug === "game-of-life" && <GameOfLifePlayer />}
      {project.slug === "soldiers" && <SoldiersPlayer />}
      {project.slug === "egg-and-ham" && <EggAndHamPlayer />}
      {project.slug === "portia" && <PortiaPlayer />}
      {project.slug === "rich" && <RichPlayer />}
      {project.slug === "choose" && <ChoosePlayer />}
      {project.slug === "string-art" && <StringArtPlayer />}
      {project.slug === "logo-turtle" && <LogoTurtlePlayer />}
      {project.slug === "counter-and-timer" && <CounterAndTimerPlayer />}
      {project.slug === "region-finder" && <RegionFinderPlayer />}
      {project.slug === "point-quadtree" && <QuadtreePlayer />}
      {project.slug === "huffman" && <HuffmanPlayer />}
      {project.checkpoints && project.checkpoints.length > 0 && (
        <CheckpointTimeline checkpoints={project.checkpoints} />
      )}
      {project.relatedSources && project.relatedSources.length > 0 && (
        <RelatedSources sources={project.relatedSources} />
      )}
    </main>
  );
}
