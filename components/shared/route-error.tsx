"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type RouteErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export function RouteError({ error, retry }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      className="nova-surface flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center"
      aria-labelledby="route-error-title"
    >
      <span className="flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <TriangleAlert aria-hidden="true" className="size-5" />
      </span>
      <h1 id="route-error-title" className="mt-4 text-lg font-semibold">
        Não foi possível carregar esta área
      </h1>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        Ocorreu uma falha inesperada. Tente carregar os dados novamente.
      </p>
      <Button className="mt-5" onClick={retry} type="button" variant="outline">
        <RefreshCw aria-hidden="true" />
        Tentar novamente
      </Button>
    </section>
  );
}
