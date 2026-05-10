import { redirect } from "next/navigation";
import { getTheme, listAllCourses } from "@/lib/registry/courseRegistry";

export function generateStaticParams() {
  const params: Array<{ course: string; theme: string }> = [];
  for (const course of listAllCourses()) {
    for (const theme of course.themes) {
      params.push({ course: course.slug, theme: theme.slug });
    }
  }
  return params;
}

interface PageParams {
  params: Promise<{ course: string; theme: string }>;
}

export default async function ThemePage({ params }: PageParams) {
  const { course, theme } = await params;
  const r = getTheme(course, theme);
  if (!r) {
    redirect(`/courses/${course}/`);
  }
  redirect(`/courses/${course}/?theme=${theme}`);
}
