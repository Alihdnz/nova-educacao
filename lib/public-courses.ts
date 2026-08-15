import "server-only";

import { cache } from "react";

import { ContentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const publicCourseSelect = {
  coverImageUrl: true,
  description: true,
  id: true,
  slug: true,
  status: true,
  subjects: {
    orderBy: { order: "asc" as const },
    where: { status: ContentStatus.PUBLISHED },
    select: {
      description: true,
      id: true,
      modules: {
        orderBy: { order: "asc" as const },
        where: { status: ContentStatus.PUBLISHED },
        select: {
          description: true,
          id: true,
          lessons: {
            orderBy: { order: "asc" as const },
            where: { status: ContentStatus.PUBLISHED },
            select: { id: true, title: true },
          },
          order: true,
          title: true,
        },
      },
      order: true,
      title: true,
    },
  },
  title: true,
  updatedAt: true,
} as const;

export const getPublicCourses = cache(async () =>
  prisma.course.findMany({
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: publicCourseSelect,
    where: { status: ContentStatus.PUBLISHED },
  }),
);

export const getPublicCourse = cache(async (courseId: string) =>
  prisma.course.findFirst({
    select: publicCourseSelect,
    where: { id: courseId, status: ContentStatus.PUBLISHED },
  }),
);

export type PublicCourse = Awaited<ReturnType<typeof getPublicCourses>>[number];

export function publicCourseLessonCount(course: PublicCourse) {
  return course.subjects.reduce(
    (courseTotal, subject) =>
      courseTotal +
      subject.modules.reduce(
        (subjectTotal, module) => subjectTotal + module.lessons.length,
        0,
      ),
    0,
  );
}
