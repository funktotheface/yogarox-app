import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { FieldError, Notice } from "@/components/app/signup-flow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth";
import { ApiError, byteLength } from "@/types/auth";

export const Route = createFileRoute("/profile-personal-details")({
  head: () => ({
    meta: [
      { title: "My profile — YogaRox" },
      { name: "description", content: "Edit your YogaRox name and display name." },
      { property: "og:title", content: "My profile — YogaRox" },
      { property: "og:description", content: "Edit your YogaRox name and display name." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PersonalDetails,
});

const fieldClass =
  "mt-2 h-12 w-full rounded-lg border border-input bg-card px-4 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-ring/25 read-only:opacity-70";

function PersonalDetails() {
  return (
    <AuthenticatedScreen>
      <AppShell title="My profile" backTo="/profile">
        <ProfileForm />
      </AppShell>
    </AuthenticatedScreen>
  );
}

function ProfileForm() {
  const { user, getToken, setUser } = useAuth();
  const [first, setFirst] = useState(user?.first_name ?? "");
  const [last, setLast] = useState(user?.last_name ?? "");
  const [display, setDisplay] = useState(user?.display_name ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirst(user?.first_name ?? "");
    setLast(user?.last_name ?? "");
    setDisplay(user?.display_name ?? "");
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const errs: Record<string, string> = {};
    if (!display.trim()) errs["display"] = "Display name can't be blank.";
    for (const [key, value] of [["first", first], ["last", last], ["display", display]] as const) {
      if (byteLength(value) > 200) errs[key] = "That's too long.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      // Only send the three editable fields — never the whole user object.
      const result = await authService.updateProfile(token, {
        first_name: first.trim(),
        last_name: last.trim(),
        display_name: display.trim(),
      });
      setUser(result.user);
      setMessage("Your profile has been saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "We couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form method="post" noValidate className="space-y-5" onSubmit={submit}>
      <label className="block text-sm font-semibold">
        First name
        <input className={fieldClass} value={first} autoComplete="given-name" onChange={(e) => setFirst(e.target.value)} />
        <FieldError message={errors["first"]} />
      </label>
      <label className="block text-sm font-semibold">
        Last name
        <input className={fieldClass} value={last} autoComplete="family-name" onChange={(e) => setLast(e.target.value)} />
        <FieldError message={errors["last"]} />
      </label>
      <label className="block text-sm font-semibold">
        Display name
        <input className={fieldClass} value={display} autoComplete="nickname" onChange={(e) => setDisplay(e.target.value)} />
        <FieldError message={errors["display"]} />
      </label>
      <label className="block text-sm font-semibold">
        Email address
        <input className={fieldClass} value={user?.email ?? ""} readOnly aria-readonly="true" />
        <span className="mt-1.5 block text-xs font-normal text-muted-foreground">Your email can't be changed in the app.</span>
      </label>
      <Notice message={message} tone="info" />
      <Notice message={error} tone="error" />
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
