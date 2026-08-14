"use client";

import { Container } from "@/components/layout/container";
import { RouteError } from "@/components/shared/route-error";

export default function StudentError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="py-10 sm:py-14">
      <RouteError error={error} retry={retry} />
    </Container>
  );
}
