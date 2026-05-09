import { describe, it, expect } from "vitest";
import {
  getProject,
  listProjectsForTheme,
  listAllProjectPaths,
} from "./projectRegistry";

describe("getProject", () => {
  it("returns the Towers of Hanoi entry by course/theme/slug", () => {
    const project = getProject(
      "intro-to-programming",
      "recursion-and-algorithms",
      "towers-of-hanoi",
    );

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Towers of Hanoi");
  });

  it("the Towers of Hanoi entry exposes a summary and a link to the original Python source", () => {
    const project = getProject(
      "intro-to-programming",
      "recursion-and-algorithms",
      "towers-of-hanoi",
    );

    expect(project?.summary).toBeTruthy();
    expect(project?.originalSourcePath).toMatch(/\.py$/);
  });

  it("returns the Pong entry under interactive-worlds with multiple checkpoint sources", () => {
    const project = getProject(
      "intro-to-programming",
      "interactive-worlds",
      "pong",
    );

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Pong");
    expect(project?.checkpoints).toBeDefined();
    expect((project?.checkpoints?.length ?? 0)).toBeGreaterThanOrEqual(2);
  });

  it("returns the Quicksort entry under recursion-and-algorithms", () => {
    const project = getProject(
      "intro-to-programming",
      "recursion-and-algorithms",
      "quicksort",
    );

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Quicksort");
    expect(project?.originalSourcePath).toMatch(/quicksort\.py$/);
  });

  it("returns the Sort Cities entry under cities-and-maps with multiple related sources", () => {
    const project = getProject(
      "intro-to-programming",
      "cities-and-maps",
      "sort-cities",
    );

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Sort Cities");
    expect(project?.relatedSources).toBeDefined();
    expect((project?.relatedSources?.length ?? 0)).toBeGreaterThanOrEqual(3);
  });

  it("returns the Visualize Cities entry under cities-and-maps", () => {
    const project = getProject(
      "intro-to-programming",
      "cities-and-maps",
      "visualize-cities",
    );

    expect(project).not.toBeNull();
    expect(project?.title).toBe("Visualize Cities");
    expect(project?.originalSourcePath).toMatch(/visualize_cities\.py$/);
  });

  it("returns null for an unknown slug", () => {
    const project = getProject(
      "intro-to-programming",
      "recursion-and-algorithms",
      "no-such-thing",
    );

    expect(project).toBeNull();
  });

  it("returns null when course or theme do not match", () => {
    expect(
      getProject("nonexistent-course", "recursion-and-algorithms", "towers-of-hanoi"),
    ).toBeNull();
    expect(
      getProject("intro-to-programming", "wrong-theme", "towers-of-hanoi"),
    ).toBeNull();
  });
});

describe("listProjectsForTheme", () => {
  it("returns the projects under a given course + theme", () => {
    const projects = listProjectsForTheme(
      "intro-to-programming",
      "recursion-and-algorithms",
    );

    expect(projects.map((p) => p.slug)).toContain("towers-of-hanoi");
  });

  it("returns an empty array for an unknown theme", () => {
    const projects = listProjectsForTheme(
      "intro-to-programming",
      "nonexistent-theme",
    );

    expect(projects).toEqual([]);
  });
});

describe("listAllProjectPaths", () => {
  it("returns a {course, theme, slug} record for every project", () => {
    const paths = listAllProjectPaths();

    expect(paths).toContainEqual({
      course: "intro-to-programming",
      theme: "recursion-and-algorithms",
      slug: "towers-of-hanoi",
    });
  });

  it("never returns duplicate (course, theme, slug) triples", () => {
    const paths = listAllProjectPaths();
    const keys = paths.map((p) => `${p.course}/${p.theme}/${p.slug}`);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
