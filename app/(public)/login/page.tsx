import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { NovaLogo } from "@/components/brand/nova-logo";
import { getSession } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session?.user.role === "STUDENT") {
    redirect("/student");
  }

  if (session) {
    redirect("/forbidden");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section
        className="nova-surface w-full p-6 shadow-[var(--nova-shadow-md)] sm:p-8"
        aria-labelledby="login-title"
      >
        <div className="mb-7 space-y-4">
          <NovaLogo className="w-36" href="/" inverted priority />
          <div className="space-y-1.5">
            <h1 id="login-title" className="text-2xl font-semibold">
              Acesse a NOVA
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Continue sua jornada de conhecimento com as credenciais fornecidas pela plataforma.
            </p>
          </div>
        </div>
        <LoginForm />
      </section>
    </div>
  );
}
