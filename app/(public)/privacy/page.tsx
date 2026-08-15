import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PRIVACY_VERSION } from "@/lib/student-registration";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl text-white">
        <p className="text-sm font-semibold text-cyan-300">Versão {PRIVACY_VERSION}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Política de Privacidade</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-white/70 sm:text-base">
          <section><h2 className="text-xl font-semibold text-white">1. Dados tratados</h2><p className="mt-2">Tratamos os dados de identificação fornecidos no cadastro, dados técnicos de sessão, matrículas, progresso, respostas e resultados necessários para operar a experiência educacional.</p></section>
          <section><h2 className="text-xl font-semibold text-white">2. Finalidades</h2><p className="mt-2">Os dados são usados para autenticar a conta, disponibilizar cursos, registrar o histórico acadêmico, recomendar revisões e proteger a plataforma contra uso indevido.</p></section>
          <section><h2 className="text-xl font-semibold text-white">3. Proteção e acesso</h2><p className="mt-2">CPF, RG, gênero e data de nascimento são dados privados. O acesso é restrito às operações autorizadas e esses documentos não são exibidos integralmente nas interfaces do aluno.</p></section>
          <section><h2 className="text-xl font-semibold text-white">4. Retenção e direitos</h2><p className="mt-2">Os dados são mantidos pelo período necessário às finalidades informadas e às obrigações aplicáveis. O titular pode solicitar informações, correção e demais direitos pelos canais oficiais.</p></section>
          <section><h2 className="text-xl font-semibold text-white">5. Consentimento</h2><p className="mt-2">No cadastro, registramos a data e a versão aceita desta política e dos Termos de Uso para manter evidência do contexto de consentimento.</p></section>
        </div>
      </article>
    </Container>
  );
}
