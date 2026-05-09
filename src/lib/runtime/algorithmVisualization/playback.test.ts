import { describe, it, expect } from "vitest";
import { playbackInit, playbackReducer, type PlaybackState } from "./playback";

describe("playbackInit", () => {
  it("starts at index 0, paused, speed 1", () => {
    const state = playbackInit(7);

    expect(state).toEqual({
      index: 0,
      isPlaying: false,
      speed: 1,
      stepCount: 7,
    });
  });
});

describe("playbackReducer", () => {
  it("starts playing on { type: 'play' }", () => {
    const state = playbackReducer(playbackInit(7), { type: "play" });

    expect(state.isPlaying).toBe(true);
  });

  it("stops playing on { type: 'pause' }", () => {
    const playing = playbackReducer(playbackInit(7), { type: "play" });
    const paused = playbackReducer(playing, { type: "pause" });

    expect(paused.isPlaying).toBe(false);
  });

  it("step-forward increments index", () => {
    const next = playbackReducer(playbackInit(7), { type: "step-forward" });

    expect(next.index).toBe(1);
  });

  it("step-forward at last index is a no-op (stays at stepCount)", () => {
    const atEnd: PlaybackState = { ...playbackInit(3), index: 3 };
    const next = playbackReducer(atEnd, { type: "step-forward" });

    expect(next.index).toBe(3);
  });

  it("step-backward decrements index", () => {
    const atTwo: PlaybackState = { ...playbackInit(7), index: 2 };
    const next = playbackReducer(atTwo, { type: "step-backward" });

    expect(next.index).toBe(1);
  });

  it("step-backward at index 0 is a no-op", () => {
    const next = playbackReducer(playbackInit(7), { type: "step-backward" });

    expect(next.index).toBe(0);
  });

  it("seek jumps to the requested index", () => {
    const next = playbackReducer(playbackInit(7), { type: "seek", index: 4 });

    expect(next.index).toBe(4);
  });

  it("seek clamps below 0", () => {
    const next = playbackReducer(playbackInit(7), { type: "seek", index: -2 });

    expect(next.index).toBe(0);
  });

  it("seek clamps above stepCount", () => {
    const next = playbackReducer(playbackInit(3), { type: "seek", index: 99 });

    expect(next.index).toBe(3);
  });

  it("set-speed updates the speed", () => {
    const next = playbackReducer(playbackInit(7), {
      type: "set-speed",
      speed: 2,
    });

    expect(next.speed).toBe(2);
  });

  it("reset returns to a fresh init state for the same stepCount", () => {
    const dirty: PlaybackState = {
      index: 5,
      isPlaying: true,
      speed: 4,
      stepCount: 7,
    };
    const next = playbackReducer(dirty, { type: "reset" });

    expect(next).toEqual(playbackInit(7));
  });
});
