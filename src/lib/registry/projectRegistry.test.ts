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
