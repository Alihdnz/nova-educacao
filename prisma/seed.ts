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
      title: "Economia",
      description: "Curso introdutório de Economia.",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      title: "Economia",
      slug: "economia",
      description: "Curso introdutório de Economia.",
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

  await prisma.answer.upsert({
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

  await prisma.answer.upsert({
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

  await prisma.assessment.upsert({
    where: { slug: "revisao-de-conceitos-economicos" },
    update: {
      description: "Avaliação em preparação para revisar os conceitos da aula.",
      lessonId: economyLesson.id,
      maxScore: 10,
      status: ContentStatus.DRAFT,
      timeLimitMinutes: null,
      title: "Revisão de conceitos econômicos",
    },
    create: {
      description: "Avaliação em preparação para revisar os conceitos da aula.",
      lessonId: economyLesson.id,
      maxScore: 10,
      slug: "revisao-de-conceitos-economicos",
      status: ContentStatus.DRAFT,
      timeLimitMinutes: null,
      title: "Revisão de conceitos econômicos",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "aluno@example.com" },
    update: { name: "Aluno Exemplo", role: UserRole.STUDENT },
    create: {
      name: "Aluno Exemplo",
      email: "aluno@example.com",
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
    update: { status: EnrollmentStatus.ACTIVE },
    create: {
      userId: student.id,
      courseId: course.id,
      status: EnrollmentStatus.ACTIVE,
    },
  });

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
      status: AttemptStatus.SUBMITTED,
      score: 10,
      submittedAt: new Date("2026-08-01T12:45:00.000Z"),
    },
    create: {
      enrollmentId: enrollment.id,
      assessmentId: assessment.id,
      attemptNumber: 1,
      status: AttemptStatus.SUBMITTED,
      score: 10,
      startedAt: new Date("2026-08-01T12:35:00.000Z"),
      submittedAt: new Date("2026-08-01T12:45:00.000Z"),
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
