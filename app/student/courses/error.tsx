"use client";

import { Container } from "@/components/layout/container";
import { RouteError } from "@/components/shared/route-error";

export default function StudentCoursesError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-8 sm:py-10">
      <RouteError error={error} retry={retry} />
    </Container>
  );
}
