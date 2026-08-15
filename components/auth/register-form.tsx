"use client";

import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCpf,
  GENDER_OPTIONS,
  type RegistrationField,
  type RegistrationFieldErrors,
} from "@/lib/student-registration";

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-300" id={id}>{message}</p> : null;
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function clearError(field: RegistrationField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setErrors({});
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      birthDate: String(form.get("birthDate") ?? ""),
      cpf: String(form.get("cpf") ?? ""),
      email: String(form.get("email") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      gender: String(form.get("gender") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      password: String(form.get("password") ?? ""),
      passwordConfirmation: String(form.get("passwordConfirmation") ?? ""),
      privacyAccepted: form.get("privacyAccepted") === "on",
      rg: String(form.get("rg") ?? ""),
      termsAccepted: form.get("termsAccepted") === "on",
    };

    try {
      const response = await fetch("/api/register", {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = await response.json() as {
        errors?: RegistrationFieldErrors;
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "Não foi possível concluir o cadastro.");
        return;
      }

      router.replace(data.redirectTo ?? "/student");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const inputClass = "border-white/15 bg-white/6 text-white placeholder:text-white/35 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-white/80";

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">Nome</label>
          <Input aria-describedby="firstName-error" aria-invalid={Boolean(errors.firstName)} autoComplete="given-name" className={inputClass} id="firstName" maxLength={80} name="firstName" onChange={() => clearError("firstName")} placeholder="Seu nome" required />
          <FieldError id="firstName-error" message={errors.firstName} />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">Sobrenome</label>
          <Input aria-describedby="lastName-error" aria-invalid={Boolean(errors.lastName)} autoComplete="family-name" className={inputClass} id="lastName" maxLength={120} name="lastName" onChange={() => clearError("lastName")} placeholder="Seu sobrenome" required />
          <FieldError id="lastName-error" message={errors.lastName} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">E-mail</label>
        <Input aria-describedby="email-error" aria-invalid={Boolean(errors.email)} autoCapitalize="none" autoComplete="email" className={inputClass} id="email" name="email" onChange={() => clearError("email")} placeholder="voce@exemplo.com" required type="email" />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cpf">CPF</label>
          <Input aria-describedby="cpf-error" aria-invalid={Boolean(errors.cpf)} className={inputClass} id="cpf" inputMode="numeric" maxLength={14} name="cpf" onChange={(event) => { event.currentTarget.value = formatCpf(event.currentTarget.value); clearError("cpf"); }} placeholder="000.000.000-00" required />
          <FieldError id="cpf-error" message={errors.cpf} />
        </div>
        <div>
          <label className={labelClass} htmlFor="rg">RG</label>
          <Input aria-describedby="rg-error" aria-invalid={Boolean(errors.rg)} className={inputClass} id="rg" maxLength={20} name="rg" onChange={() => clearError("rg")} placeholder="00.000.000-0" required />
          <FieldError id="rg-error" message={errors.rg} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="gender">Gênero</label>
          <select aria-describedby="gender-error" aria-invalid={Boolean(errors.gender)} className={`${inputClass} h-10 w-full rounded-md border px-3 text-sm outline-none`} defaultValue="" id="gender" name="gender" onChange={() => clearError("gender")} required>
            <option className="bg-[#070d24]" disabled value="">Selecione</option>
            {GENDER_OPTIONS.map((option) => <option className="bg-[#070d24]" key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError id="gender-error" message={errors.gender} />
        </div>
        <div>
          <label className={labelClass} htmlFor="birthDate">Data de nascimento</label>
          <Input aria-describedby="birthDate-error" aria-invalid={Boolean(errors.birthDate)} autoComplete="bday" className={`${inputClass} [color-scheme:dark]`} id="birthDate" max={new Date().toISOString().slice(0, 10)} name="birthDate" onChange={() => clearError("birthDate")} required type="date" />
          <FieldError id="birthDate-error" message={errors.birthDate} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="password">Senha</label>
          <div className="relative">
            <Input aria-describedby="password-error" aria-invalid={Boolean(errors.password)} autoComplete="new-password" className={`${inputClass} pr-11`} id="password" maxLength={128} minLength={8} name="password" onChange={() => clearError("password")} required type={showPassword ? "text" : "password"} />
            <button aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="nova-focus absolute inset-y-0 right-0 grid w-10 place-items-center rounded-md text-white/55 hover:text-white" onClick={() => setShowPassword((current) => !current)} type="button">{showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}</button>
          </div>
          <FieldError id="password-error" message={errors.password} />
        </div>
        <div>
          <label className={labelClass} htmlFor="passwordConfirmation">Confirmar senha</label>
          <Input aria-describedby="passwordConfirmation-error" aria-invalid={Boolean(errors.passwordConfirmation)} autoComplete="new-password" className={inputClass} id="passwordConfirmation" maxLength={128} name="passwordConfirmation" onChange={() => clearError("passwordConfirmation")} required type={showPassword ? "text" : "password"} />
          <FieldError id="passwordConfirmation-error" message={errors.passwordConfirmation} />
        </div>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-5 text-sm text-white/70">
        <label className="flex items-start gap-3">
          <input aria-describedby="termsAccepted-error" aria-invalid={Boolean(errors.termsAccepted)} className="mt-0.5 size-4 accent-cyan-400" name="termsAccepted" onChange={() => clearError("termsAccepted")} type="checkbox" />
          <span>Li e aceito os <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/terms" target="_blank">Termos de Uso</Link>.</span>
        </label>
        <FieldError id="termsAccepted-error" message={errors.termsAccepted} />
        <label className="flex items-start gap-3">
          <input aria-describedby="privacyAccepted-error" aria-invalid={Boolean(errors.privacyAccepted)} className="mt-0.5 size-4 accent-cyan-400" name="privacyAccepted" onChange={() => clearError("privacyAccepted")} type="checkbox" />
          <span>Li e aceito a <Link className="text-cyan-300 underline-offset-4 hover:underline" href="/privacy" target="_blank">Política de Privacidade</Link>.</span>
        </label>
        <FieldError id="privacyAccepted-error" message={errors.privacyAccepted} />
      </div>

      {message ? <p aria-live="polite" className="rounded-md border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{message}</p> : null}

      <Button className="h-11 bg-[linear-gradient(90deg,#08d8ea,#6d37f4)] text-white shadow-[0_12px_30px_rgb(52_111_241/25%)] hover:opacity-90" disabled={pending} type="submit">
        {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <ArrowRight aria-hidden="true" />}
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
