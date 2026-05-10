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
import { KevinBaconPlayer } from "./KevinBaconPlayer";
import { PosTaggerPlayer } from "./PosTaggerPlayer";
import { SketchEditorPlayer } from "./SketchEditorPlayer";
import { PollockPlayer } from "./PollockPlayer";
import { LinkedListPlayer } from "./LinkedListPlayer";
import { GradientDescentPlayer } from "./GradientDescentPlayer";
import { LinearRegressionPlayer } from "./LinearRegressionPlayer";
import { LogisticRegressionPlayer } from "./LogisticRegressionPlayer";
import { NaiveBayesPlayer } from "./NaiveBayesPlayer";
import { BlinkyPlayer } from "./BlinkyPlayer";
import { ReactionGamePlayer } from "./ReactionGamePlayer";
import { VoltmeterFanPlayer } from "./VoltmeterFanPlayer";
import { TiltSevenSegPlayer } from "./TiltSevenSegPlayer";
import { MotorRpmPlayer } from "./MotorRpmPlayer";
import { TrafficControlPlayer } from "./TrafficControlPlayer";
import { SpiFsmPlayer } from "./SpiFsmPlayer";
import { SpiDatapathPlayer } from "./SpiDatapathPlayer";
import { SamplingCounterPlayer } from "./SamplingCounterPlayer";
import { StopwatchPlayer } from "./StopwatchPlayer";
import { MotorStepResponsePlayer } from "./MotorStepResponsePlayer";
import { SpeedControlPlayer } from "./SpeedControlPlayer";
import { PositionControlPlayer } from "./PositionControlPlayer";
import { ImuTurningPlayer } from "./ImuTurningPlayer";
import { MicromouseMazePlayer } from "./MicromouseMazePlayer";
import { UartLedReplPlayer } from "./UartLedReplPlayer";
import { ButtonInterruptsPlayer } from "./ButtonInterruptsPlayer";
import { PwmServoPlayer } from "./PwmServoPlayer";
import { AdcSensorsPlayer } from "./AdcSensorsPlayer";
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
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-12 text-white">
      <nav className="text-xs text-white/50">
        <Link href="/" className="hover:text-white">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${project.course}/`} className="hover:text-white">
          {project.course}
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${project.course}/${project.theme}/`} className="hover:text-white">
          {project.theme}
        </Link>
      </nav>

      <header className="mt-8 space-y-4 border-b border-white/10 pb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {project.title}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={publicPath(project.originalSourcePath)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            View original {project.sourceLanguage ?? "Python"} source
            <span aria-hidden>↗</span>
          </a>
        </div>
      </header>

      <div className="mt-10 space-y-8">
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
      {project.slug === "kevin-bacon" && <KevinBaconPlayer />}
      {project.slug === "pos-tagger" && <PosTaggerPlayer />}
      {project.slug === "sketch-editor" && <SketchEditorPlayer />}
      {project.slug === "pollock" && <PollockPlayer />}
      {project.slug === "linked-list" && <LinkedListPlayer />}
      {project.slug === "gradient-descent" && <GradientDescentPlayer />}
      {project.slug === "linear-regression" && <LinearRegressionPlayer />}
      {project.slug === "logistic-regression" && <LogisticRegressionPlayer />}
      {project.slug === "naive-bayes" && <NaiveBayesPlayer />}
      {project.slug === "blinky" && <BlinkyPlayer />}
      {project.slug === "reaction-game" && <ReactionGamePlayer />}
      {project.slug === "voltmeter-fan" && <VoltmeterFanPlayer />}
      {project.slug === "tilt-7seg" && <TiltSevenSegPlayer />}
      {project.slug === "motor-rpm" && <MotorRpmPlayer />}
      {project.slug === "traffic-control" && <TrafficControlPlayer />}
      {project.slug === "spi-fsm" && <SpiFsmPlayer />}
      {project.slug === "spi-datapath" && <SpiDatapathPlayer />}
      {project.slug === "sampling-counter" && <SamplingCounterPlayer />}
      {project.slug === "stopwatch" && <StopwatchPlayer />}
      {project.slug === "motor-step-response" && <MotorStepResponsePlayer />}
      {project.slug === "speed-control" && <SpeedControlPlayer />}
      {project.slug === "position-control" && <PositionControlPlayer />}
      {project.slug === "imu-turning" && <ImuTurningPlayer />}
      {project.slug === "micromouse-maze" && <MicromouseMazePlayer />}
      {project.slug === "uart-led-repl" && <UartLedReplPlayer />}
      {project.slug === "button-interrupts" && <ButtonInterruptsPlayer />}
      {project.slug === "pwm-servo" && <PwmServoPlayer />}
      {project.slug === "adc-sensors" && <AdcSensorsPlayer />}
      {project.checkpoints && project.checkpoints.length > 0 && (
        <CheckpointTimeline checkpoints={project.checkpoints} />
      )}
      {project.relatedSources && project.relatedSources.length > 0 && (
        <RelatedSources sources={project.relatedSources} />
      )}
      </div>
    </main>
  );
}
