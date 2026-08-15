import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  description: "Crie sua conta de estudante na NOVA Educação.",
  title: "Cadastro de aluno",
};

export default function RegisterPage() {
  return (
    <Container className="grid min-h-[calc(100vh-9rem)] place-items-center py-10 sm:py-14">
      <section className="w-full max-w-3xl rounded-lg border border-cyan-300/20 bg-[#071027]/94 p-5 shadow-[0_24px_80px_rgb(0_0_0/35%)] sm:p-8" aria-labelledby="register-title">
        <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Conta de estudante</p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl" id="register-title">Comece sua jornada</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">Preencha seus dados para acessar os cursos e acompanhar seu progresso.</p>
          </div>
          <ShieldCheck aria-hidden="true" className="size-9 shrink-0 text-cyan-300" />
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-white/60">Já possui uma conta? <Link className="font-semibold text-cyan-300 hover:underline" href="/login">Entrar</Link></p>
      </section>
    </Container>
  );
}
