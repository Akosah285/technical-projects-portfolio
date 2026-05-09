import { describe, expect, it } from "vitest";
import { getCourse, getTheme, listAllCourses } from "./courseRegistry";
import { listProjectsForTheme } from "./projectRegistry";

describe("courseRegistry", () => {
  it("knows about Intro to Programming", () => {
    const course = getCourse("intro-to-programming");
    expect(course).not.toBeNull();
    expect(course?.title).toMatch(/Introduction/);
  });

  it("declares all seven themes for Intro to Programming", () => {
    const course = getCourse("intro-to-programming");
    expect(course?.themes.length).toBe(7);
  });

  it("every theme declared in courseRegistry has at least one project registered", () => {
    for (const course of listAllCourses()) {
      for (const theme of course.themes) {
        const projects = listProjectsForTheme(course.slug, theme.slug);
        expect(projects.length, `${course.slug}/${theme.slug} has no projects`).toBeGreaterThan(0);
      }
    }
  });

  it("getTheme resolves a known theme and returns both course + theme", () => {
    const r = getTheme("intro-to-programming", "interactive-worlds");
    expect(r).not.toBeNull();
    expect(r?.course.slug).toBe("intro-to-programming");
    expect(r?.theme.slug).toBe("interactive-worlds");
  });

  it("getTheme returns null for an unknown theme", () => {
    expect(getTheme("intro-to-programming", "nope")).toBeNull();
  });
});
