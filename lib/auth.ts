import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";

import { prisma } from "@/lib/prisma";
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
  validateStudentRegistration,
} from "@/lib/student-registration";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is not configured.");
}

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is not configured.");
}

export const auth = betterAuth({
  appName: "Nova Educacao",
  baseURL,
  secret,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return;

      const result = validateStudentRegistration({
        birthDate: String(context.body.birthDate ?? ""),
        cpf: String(context.body.cpf ?? ""),
        email: String(context.body.email ?? ""),
        firstName: String(context.body.firstName ?? ""),
        gender: String(context.body.gender ?? ""),
        lastName: String(context.body.lastName ?? ""),
        password: String(context.body.password ?? ""),
        passwordConfirmation: String(context.body.passwordConfirmation ?? ""),
        privacyAccepted: context.body.privacyAccepted === true,
        rg: String(context.body.rg ?? ""),
        termsAccepted: context.body.termsAccepted === true,
      });

      if (!result.data) {
        throw APIError.from("BAD_REQUEST", {
          code: "INVALID_STUDENT_REGISTRATION",
          message: "Dados de cadastro inválidos.",
        });
      }

      const acceptedAt = new Date();
      Object.assign(context.body, {
        birthDate: result.data.birthDate,
        cpf: result.data.cpf,
        email: result.data.email,
        firstName: result.data.firstName,
        gender: result.data.gender,
        lastName: result.data.lastName,
        name: result.data.name,
        privacyAcceptedAt: acceptedAt,
        privacyAcceptedVersion: PRIVACY_VERSION,
        rg: result.data.rg,
        termsAcceptedAt: acceptedAt,
        termsAcceptedVersion: TERMS_VERSION,
      });
    }),
  },
  user: {
    additionalFields: {
      role: {
        type: ["STUDENT", "ADMIN", "COURSE_MANAGER"],
        required: true,
        defaultValue: "STUDENT",
        input: false,
      },
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      cpf: { type: "string", required: true, returned: false },
      rg: { type: "string", required: true, returned: false },
      gender: { type: "string", required: true, returned: false },
      birthDate: { type: "date", required: true, returned: false },
      termsAcceptedAt: { type: "date", required: true, returned: false },
      termsAcceptedVersion: { type: "string", required: true, returned: false },
      privacyAcceptedAt: { type: "date", required: true, returned: false },
      privacyAcceptedVersion: { type: "string", required: true, returned: false },
    },
  },
});
