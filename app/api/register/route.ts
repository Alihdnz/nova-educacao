import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type RegistrationFieldErrors,
  type StudentRegistrationInput,
  validateStudentRegistration,
} from "@/lib/student-registration";

function readInput(value: unknown): StudentRegistrationInput | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  return {
    birthDate: typeof body.birthDate === "string" ? body.birthDate : "",
    cpf: typeof body.cpf === "string" ? body.cpf : "",
    email: typeof body.email === "string" ? body.email : "",
    firstName: typeof body.firstName === "string" ? body.firstName : "",
    gender: typeof body.gender === "string" ? body.gender : "",
    lastName: typeof body.lastName === "string" ? body.lastName : "",
    password: typeof body.password === "string" ? body.password : "",
    passwordConfirmation: typeof body.passwordConfirmation === "string" ? body.passwordConfirmation : "",
    privacyAccepted: body.privacyAccepted === true,
    rg: typeof body.rg === "string" ? body.rg : "",
    termsAccepted: body.termsAccepted === true,
  };
}

export async function POST(request: Request) {
  let input: StudentRegistrationInput | null = null;
  try {
    input = readInput(await request.json());
  } catch {
    return NextResponse.json({ message: "Não foi possível ler os dados enviados." }, { status: 400 });
  }

  if (!input) return NextResponse.json({ message: "Dados de cadastro inválidos." }, { status: 400 });

  const result = validateStudentRegistration(input);
  if (!result.data) {
    return NextResponse.json({ errors: result.errors, message: "Revise os campos destacados." }, { status: 400 });
  }

  const [emailOwner, cpfOwner] = await Promise.all([
    prisma.user.findFirst({
      select: { id: true },
      where: { email: { equals: result.data.email, mode: "insensitive" } },
    }),
    prisma.user.findUnique({ select: { id: true }, where: { cpf: result.data.cpf } }),
  ]);
  const duplicateErrors: RegistrationFieldErrors = {};
  if (emailOwner) duplicateErrors.email = "Este e-mail já está cadastrado.";
  if (cpfOwner) duplicateErrors.cpf = "Este CPF já está cadastrado.";
  if (Object.keys(duplicateErrors).length > 0) {
    return NextResponse.json({ errors: duplicateErrors, message: "Não foi possível concluir o cadastro." }, { status: 409 });
  }

  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  if (!headers.has("origin")) headers.set("origin", new URL(request.url).origin);

  const authResponse = await auth.handler(new Request(new URL("/api/auth/sign-up/email", request.url), {
    body: JSON.stringify({
      ...result.data,
      birthDate: input.birthDate,
      passwordConfirmation: input.passwordConfirmation,
      privacyAccepted: true,
      termsAccepted: true,
    }),
    headers,
    method: "POST",
  }));

  if (!authResponse.ok) {
    return NextResponse.json(
      { message: "Não foi possível concluir o cadastro. Verifique os dados ou tente novamente." },
      { status: authResponse.status >= 500 ? 500 : 409 },
    );
  }

  const responseHeaders = new Headers(authResponse.headers);
  responseHeaders.delete("content-length");
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify({ redirectTo: "/student", success: true }), {
    headers: responseHeaders,
    status: 201,
  });
}
