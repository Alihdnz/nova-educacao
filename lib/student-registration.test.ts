import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateAge,
  formatCpf,
  isValidCpf,
  validateStudentRegistration,
} from "./student-registration";

test("validates and normalizes a Brazilian student registration", () => {
  const result = validateStudentRegistration({
    birthDate: "2000-02-29",
    cpf: "529.982.247-25",
    email: " ANA@EXAMPLE.COM ",
    firstName: " Ana  Júlia ",
    gender: "FEMALE",
    lastName: " D'Ávila ",
    password: "senha-segura",
    passwordConfirmation: "senha-segura",
    privacyAccepted: true,
    rg: "12.345.678-9",
    termsAccepted: true,
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.data?.cpf, "52998224725");
  assert.equal(result.data?.email, "ana@example.com");
  assert.equal(result.data?.name, "Ana Júlia D'Ávila");
});

test("rejects invalid CPF, future date, mismatched password and missing consent", () => {
  const result = validateStudentRegistration({
    birthDate: "2999-01-01",
    cpf: "111.111.111-11",
    email: "invalido",
    firstName: "123",
    gender: "UNKNOWN",
    lastName: "456",
    password: "12345678",
    passwordConfirmation: "87654321",
    privacyAccepted: false,
    rg: "1",
    termsAccepted: false,
  });

  assert.ok(result.errors.cpf);
  assert.ok(result.errors.birthDate);
  assert.ok(result.errors.passwordConfirmation);
  assert.ok(result.errors.termsAccepted);
  assert.ok(result.errors.privacyAccepted);
});

test("formats CPF and derives age without persisting it", () => {
  assert.equal(formatCpf("52998224725"), "529.982.247-25");
  assert.equal(isValidCpf("52998224725"), true);
  assert.equal(calculateAge(new Date("2000-08-16T00:00:00.000Z"), new Date("2026-08-15T12:00:00.000Z")), 25);
});
