import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("publicPath", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns the path unchanged in development (no basePath)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { publicPath } = await import("./publicPath");

    expect(publicPath("/sources/foo.py")).toBe("/sources/foo.py");
  });

  it("prepends the GitHub Pages basePath in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { publicPath } = await import("./publicPath");

    expect(publicPath("/sources/foo.py")).toBe(
      "/technical-projects-portfolio/sources/foo.py",
    );
  });

  it("handles paths missing a leading slash", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { publicPath } = await import("./publicPath");

    expect(publicPath("sources/foo.py")).toBe(
      "/technical-projects-portfolio/sources/foo.py",
    );
  });
});
