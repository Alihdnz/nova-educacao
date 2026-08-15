import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { TERMS_VERSION } from "@/lib/student-registration";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl text-white">
        <p className="text-sm font-semibold text-cyan-300">Versão {TERMS_VERSION}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Termos de Uso</h1>
        <div className="mt-8 space-y-7 text-sm leading-7 text-white/70 sm:text-base">
          <section><h2 className="text-xl font-semibold text-white">1. Uso da plataforma</h2><p className="mt-2">A NOVA Educação oferece acesso pessoal a cursos, aulas e avaliações. A conta não pode ser compartilhada, revendida ou usada para interferir no funcionamento do serviço.</p></section>
          <section><h2 className="text-xl font-semibold text-white">2. Conta do estudante</h2><p className="mt-2">O estudante deve fornecer informações verdadeiras, manter sua senha protegida e comunicar qualquer uso não autorizado. O progresso e os resultados ficam vinculados à conta cadastrada.</p></section>
          <section><h2 className="text-xl font-semibold text-white">3. Conteúdo educacional</h2><p className="mt-2">Os materiais são destinados ao aprendizado individual. Marcas, textos, imagens, exercícios e demais conteúdos permanecem protegidos pelos direitos de seus titulares.</p></section>
          <section><h2 className="text-xl font-semibold text-white">4. Disponibilidade</h2><p className="mt-2">A plataforma pode receber manutenção e atualizações. Conteúdos podem ser revisados, publicados ou arquivados conforme critérios pedagógicos e operacionais.</p></section>
          <section><h2 className="text-xl font-semibold text-white">5. Contato</h2><p className="mt-2">Dúvidas sobre estes termos podem ser encaminhadas pelos canais oficiais informados pela NOVA Educação.</p></section>
        </div>
      </article>
    </Container>
  );
}
