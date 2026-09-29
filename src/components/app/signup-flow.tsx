import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth";
import { cn } from "@/lib/utils";
import { ApiError, byteLength, type RegistrationConfig, validateNewPassword } from "@/types/auth";

type Props = {
  onSignedIn: () => void;
  onNeedLogin: (email: string, notice: string) => void;
};

const inputClass =
  "h-13 w-full rounded-2xl border bg-field px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:bg-field-focus focus:ring-2 focus:ring-primary/15";

export function SignupFlow({ onSignedIn, onNeedLogin }: Props) {
  const { signIn } = useAuth();
  const [config, setConfig] = useState<RegistrationConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  // Held in memory only; never persisted.
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accepted, setAccepted] = useState(false);

  const loadConfig = useCallback(async () => {
    setConfigError("");
    try {
      setConfig(await authService.fetchRegistration());
    } catch (e) {
      setConfigError(e instanceof ApiError ? e.message : "Sign-up is unavailable right now.");
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleError = (e: unknown) => {
    const err = e instanceof ApiError ? e : null;
    const message = err?.message ?? "Something went wrong. Please try again.";
    switch (err?.code) {
      case "yogarox_invalid_email":
        setStep("email");
        setFieldErrors({ email: message });
        return;
      case "yogarox_password_policy":
        setFieldErrors({ password: message });
        return;
      case "yogarox_invalid_name":
        setFieldErrors({ name: message });
        return;
      case "yogarox_terms_required":
        setAccepted(false);
        void loadConfig();
        setError("Our terms have been updated. Please review them and accept again.");
        return;
      case "yogarox_account_exists":
        setError("An account with this email already exists. Please sign in or reset your password.");
        return;
      case "yogarox_registration_failed":
      case "yogarox_registration_unavailable":
      case "timeout":
        setError(`${message} Your account may already exist — try signing in before registering again.`);
        return;
      case "yogarox_registration_disabled":
        setConfig((c) => (c ? { ...c, enabled: false } : c));
        return;
      default:
        setError(message);
    }
  };

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = email.trim();
    setError("");
    setInfo("");
    setFieldErrors({});
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return setFieldErrors({ email: "Please enter a valid email address." });
    if (byteLength(trimmed) > 100) return setFieldErrors({ email: "That email address is too long." });
    setBusy(true);
    try {
      const result = await authService.requestRegistrationCode(trimmed);
      setEmail(trimmed);
      setInfo(result.message);
      setCooldown(result.resend_after ?? config?.resend_after ?? 60);
      setStep("verify");
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent) => {
    event.preventDefault();
    if (!config || busy) return;
    setError("");
    const errs: Record<string, string> = {};
    const len = config.code_length || 8;
    if (!new RegExp(`^\\d{${len}}$`).test(code)) errs["code"] = `Enter the ${len}-digit code from your email.`;
    const pw = validateNewPassword(password, config.password_min_bytes, config.password_max_bytes);
    if (pw) errs["password"] = pw;
    else if (password !== confirm) errs["confirm"] = "Passwords don't match.";
    if (byteLength(firstName) > 200 || byteLength(lastName) > 200) errs["name"] = "Names must be shorter.";
    if (!accepted) errs["terms"] = "Please accept the Terms and Privacy Policy to continue.";
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await authService.verifyRegistration({
        email,
        code,
        password,
        ...(firstName.trim() && { first_name: firstName.trim() }),
        ...(lastName.trim() && { last_name: lastName.trim() }),
        accept_terms: true,
        policy_version: config.policy_version,
      });
    } catch (e) {
      handleError(e);
      setBusy(false);
      return;
    }
    // Account exists now. Sign in once with the in-memory password, then clear it.
    const pwd = password;
    setPassword("");
    setConfirm("");
    setCode("");
    try {
      await signIn({ login: email, password: pwd });
      onSignedIn();
    } catch {
      onNeedLogin(email, "Account created. Please sign in.");
    } finally {
      setBusy(false);
    }
  };

  if (!config && !configError) {
    return (
      <div className="mt-10 flex justify-center text-muted-foreground" role="status">
        <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading sign-up</span>
      </div>
    );
  }

  if (configError || !config?.enabled) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        <div className="rounded-2xl bg-secondary/70 p-5 text-left">
          <p className="font-display text-xl font-semibold">Sign-up is unavailable</p>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            {configError || "New accounts can't be created in the app right now. Existing members can still sign in."}
          </p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={() => void loadConfig()}>
          Check again
        </Button>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form method="post" noValidate onSubmit={sendCode} className="mt-8 flex flex-col gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email address</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors["email"])}
            className={cn(inputClass, fieldErrors["email"] ? "border-destructive" : "border-transparent")}
          />
          <FieldError message={fieldErrors["email"]} />
        </label>
        <p className="text-sm leading-5 text-muted-foreground">
          We'll email you a verification code. Creating an account is free and doesn't include a membership.
        </p>
        <Notice message={error} tone="error" />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Sending…" : "Continue"}
        </Button>
      </form>
    );
  }

  return (
    <form method="post" noValidate onSubmit={verify} className="mt-8 flex flex-col gap-5">
      <div className="rounded-2xl bg-secondary/70 p-4 text-sm leading-5">
        <p>
          Code sent to <strong className="break-all">{email}</strong>{" "}
          <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setStep("email")}>
            Change
          </Button>
        </p>
        {info ? <p className="mt-2 text-muted-foreground">{info}</p> : null}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Verification code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          maxLength={config.code_length || 8}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder={"0".repeat(config.code_length || 8)}
          aria-invalid={Boolean(fieldErrors["code"])}
          className={cn(inputClass, "tracking-[0.3em]", fieldErrors["code"] ? "border-destructive" : "border-transparent")}
        />
        <FieldError message={fieldErrors["code"]} />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-1 h-auto px-0"
          disabled={cooldown > 0 || busy}
          onClick={() => void sendCode()}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">First name <span className="text-muted-foreground">(optional)</span></span>
          <input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(inputClass, "border-transparent")} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Last name <span className="text-muted-foreground">(optional)</span></span>
          <input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(inputClass, "border-transparent")} />
        </label>
      </div>
      <FieldError message={fieldErrors["name"]} />

      <PasswordInput label="Password" value={password} onChange={setPassword} shown={showPassword} onToggle={() => setShowPassword((s) => !s)} error={fieldErrors["password"]} hint={`At least ${config.password_min_bytes} characters.`} />
      <PasswordInput label="Confirm password" value={confirm} onChange={setConfirm} shown={showPassword} onToggle={() => setShowPassword((s) => !s)} error={fieldErrors["confirm"]} />

      <label className="flex items-start gap-3 text-sm leading-5">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 size-5 accent-primary" />
        <span>
          I agree to the{" "}
          <a href={config.terms_url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">Terms</a>{" "}
          and{" "}
          <a href={config.privacy_url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">Privacy Policy</a>.
        </span>
      </label>
      <FieldError message={fieldErrors["terms"]} />

      <Notice message={error} tone="error" />
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

function PasswordInput({ label, value, onChange, shown, onToggle, error, hint }: { label: string; value: string; onChange: (v: string) => void; shown: boolean; onToggle: () => void; error?: string | undefined; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <span className="relative block">
        <input
          type={shown ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(inputClass, "pr-14", error ? "border-destructive" : "border-transparent")}
        />
        <Button type="button" variant="ghost" size="icon" onClick={onToggle} aria-label={shown ? "Hide passwords" : "Show passwords"} className="absolute right-1 top-1 text-muted-foreground">
          {shown ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
        </Button>
      </span>
      {hint && !error ? <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span> : null}
      <FieldError message={error} />
    </label>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <span className="mt-1.5 block text-sm leading-5 text-destructive">{message}</span>;
}

export function Notice({ message, tone }: { message: string; tone: "info" | "error" }) {
  if (!message) return null;
  return (
    <p role="status" className={cn("flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-5", tone === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground")}>
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
