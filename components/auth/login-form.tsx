"use client";

import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const destinationByRole: Record<string, string> = {
  ADMIN: "/admin",
  STUDENT: "/student",
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (result.error) {
        setError("Email ou senha inválidos.");
        return;
      }

      const destination = destinationByRole[result.data.user.role];

      if (!destination) {
        window.location.replace("/forbidden");
        return;
      }

      window.location.replace(destination);
    } catch {
      setError("Não foi possível entrar agora. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" method="post" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          id="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <Input
            autoComplete="current-password"
            className="pr-11"
            id="password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
            onClick={() => setShowPassword((current) => !current)}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button className="h-10 w-full" disabled={isPending} type="submit">
        {isPending ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
