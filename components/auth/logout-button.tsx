"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    setError(false);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(true);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        aria-label={error ? "Falha ao sair. Tentar novamente" : "Sair"}
        disabled={isPending}
        onClick={handleLogout}
        title={error ? "Falha ao sair. Tentar novamente" : "Sair"}
        type="button"
        variant="ghost"
      >
        {isPending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <LogOut aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Sair</span>
      </Button>
      {error ? (
        <span className="sr-only" role="alert">
          Falha ao encerrar a sessão.
        </span>
      ) : null}
    </div>
  );
}
