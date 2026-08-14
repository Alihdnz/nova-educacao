import { BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
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
        className="w-full rounded-lg border bg-card p-6 shadow-sm sm:p-8"
        aria-labelledby="login-title"
      >
        <div className="mb-7 space-y-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenText aria-hidden="true" className="size-5" />
          </span>
          <div className="space-y-1.5">
            <h1 id="login-title" className="text-2xl font-semibold">
              Acesse sua conta
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Use as credenciais fornecidas pela administração da plataforma.
            </p>
          </div>
        </div>
        <LoginForm />
      </section>
    </div>
  );
}
