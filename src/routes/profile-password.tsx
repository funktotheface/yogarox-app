import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { FieldError, Notice } from "@/components/app/signup-flow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth";
import { ApiError, validateNewPassword } from "@/types/auth";

export const Route = createFileRoute("/profile-password")({
  head: () => ({
    meta: [
      { title: "Change password — YogaRox" },
      { name: "description", content: "Change your YogaRox account password." },
      { property: "og:title", content: "Change password — YogaRox" },
      { property: "og:description", content: "Change your YogaRox account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PasswordPage,
});

const fieldClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-card px-4 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-ring/25";

function PasswordPage() {
  return (
    <AuthenticatedScreen>
      <AppShell title="Change password" backTo="/profile">
        <PasswordForm />
      </AppShell>
    </AuthenticatedScreen>
  );
}

function PasswordForm() {
  const { getToken, endSession } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    const errs: Record<string, string> = {};
    if (!current) errs["current"] = "Please enter your current password.";
    const policy = validateNewPassword(next);
    if (policy) errs["next"] = policy;
    else if (next !== confirm) errs["confirm"] = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await authService.changePassword(token, { current_password: current, new_password: next });
      endSession("Password changed. Please sign in again.");
      void navigate({ to: "/", replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.code === "yogarox_reauth_failed") {
        setErrors({ current: "That current password isn't right." });
      } else if (e instanceof ApiError && e.code === "yogarox_password_policy") {
        setErrors({ next: e.message });
      } else {
        // Never auto-retry a password change; the outcome may be unknown.
        setError(e instanceof ApiError ? e.message : "We couldn't change your password.");
      }
      setSaving(false);
    }
  };

  return (
    <form method="post" noValidate className="space-y-5" onSubmit={submit}>
      <label className="block text-sm font-semibold">
        Current password
        <input type="password" autoComplete="current-password" className={fieldClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
        <FieldError message={errors["current"]} />
      </label>
      <label className="block text-sm font-semibold">
        New password
        <input type="password" autoComplete="new-password" className={fieldClass} value={next} onChange={(e) => setNext(e.target.value)} />
        {errors["next"] ? <FieldError message={errors["next"]} /> : <span className="mt-1.5 block text-xs font-normal text-muted-foreground">12–128 characters, no spaces at the start or end.</span>}
      </label>
      <label className="block text-sm font-semibold">
        Confirm new password
        <input type="password" autoComplete="new-password" className={fieldClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <FieldError message={errors["confirm"]} />
      </label>
      <p className="text-xs leading-5 text-muted-foreground">You'll be signed out of the app and website everywhere and asked to sign in again.</p>
      <Notice message={error} tone="error" />
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
