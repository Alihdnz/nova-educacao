export const TERMS_VERSION = "2026-08-15";
export const PRIVACY_VERSION = "2026-08-15";

export const GENDER_OPTIONS = [
  { value: "FEMALE", label: "Feminino" },
  { value: "MALE", label: "Masculino" },
  { value: "NON_BINARY", label: "Não binário" },
  { value: "OTHER", label: "Outro" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiro não informar" },
] as const;

export type RegistrationField =
  | "firstName"
  | "lastName"
  | "email"
  | "cpf"
  | "rg"
  | "gender"
  | "birthDate"
  | "password"
  | "passwordConfirmation"
  | "termsAccepted"
  | "privacyAccepted";

export type RegistrationFieldErrors = Partial<Record<RegistrationField, string>>;

export type StudentRegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  rg: string;
  gender: string;
  birthDate: string;
  password: string;
  passwordConfirmation: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

export type ValidStudentRegistration = Omit<
  StudentRegistrationInput,
  "birthDate" | "passwordConfirmation" | "termsAccepted" | "privacyAccepted"
> & {
  birthDate: Date;
  name: string;
};

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function formatCpf(value: string) {
  const digits = normalizeDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function isValidCpf(value: string) {
  const cpf = normalizeDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

export function parseBirthDate(value: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;

  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return date <= todayUtc ? date : null;
}

export function calculateAge(birthDate: Date, today = new Date()) {
  let age = today.getFullYear() - birthDate.getUTCFullYear();
  const monthDifference = today.getMonth() - birthDate.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameLetterPattern = /[A-Za-zÀ-ÖØ-öø-ÿ]/;
const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const rgPattern = /^[A-Za-z0-9.\/-]{5,20}$/;

export function validateStudentRegistration(
  input: StudentRegistrationInput,
): { data?: ValidStudentRegistration; errors: RegistrationFieldErrors } {
  const errors: RegistrationFieldErrors = {};
  const firstName = normalizeName(input.firstName);
  const lastName = normalizeName(input.lastName);
  const email = normalizeEmail(input.email);
  const cpf = normalizeDigits(input.cpf);
  const rg = input.rg.trim().replace(/\s+/g, "");
  const birthDate = parseBirthDate(input.birthDate);
  const acceptedGenders = new Set<string>(GENDER_OPTIONS.map((option) => option.value));

  if (firstName.length < 2 || firstName.length > 80 || !nameLetterPattern.test(firstName) || !namePattern.test(firstName)) {
    errors.firstName = "Informe um nome válido.";
  }
  if (lastName.length < 2 || lastName.length > 120 || !nameLetterPattern.test(lastName) || !namePattern.test(lastName)) {
    errors.lastName = "Informe um sobrenome válido.";
  }
  if (email.length > 320 || !emailPattern.test(email)) errors.email = "Informe um e-mail válido.";
  if (!isValidCpf(cpf)) errors.cpf = "Informe um CPF válido.";
  if (!rgPattern.test(rg)) errors.rg = "Informe um RG válido, com 5 a 20 caracteres.";
  if (!acceptedGenders.has(input.gender)) errors.gender = "Selecione uma opção válida.";
  if (!birthDate) errors.birthDate = "Informe uma data de nascimento válida e não futura.";
  if (input.password.length < 8) errors.password = "Use pelo menos 8 caracteres.";
  if (input.password.length > 128) errors.password = "Use no máximo 128 caracteres.";
  if (input.passwordConfirmation !== input.password) errors.passwordConfirmation = "As senhas não coincidem.";
  if (!input.termsAccepted) errors.termsAccepted = "Você precisa aceitar os Termos de Uso.";
  if (!input.privacyAccepted) errors.privacyAccepted = "Você precisa aceitar a Política de Privacidade.";

  if (Object.keys(errors).length > 0 || !birthDate) return { errors };

  return {
    errors,
    data: {
      birthDate,
      cpf,
      email,
      firstName,
      gender: input.gender,
      lastName,
      name: `${firstName} ${lastName}`,
      password: input.password,
      rg,
    },
  };
}
