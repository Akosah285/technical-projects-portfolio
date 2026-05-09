const REPO_NAME = "technical-projects-portfolio";

function getBasePath(): string {
  return process.env.NODE_ENV === "production" ? `/${REPO_NAME}` : "";
}

export function publicPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBasePath()}${normalized}`;
}
