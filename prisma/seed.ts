import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import {
  AttemptStatus,
  ContentStatus,
  EnrollmentStatus,
  PrismaClient,
  ProgressStatus,
  QuestionDifficulty,
  QuestionType,
  UserRole,
  XPReason,
} from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

function getSeedPassword(name: "SEED_ADMIN_PASSWORD" | "SEED_STUDENT_PASSWORD") {
  const password = process.env[name];

  if (!password || password.length < 12) {
    throw new Error(`${name} must be configured with at least 12 characters.`);
  }

  return password;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: "economia" },
    update: {
      coverImageUrl:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
      title: "Economia",
      description: "Curso introdutório de Economia.",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      title: "Economia",
      slug: "economia",
      description: "Curso introdutório de Economia.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
      status: ContentStatus.PUBLISHED,
    },
  });

  const introductionSubject = await prisma.subject.upsert({
    where: {
      courseId_slug: {
        courseId: course.id,
        slug: "introducao-a-economia",
      },
    },
    update: {
      title: "Introdução à Economia",
      description: "Princípios fundamentais do pensamento econômico.",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      courseId: course.id,
      title: "Introdução à Economia",
      slug: "introducao-a-economia",
      description: "Princípios fundamentais do pensamento econômico.",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const microeconomicsSubject = await prisma.subject.upsert({
    where: {
      courseId_slug: {
        courseId: course.id,
        slug: "microeconomia",
      },
    },
    update: {
      title: "Microeconomia",
      description: "Decisões individuais, mercados e formação de preços.",
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      courseId: course.id,
      title: "Microeconomia",
      slug: "microeconomia",
      description: "Decisões individuais, mercados e formação de preços.",
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
  });

  const fundamentalsModule = await prisma.module.upsert({
    where: {
      subjectId_slug: {
        subjectId: introductionSubject.id,
        slug: "fundamentos",
      },
    },
    update: {
      title: "Fundamentos",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      subjectId: introductionSubject.id,
      title: "Fundamentos",
      slug: "fundamentos",
      description: "Conceitos que estruturam o estudo da Economia.",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const basicConceptsModule = await prisma.module.upsert({
    where: {
      subjectId_slug: {
        subjectId: introductionSubject.id,
        slug: "conceitos-basicos",
      },
    },
    update: {
      title: "Conceitos básicos",
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      subjectId: introductionSubject.id,
      title: "Conceitos básicos",
      slug: "conceitos-basicos",
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
  });

  const supplyDemandModule = await prisma.module.upsert({
    where: {
      subjectId_slug: {
        subjectId: microeconomicsSubject.id,
        slug: "oferta-e-demanda",
      },
    },
    update: {
      title: "Oferta e demanda",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      subjectId: microeconomicsSubject.id,
      title: "Oferta e demanda",
      slug: "oferta-e-demanda",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const economyLesson = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: fundamentalsModule.id,
        slug: "o-que-e-economia",
      },
    },
    update: {
      content: `## Economia e escolhas

A Economia estuda como pessoas e sociedades decidem usar **recursos escassos**.

- necessidades humanas;
- recursos disponíveis;
- escolhas e consequências.

Leia também o [portal do Banco Central](https://www.bcb.gov.br/) para conhecer indicadores econômicos.`,
      description: "Apresentação do objeto de estudo da Economia.",
      imageUrl:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
      title: "O que é Economia?",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      moduleId: fundamentalsModule.id,
      title: "O que é Economia?",
      slug: "o-que-e-economia",
      description: "Apresentação do objeto de estudo da Economia.",
      content: `## Economia e escolhas

A Economia estuda como pessoas e sociedades decidem usar **recursos escassos**.

- necessidades humanas;
- recursos disponíveis;
- escolhas e consequências.

Leia também o [portal do Banco Central](https://www.bcb.gov.br/) para conhecer indicadores econômicos.`,
      imageUrl:
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const scarcityLesson = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: fundamentalsModule.id,
        slug: "escassez-e-escolha",
      },
    },
    update: {
      content: `## Recursos limitados

Escassez existe porque os recursos disponíveis não atendem a todos os desejos ao mesmo tempo.

> Escolher uma alternativa significa abrir mão de outra.

---

Essa relação orienta decisões de famílias, empresas e governos.`,
      description: "A relação entre recursos limitados e decisões.",
      title: "Escassez e escolha",
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      moduleId: fundamentalsModule.id,
      title: "Escassez e escolha",
      slug: "escassez-e-escolha",
      description: "A relação entre recursos limitados e decisões.",
      content: `## Recursos limitados

Escassez existe porque os recursos disponíveis não atendem a todos os desejos ao mesmo tempo.

> Escolher uma alternativa significa abrir mão de outra.

---

Essa relação orienta decisões de famílias, empresas e governos.`,
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: fundamentalsModule.id,
        slug: "agentes-economicos",
      },
    },
    update: {
      content: `## Quem toma decisões econômicas?

Os principais agentes são:

1. famílias;
2. empresas;
3. governo.

Cada agente possui objetivos e restrições diferentes.`,
      description: "Visão inicial dos agentes que participam da economia.",
      order: 3,
      status: ContentStatus.DRAFT,
      title: "Agentes econômicos",
    },
    create: {
      moduleId: fundamentalsModule.id,
      title: "Agentes econômicos",
      slug: "agentes-economicos",
      description: "Visão inicial dos agentes que participam da economia.",
      content: `## Quem toma decisões econômicas?

Os principais agentes são:

1. famílias;
2. empresas;
3. governo.

Cada agente possui objetivos e restrições diferentes.`,
      order: 3,
      status: ContentStatus.DRAFT,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: basicConceptsModule.id,
        slug: "incentivos-e-decisoes",
      },
    },
    update: {
      content: `## Incentivos

Incentivos alteram custos e benefícios percebidos e podem influenciar escolhas econômicas.`,
      description: "Como incentivos influenciam decisões econômicas.",
      order: 2,
      status: ContentStatus.ARCHIVED,
      title: "Incentivos e decisões",
    },
    create: {
      moduleId: basicConceptsModule.id,
      title: "Incentivos e decisões",
      slug: "incentivos-e-decisoes",
      description: "Como incentivos influenciam decisões econômicas.",
      content: `## Incentivos

Incentivos alteram custos e benefícios percebidos e podem influenciar escolhas econômicas.`,
      order: 2,
      status: ContentStatus.ARCHIVED,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: basicConceptsModule.id,
        slug: "custo-de-oportunidade",
      },
    },
    update: {
      content: `## Comparando alternativas

O custo de oportunidade representa o valor da melhor alternativa abandonada ao fazer uma escolha.`,
      description: "Como comparar escolhas e alternativas disponíveis.",
      title: "Custo de oportunidade",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      moduleId: basicConceptsModule.id,
      title: "Custo de oportunidade",
      slug: "custo-de-oportunidade",
      description: "Como comparar escolhas e alternativas disponíveis.",
      content: `## Comparando alternativas

O custo de oportunidade representa o valor da melhor alternativa abandonada ao fazer uma escolha.`,
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: supplyDemandModule.id,
        slug: "introducao-a-demanda",
      },
    },
    update: {
      content: `## Demanda

A demanda relaciona as quantidades que consumidores desejam adquirir aos diferentes níveis de preço.`,
      description: "Primeiro contato com o conceito de demanda.",
      title: "Introdução à demanda",
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      moduleId: supplyDemandModule.id,
      title: "Introdução à demanda",
      slug: "introducao-a-demanda",
      description: "Primeiro contato com o conceito de demanda.",
      content: `## Demanda

A demanda relaciona as quantidades que consumidores desejam adquirir aos diferentes níveis de preço.`,
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const financeCourse = await prisma.course.upsert({
    where: { slug: "financas-pessoais" },
    update: {
      description: "Fundamentos para organizar decisões financeiras pessoais.",
      status: ContentStatus.PUBLISHED,
      title: "Finanças pessoais",
    },
    create: {
      description: "Fundamentos para organizar decisões financeiras pessoais.",
      slug: "financas-pessoais",
      status: ContentStatus.PUBLISHED,
      title: "Finanças pessoais",
    },
  });

  const planningSubject = await prisma.subject.upsert({
    where: {
      courseId_slug: {
        courseId: financeCourse.id,
        slug: "planejamento-financeiro",
      },
    },
    update: {
      description: "Organização de receitas, despesas e objetivos.",
      order: 1,
      status: ContentStatus.PUBLISHED,
      title: "Planejamento financeiro",
    },
    create: {
      courseId: financeCourse.id,
      description: "Organização de receitas, despesas e objetivos.",
      order: 1,
      slug: "planejamento-financeiro",
      status: ContentStatus.PUBLISHED,
      title: "Planejamento financeiro",
    },
  });

  const budgetModule = await prisma.module.upsert({
    where: {
      subjectId_slug: {
        slug: "orcamento-pessoal",
        subjectId: planningSubject.id,
      },
    },
    update: {
      description: "Construção e acompanhamento de um orçamento simples.",
      order: 1,
      status: ContentStatus.PUBLISHED,
      title: "Orçamento pessoal",
    },
    create: {
      description: "Construção e acompanhamento de um orçamento simples.",
      order: 1,
      slug: "orcamento-pessoal",
      status: ContentStatus.PUBLISHED,
      subjectId: planningSubject.id,
      title: "Orçamento pessoal",
    },
  });

  const incomeLesson = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: budgetModule.id,
        slug: "mapeando-receitas",
      },
    },
    update: {
      content: "## Receitas\n\nMapeie todas as entradas recorrentes e eventuais do seu orçamento.",
      description: "Identificação das fontes de renda.",
      order: 1,
      status: ContentStatus.PUBLISHED,
      title: "Mapeando receitas",
    },
    create: {
      content: "## Receitas\n\nMapeie todas as entradas recorrentes e eventuais do seu orçamento.",
      description: "Identificação das fontes de renda.",
      moduleId: budgetModule.id,
      order: 1,
      slug: "mapeando-receitas",
      status: ContentStatus.PUBLISHED,
      title: "Mapeando receitas",
    },
  });

  const expenseLesson = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: budgetModule.id,
        slug: "organizando-despesas",
      },
    },
    update: {
      content: "## Despesas\n\nClassifique gastos fixos, variáveis e eventuais para acompanhar seu orçamento.",
      description: "Classificação e acompanhamento de gastos.",
      order: 2,
      status: ContentStatus.PUBLISHED,
      title: "Organizando despesas",
    },
    create: {
      content: "## Despesas\n\nClassifique gastos fixos, variáveis e eventuais para acompanhar seu orçamento.",
      description: "Classificação e acompanhamento de gastos.",
      moduleId: budgetModule.id,
      order: 2,
      slug: "organizando-despesas",
      status: ContentStatus.PUBLISHED,
      title: "Organizando despesas",
    },
  });

  const scarcityQuestion = await prisma.question.upsert({
    where: { id: "seed-question-scarcity" },
    update: {
      difficulty: QuestionDifficulty.EASY,
      explanation:
        "A escassez surge porque os recursos são limitados, enquanto necessidades e desejos são amplos.",
      lessonId: economyLesson.id,
      prompt: "O que caracteriza a escassez econômica?",
      type: QuestionType.SINGLE_CHOICE,
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      id: "seed-question-scarcity",
      difficulty: QuestionDifficulty.EASY,
      explanation:
        "A escassez surge porque os recursos são limitados, enquanto necessidades e desejos são amplos.",
      lessonId: economyLesson.id,
      prompt: "O que caracteriza a escassez econômica?",
      type: QuestionType.SINGLE_CHOICE,
      order: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const choicesQuestion = await prisma.question.upsert({
    where: { id: "seed-question-choices" },
    update: {
      difficulty: QuestionDifficulty.MEDIUM,
      explanation:
        "Escolher implica renunciar à melhor alternativa disponível, conceito chamado custo de oportunidade.",
      lessonId: economyLesson.id,
      prompt: "Toda escolha econômica envolve abrir mão de uma alternativa.",
      type: QuestionType.TRUE_FALSE,
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      id: "seed-question-choices",
      difficulty: QuestionDifficulty.MEDIUM,
      explanation:
        "Escolher implica renunciar à melhor alternativa disponível, conceito chamado custo de oportunidade.",
      lessonId: economyLesson.id,
      prompt: "Toda escolha econômica envolve abrir mão de uma alternativa.",
      type: QuestionType.TRUE_FALSE,
      order: 2,
      status: ContentStatus.PUBLISHED,
    },
  });

  const scarceResourcesAnswer = await prisma.answer.upsert({
    where: {
      questionId_order: { questionId: scarcityQuestion.id, order: 1 },
    },
    update: {
      text: "Os recursos são limitados diante de necessidades e desejos.",
      isCorrect: true,
    },
    create: {
      questionId: scarcityQuestion.id,
      text: "Os recursos são limitados diante de necessidades e desejos.",
      order: 1,
      isCorrect: true,
    },
  });

  const unlimitedResourcesAnswer = await prisma.answer.upsert({
    where: {
      questionId_order: { questionId: scarcityQuestion.id, order: 2 },
    },
    update: {
      text: "Todos os recursos estão disponíveis em quantidade ilimitada.",
      isCorrect: false,
    },
    create: {
      questionId: scarcityQuestion.id,
      text: "Todos os recursos estão disponíveis em quantidade ilimitada.",
      order: 2,
      isCorrect: false,
    },
  });

  await prisma.answer.upsert({
    where: {
      questionId_order: { questionId: scarcityQuestion.id, order: 3 },
    },
    update: {
      text: "As pessoas não precisam realizar escolhas.",
      isCorrect: false,
    },
    create: {
      questionId: scarcityQuestion.id,
      text: "As pessoas não precisam realizar escolhas.",
      order: 3,
      isCorrect: false,
    },
  });

  const falseAnswer = await prisma.answer.upsert({
    where: {
      questionId_order: { questionId: choicesQuestion.id, order: 1 },
    },
    update: { text: "Falso", isCorrect: false },
    create: {
      questionId: choicesQuestion.id,
      text: "Falso",
      order: 1,
      isCorrect: false,
    },
  });

  const trueAnswer = await prisma.answer.upsert({
    where: {
      questionId_order: { questionId: choicesQuestion.id, order: 2 },
    },
    update: { text: "Verdadeiro", isCorrect: true },
    create: {
      questionId: choicesQuestion.id,
      text: "Verdadeiro",
      order: 2,
      isCorrect: true,
    },
  });

  const opportunityQuestion = await prisma.question.upsert({
    where: { id: "seed-question-opportunity" },
    update: {
      difficulty: QuestionDifficulty.HARD,
      explanation:
        "O custo de oportunidade corresponde ao valor da melhor alternativa abandonada.",
      lessonId: economyLesson.id,
      order: 3,
      prompt: "Ao escolher investir em um curso, qual elemento representa o custo de oportunidade?",
      status: ContentStatus.DRAFT,
      type: QuestionType.SINGLE_CHOICE,
    },
    create: {
      id: "seed-question-opportunity",
      difficulty: QuestionDifficulty.HARD,
      explanation:
        "O custo de oportunidade corresponde ao valor da melhor alternativa abandonada.",
      lessonId: economyLesson.id,
      order: 3,
      prompt: "Ao escolher investir em um curso, qual elemento representa o custo de oportunidade?",
      status: ContentStatus.DRAFT,
      type: QuestionType.SINGLE_CHOICE,
    },
  });

  await prisma.answer.upsert({
    where: { questionId_order: { questionId: opportunityQuestion.id, order: 1 } },
    update: { isCorrect: true, text: "O valor da melhor alternativa abandonada." },
    create: {
      isCorrect: true,
      order: 1,
      questionId: opportunityQuestion.id,
      text: "O valor da melhor alternativa abandonada.",
    },
  });

  await prisma.answer.upsert({
    where: { questionId_order: { questionId: opportunityQuestion.id, order: 2 } },
    update: { isCorrect: false, text: "Somente o preço pago pelo curso." },
    create: {
      isCorrect: false,
      order: 2,
      questionId: opportunityQuestion.id,
      text: "Somente o preço pago pelo curso.",
    },
  });

  const assessment = await prisma.assessment.upsert({
    where: { slug: "avaliacao-fundamentos-economia" },
    update: {
      description: "Avaliação introdutória sobre escassez e escolhas.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 70,
      timeLimitMinutes: 20,
      title: "Avaliação de fundamentos de Economia",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      lessonId: economyLesson.id,
      title: "Avaliação de fundamentos de Economia",
      slug: "avaliacao-fundamentos-economia",
      description: "Avaliação introdutória sobre escassez e escolhas.",
      maxScore: 10,
      passingPercentage: 70,
      timeLimitMinutes: 20,
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.assessmentQuestion.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: assessment.id,
        questionId: scarcityQuestion.id,
      },
    },
    update: { order: 1, weight: 5 },
    create: {
      assessmentId: assessment.id,
      questionId: scarcityQuestion.id,
      order: 1,
      weight: 5,
    },
  });

  await prisma.assessmentQuestion.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: assessment.id,
        questionId: choicesQuestion.id,
      },
    },
    update: { order: 2, weight: 5 },
    create: {
      assessmentId: assessment.id,
      questionId: choicesQuestion.id,
      order: 2,
      weight: 5,
    },
  });

  const draftAssessment = await prisma.assessment.upsert({
    where: { slug: "revisao-de-conceitos-economicos" },
    update: {
      description: "Avaliação em preparação para revisar os conceitos da aula.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 70,
      status: ContentStatus.DRAFT,
      timeLimitMinutes: null,
      title: "Revisão de conceitos econômicos",
    },
    create: {
      description: "Avaliação em preparação para revisar os conceitos da aula.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 70,
      slug: "revisao-de-conceitos-economicos",
      status: ContentStatus.DRAFT,
      timeLimitMinutes: null,
      title: "Revisão de conceitos econômicos",
    },
  });

  const untimedAssessment = await prisma.assessment.upsert({
    where: { slug: "avaliacao-sem-limite-economia" },
    update: {
      description: "Avaliação de fundamentos sem limite de tempo.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 60,
      status: ContentStatus.PUBLISHED,
      timeLimitMinutes: null,
      title: "Avaliação sem limite de tempo",
    },
    create: {
      description: "Avaliação de fundamentos sem limite de tempo.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 60,
      slug: "avaliacao-sem-limite-economia",
      status: ContentStatus.PUBLISHED,
      timeLimitMinutes: null,
      title: "Avaliação sem limite de tempo",
    },
  });

  await prisma.assessmentQuestion.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: untimedAssessment.id,
        questionId: scarcityQuestion.id,
      },
    },
    update: { order: 1, weight: 5 },
    create: {
      assessmentId: untimedAssessment.id,
      questionId: scarcityQuestion.id,
      order: 1,
      weight: 5,
    },
  });

  await prisma.assessmentQuestion.upsert({
    where: {
      assessmentId_questionId: {
        assessmentId: untimedAssessment.id,
        questionId: choicesQuestion.id,
      },
    },
    update: { order: 2, weight: 5 },
    create: {
      assessmentId: untimedAssessment.id,
      questionId: choicesQuestion.id,
      order: 2,
      weight: 5,
    },
  });

  const archivedAssessment = await prisma.assessment.upsert({
    where: { slug: "avaliacao-arquivada-economia" },
    update: {
      description: "Avaliação arquivada para validar os bloqueios do aluno.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 70,
      status: ContentStatus.ARCHIVED,
      timeLimitMinutes: 10,
      title: "Avaliação arquivada",
    },
    create: {
      description: "Avaliação arquivada para validar os bloqueios do aluno.",
      lessonId: economyLesson.id,
      maxScore: 10,
      passingPercentage: 70,
      slug: "avaliacao-arquivada-economia",
      status: ContentStatus.ARCHIVED,
      timeLimitMinutes: 10,
      title: "Avaliação arquivada",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "aluno@example.com" },
    update: {
      birthDate: new Date("2000-03-15T00:00:00.000Z"),
      cpf: "52998224725",
      firstName: "Aluno",
      gender: "PREFER_NOT_TO_SAY",
      lastName: "Exemplo",
      name: "Aluno Exemplo",
      privacyAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      privacyAcceptedVersion: "2026-08-15",
      rg: "12.345.678-9",
      role: UserRole.STUDENT,
      termsAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      termsAcceptedVersion: "2026-08-15",
    },
    create: {
      birthDate: new Date("2000-03-15T00:00:00.000Z"),
      cpf: "52998224725",
      name: "Aluno Exemplo",
      email: "aluno@example.com",
      firstName: "Aluno",
      gender: "PREFER_NOT_TO_SAY",
      lastName: "Exemplo",
      privacyAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      privacyAcceptedVersion: "2026-08-15",
      rg: "12.345.678-9",
      role: UserRole.STUDENT,
      termsAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      termsAcceptedVersion: "2026-08-15",
    },
  });

  const studentWithoutEnrollment = await prisma.user.upsert({
    where: { email: "aluno.sem.curso@example.com" },
    update: { name: "Aluno sem curso", role: UserRole.STUDENT },
    create: {
      name: "Aluno sem curso",
      email: "aluno.sem.curso@example.com",
      role: UserRole.STUDENT,
    },
  });

  const isolatedStudent = await prisma.user.upsert({
    where: { email: "aluno.isolado@example.com" },
    update: {
      birthDate: new Date("1998-11-08T00:00:00.000Z"),
      cpf: "11144477735",
      firstName: "Aluno",
      gender: "MALE",
      lastName: "Isolado",
      name: "Aluno Isolado",
      privacyAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      privacyAcceptedVersion: "2026-08-15",
      rg: "98.765.432-1",
      role: UserRole.STUDENT,
      termsAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      termsAcceptedVersion: "2026-08-15",
    },
    create: {
      birthDate: new Date("1998-11-08T00:00:00.000Z"),
      cpf: "11144477735",
      email: "aluno.isolado@example.com",
      firstName: "Aluno",
      gender: "MALE",
      lastName: "Isolado",
      name: "Aluno Isolado",
      privacyAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      privacyAcceptedVersion: "2026-08-15",
      rg: "98.765.432-1",
      role: UserRole.STUDENT,
      termsAcceptedAt: new Date("2026-08-15T12:00:00.000Z"),
      termsAcceptedVersion: "2026-08-15",
    },
  });

  const studentWithoutHistory = await prisma.user.upsert({
    where: { email: "aluno.novo@example.com" },
    update: { name: "Aluno Novo", role: UserRole.STUDENT },
    create: {
      email: "aluno.novo@example.com",
      name: "Aluno Novo",
      role: UserRole.STUDENT,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "gestor@example.com" },
    update: { name: "Gestor Exemplo", role: UserRole.COURSE_MANAGER },
    create: {
      name: "Gestor Exemplo",
      email: "gestor@example.com",
      role: UserRole.COURSE_MANAGER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { name: "Administrador Exemplo", role: UserRole.ADMIN },
    create: {
      name: "Administrador Exemplo",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    },
  });

  const [studentPassword, adminPassword] = await Promise.all([
    hashPassword(getSeedPassword("SEED_STUDENT_PASSWORD")),
    hashPassword(getSeedPassword("SEED_ADMIN_PASSWORD")),
  ]);

  await Promise.all([
    prisma.account.upsert({
      where: {
        providerId_accountId: {
          accountId: studentWithoutHistory.id,
          providerId: "credential",
        },
      },
      update: { password: studentPassword, userId: studentWithoutHistory.id },
      create: {
        accountId: studentWithoutHistory.id,
        password: studentPassword,
        providerId: "credential",
        userId: studentWithoutHistory.id,
      },
    }),
    prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: student.id,
        },
      },
      update: { password: studentPassword, userId: student.id },
      create: {
        accountId: student.id,
        providerId: "credential",
        userId: student.id,
        password: studentPassword,
      },
    }),
    prisma.account.upsert({
      where: {
        providerId_accountId: {
          accountId: isolatedStudent.id,
          providerId: "credential",
        },
      },
      update: {
        password: studentPassword,
        userId: isolatedStudent.id,
      },
      create: {
        accountId: isolatedStudent.id,
        password: studentPassword,
        providerId: "credential",
        userId: isolatedStudent.id,
      },
    }),
    prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: studentWithoutEnrollment.id,
        },
      },
      update: {
        password: studentPassword,
        userId: studentWithoutEnrollment.id,
      },
      create: {
        accountId: studentWithoutEnrollment.id,
        providerId: "credential",
        userId: studentWithoutEnrollment.id,
        password: studentPassword,
      },
    }),
    prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: admin.id,
        },
      },
      update: { password: adminPassword, userId: admin.id },
      create: {
        accountId: admin.id,
        providerId: "credential",
        userId: admin.id,
        password: adminPassword,
      },
    }),
  ]);

  await prisma.courseManager.upsert({
    where: {
      userId_courseId: { userId: manager.id, courseId: course.id },
    },
    update: {},
    create: { userId: manager.id, courseId: course.id },
  });

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: course.id },
    },
    update: { completedAt: null, status: EnrollmentStatus.ACTIVE },
    create: {
      userId: student.id,
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  const completedEnrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        courseId: financeCourse.id,
        userId: student.id,
      },
    },
    update: {
      completedAt: new Date("2026-08-05T15:00:00.000Z"),
      enrolledAt: new Date("2026-08-05T12:00:00.000Z"),
      status: EnrollmentStatus.COMPLETED,
    },
    create: {
      completedAt: new Date("2026-08-05T15:00:00.000Z"),
      courseId: financeCourse.id,
      enrolledAt: new Date("2026-08-05T12:00:00.000Z"),
      status: EnrollmentStatus.COMPLETED,
      userId: student.id,
    },
  });

  const isolatedEnrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        courseId: course.id,
        userId: isolatedStudent.id,
      },
    },
    update: { completedAt: null, status: EnrollmentStatus.ACTIVE },
    create: {
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
      userId: isolatedStudent.id,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        courseId: course.id,
        userId: studentWithoutHistory.id,
      },
    },
    update: { completedAt: null, status: EnrollmentStatus.ACTIVE },
    create: {
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
      userId: studentWithoutHistory.id,
    },
  });

  const transientAttempts = await prisma.attempt.findMany({
    where: {
      OR: [
        {
          enrollmentId: enrollment.id,
          OR: [
            { assessmentId: assessment.id, attemptNumber: { gt: 1 } },
            {
              assessmentId: {
                in: [
                  draftAssessment.id,
                  untimedAssessment.id,
                  archivedAssessment.id,
                ],
              },
            },
          ],
        },
        {
          enrollmentId: isolatedEnrollment.id,
          OR: [
            { assessmentId: { not: assessment.id } },
            { attemptNumber: { gt: 1 } },
          ],
        },
      ],
    },
    select: { id: true },
  });
  const transientAttemptIds = transientAttempts.map((attempt) => attempt.id);
  if (transientAttemptIds.length > 0) {
    await prisma.attemptAnswer.deleteMany({
      where: { attemptId: { in: transientAttemptIds } },
    });
    await prisma.attempt.deleteMany({ where: { id: { in: transientAttemptIds } } });
  }

  await Promise.all([
    prisma.progress.deleteMany({
      where: {
        enrollmentId: enrollment.id,
        lessonId: { notIn: [economyLesson.id, scarcityLesson.id] },
      },
    }),
    prisma.progress.deleteMany({
      where: {
        enrollmentId: completedEnrollment.id,
        lessonId: { notIn: [incomeLesson.id, expenseLesson.id] },
      },
    }),
    prisma.progress.deleteMany({
      where: {
        enrollmentId: isolatedEnrollment.id,
        lessonId: { not: economyLesson.id },
      },
    }),
  ]);

  await prisma.progress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: economyLesson.id,
      },
    },
    update: {
      status: ProgressStatus.COMPLETED,
      startedAt: new Date("2026-08-01T12:00:00.000Z"),
      completedAt: new Date("2026-08-01T12:30:00.000Z"),
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: economyLesson.id,
      status: ProgressStatus.COMPLETED,
      startedAt: new Date("2026-08-01T12:00:00.000Z"),
      completedAt: new Date("2026-08-01T12:30:00.000Z"),
    },
  });

  await Promise.all([
    prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: completedEnrollment.id,
          lessonId: incomeLesson.id,
        },
      },
      update: {
        completedAt: new Date("2026-08-05T14:00:00.000Z"),
        startedAt: new Date("2026-08-05T13:30:00.000Z"),
        status: ProgressStatus.COMPLETED,
      },
      create: {
        completedAt: new Date("2026-08-05T14:00:00.000Z"),
        enrollmentId: completedEnrollment.id,
        lessonId: incomeLesson.id,
        startedAt: new Date("2026-08-05T13:30:00.000Z"),
        status: ProgressStatus.COMPLETED,
      },
    }),
    prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: completedEnrollment.id,
          lessonId: expenseLesson.id,
        },
      },
      update: {
        completedAt: new Date("2026-08-05T15:00:00.000Z"),
        startedAt: new Date("2026-08-05T14:10:00.000Z"),
        status: ProgressStatus.COMPLETED,
      },
      create: {
        completedAt: new Date("2026-08-05T15:00:00.000Z"),
        enrollmentId: completedEnrollment.id,
        lessonId: expenseLesson.id,
        startedAt: new Date("2026-08-05T14:10:00.000Z"),
        status: ProgressStatus.COMPLETED,
      },
    }),
    prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: isolatedEnrollment.id,
          lessonId: economyLesson.id,
        },
      },
      update: {
        completedAt: null,
        startedAt: new Date("2026-08-03T10:00:00.000Z"),
        status: ProgressStatus.IN_PROGRESS,
      },
      create: {
        enrollmentId: isolatedEnrollment.id,
        lessonId: economyLesson.id,
        startedAt: new Date("2026-08-03T10:00:00.000Z"),
        status: ProgressStatus.IN_PROGRESS,
      },
    }),
  ]);

  await prisma.progress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: scarcityLesson.id,
      },
    },
    update: {
      status: ProgressStatus.IN_PROGRESS,
      startedAt: new Date("2026-08-02T12:00:00.000Z"),
      completedAt: null,
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: scarcityLesson.id,
      status: ProgressStatus.IN_PROGRESS,
      startedAt: new Date("2026-08-02T12:00:00.000Z"),
    },
  });

  const attempt = await prisma.attempt.upsert({
    where: {
      enrollmentId_assessmentId_attemptNumber: {
        enrollmentId: enrollment.id,
        assessmentId: assessment.id,
        attemptNumber: 1,
      },
    },
    update: {
      correctAnswers: 2,
      maxScoreSnapshot: 10,
      passed: true,
      passingPercentageSnapshot: 70,
      percentage: 100,
      status: AttemptStatus.SUBMITTED,
      score: 10,
      submittedAt: new Date("2026-08-01T12:45:00.000Z"),
      timeLimitMinutesSnapshot: 20,
      totalQuestions: 2,
    },
    create: {
      enrollmentId: enrollment.id,
      assessmentId: assessment.id,
      attemptNumber: 1,
      correctAnswers: 2,
      maxScoreSnapshot: 10,
      passed: true,
      passingPercentageSnapshot: 70,
      percentage: 100,
      status: AttemptStatus.SUBMITTED,
      score: 10,
      startedAt: new Date("2026-08-01T12:35:00.000Z"),
      submittedAt: new Date("2026-08-01T12:45:00.000Z"),
      timeLimitMinutesSnapshot: 20,
      totalQuestions: 2,
    },
  });

  await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: scarcityQuestion.id,
      },
    },
    update: {
      selectedAnswerId: scarceResourcesAnswer.id,
      isCorrect: true,
    },
    create: {
      attemptId: attempt.id,
      questionId: scarcityQuestion.id,
      selectedAnswerId: scarceResourcesAnswer.id,
      isCorrect: true,
    },
  });

  const isolatedAttempt = await prisma.attempt.upsert({
    where: {
      enrollmentId_assessmentId_attemptNumber: {
        assessmentId: assessment.id,
        attemptNumber: 1,
        enrollmentId: isolatedEnrollment.id,
      },
    },
    update: {
      correctAnswers: 0,
      maxScoreSnapshot: 10,
      passed: false,
      passingPercentageSnapshot: 70,
      percentage: 0,
      score: 0,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-03T10:30:00.000Z"),
      timeLimitMinutesSnapshot: 20,
      totalQuestions: 2,
    },
    create: {
      assessmentId: assessment.id,
      attemptNumber: 1,
      correctAnswers: 0,
      enrollmentId: isolatedEnrollment.id,
      maxScoreSnapshot: 10,
      passed: false,
      passingPercentageSnapshot: 70,
      percentage: 0,
      score: 0,
      startedAt: new Date("2026-08-03T10:15:00.000Z"),
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-03T10:30:00.000Z"),
      timeLimitMinutesSnapshot: 20,
      totalQuestions: 2,
    },
  });

  await Promise.all([
    prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: isolatedAttempt.id,
          questionId: scarcityQuestion.id,
        },
      },
      update: {
        isCorrect: false,
        selectedAnswerId: unlimitedResourcesAnswer.id,
      },
      create: {
        attemptId: isolatedAttempt.id,
        isCorrect: false,
        questionId: scarcityQuestion.id,
        selectedAnswerId: unlimitedResourcesAnswer.id,
      },
    }),
    prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: isolatedAttempt.id,
          questionId: choicesQuestion.id,
        },
      },
      update: { isCorrect: false, selectedAnswerId: falseAnswer.id },
      create: {
        attemptId: isolatedAttempt.id,
        isCorrect: false,
        questionId: choicesQuestion.id,
        selectedAnswerId: falseAnswer.id,
      },
    }),
  ]);

  await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: choicesQuestion.id,
      },
    },
    update: { selectedAnswerId: trueAnswer.id, isCorrect: true },
    create: {
      attemptId: attempt.id,
      questionId: choicesQuestion.id,
      selectedAnswerId: trueAnswer.id,
      isCorrect: true,
    },
  });

  const highPerformanceAttempt = await prisma.attempt.upsert({
    where: {
      enrollmentId_assessmentId_attemptNumber: {
        assessmentId: untimedAssessment.id,
        attemptNumber: 1,
        enrollmentId: enrollment.id,
      },
    },
    update: {
      correctAnswers: 2,
      maxScoreSnapshot: 10,
      passed: true,
      passingPercentageSnapshot: 60,
      percentage: 100,
      score: 10,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-02T13:30:00.000Z"),
      timeLimitMinutesSnapshot: null,
      totalQuestions: 2,
    },
    create: {
      assessmentId: untimedAssessment.id,
      attemptNumber: 1,
      correctAnswers: 2,
      enrollmentId: enrollment.id,
      maxScoreSnapshot: 10,
      passed: true,
      passingPercentageSnapshot: 60,
      percentage: 100,
      score: 10,
      startedAt: new Date("2026-08-02T13:20:00.000Z"),
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-02T13:30:00.000Z"),
      timeLimitMinutesSnapshot: null,
      totalQuestions: 2,
    },
  });

  const lowPerformanceAttempt = await prisma.attempt.upsert({
    where: {
      enrollmentId_assessmentId_attemptNumber: {
        assessmentId: untimedAssessment.id,
        attemptNumber: 1,
        enrollmentId: isolatedEnrollment.id,
      },
    },
    update: {
      correctAnswers: 0,
      maxScoreSnapshot: 10,
      passed: false,
      passingPercentageSnapshot: 60,
      percentage: 0,
      score: 0,
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-04T10:30:00.000Z"),
      timeLimitMinutesSnapshot: null,
      totalQuestions: 2,
    },
    create: {
      assessmentId: untimedAssessment.id,
      attemptNumber: 1,
      correctAnswers: 0,
      enrollmentId: isolatedEnrollment.id,
      maxScoreSnapshot: 10,
      passed: false,
      passingPercentageSnapshot: 60,
      percentage: 0,
      score: 0,
      startedAt: new Date("2026-08-04T10:20:00.000Z"),
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date("2026-08-04T10:30:00.000Z"),
      timeLimitMinutesSnapshot: null,
      totalQuestions: 2,
    },
  });

  await Promise.all([
    prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: highPerformanceAttempt.id, questionId: scarcityQuestion.id } },
      update: { isCorrect: true, selectedAnswerId: scarceResourcesAnswer.id },
      create: { attemptId: highPerformanceAttempt.id, isCorrect: true, questionId: scarcityQuestion.id, selectedAnswerId: scarceResourcesAnswer.id },
    }),
    prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: highPerformanceAttempt.id, questionId: choicesQuestion.id } },
      update: { isCorrect: true, selectedAnswerId: trueAnswer.id },
      create: { attemptId: highPerformanceAttempt.id, isCorrect: true, questionId: choicesQuestion.id, selectedAnswerId: trueAnswer.id },
    }),
    prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: lowPerformanceAttempt.id, questionId: scarcityQuestion.id } },
      update: { isCorrect: false, selectedAnswerId: unlimitedResourcesAnswer.id },
      create: { attemptId: lowPerformanceAttempt.id, isCorrect: false, questionId: scarcityQuestion.id, selectedAnswerId: unlimitedResourcesAnswer.id },
    }),
    prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: lowPerformanceAttempt.id, questionId: choicesQuestion.id } },
      update: { isCorrect: false, selectedAnswerId: falseAnswer.id },
      create: { attemptId: lowPerformanceAttempt.id, isCorrect: false, questionId: choicesQuestion.id, selectedAnswerId: falseAnswer.id },
    }),
  ]);

  const achievement = await prisma.achievement.upsert({
    where: { slug: "primeira-aula-concluida" },
    update: {
      title: "Primeira aula concluída",
      description: "Concluiu a primeira aula na plataforma.",
      xpReward: 50,
    },
    create: {
      title: "Primeira aula concluída",
      slug: "primeira-aula-concluida",
      description: "Concluiu a primeira aula na plataforma.",
      xpReward: 50,
    },
  });

  await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId: student.id,
        achievementId: achievement.id,
      },
    },
    update: {},
    create: { userId: student.id, achievementId: achievement.id },
  });

  await prisma.xPTransaction.upsert({
    where: { id: "seed-xp-first-lesson" },
    update: {
      userId: student.id,
      amount: 50,
      reason: XPReason.ACHIEVEMENT_EARNED,
      description: "XP pela primeira aula concluída.",
      referenceId: achievement.id,
    },
    create: {
      id: "seed-xp-first-lesson",
      userId: student.id,
      amount: 50,
      reason: XPReason.ACHIEVEMENT_EARNED,
      description: "XP pela primeira aula concluída.",
      referenceId: achievement.id,
    },
  });

  await prisma.studyStreak.upsert({
    where: { userId: student.id },
    update: {
      currentDays: 2,
      longestDays: 2,
      lastStudyDate: new Date("2026-08-02T00:00:00.000Z"),
    },
    create: {
      userId: student.id,
      currentDays: 2,
      longestDays: 2,
      lastStudyDate: new Date("2026-08-02T00:00:00.000Z"),
    },
  });

  const [courses, subjects, modules, lessons, questions, answers, assessments, users] =
    await Promise.all([
      prisma.course.count(),
      prisma.subject.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.assessment.count(),
      prisma.user.count(),
    ]);

  console.log({ courses, subjects, modules, lessons, questions, answers, assessments, users });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
