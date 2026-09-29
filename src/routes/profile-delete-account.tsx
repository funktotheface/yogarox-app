import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { FieldError, Notice } from "@/components/app/signup-flow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import * as authService from "@/services/auth";
import { ApiError, type DeletionStatus } from "@/types/auth";
import { formatDue } from "@/lib/format-date";

export const Route = createFileRoute("/profile-delete-account")({
  head: () => ({
    meta: [
      { title: "Delete account — YogaRox" },
      { name: "description", content: "Request permanent deletion of your YogaRox account." },
      { property: "og:title", content: "Delete account — YogaRox" },
      { property: "og:description", content: "Request permanent deletion of your YogaRox account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const [done, setDone] = useState<DeletionStatus | null>(null);
  if (done) return <Requested status={done} />;
  // Not membership-gated: every signed-in member can request deletion.
  return (
    <AuthenticatedScreen>
      <AppShell title="Delete account" backTo="/profile">
        <DeleteForm onDone={setDone} />
      </AppShell>
    </AuthenticatedScreen>
  );
}

function Requested({ status }: { status: DeletionStatus }) {
  return (
    <main className="yogarox-app mx-auto flex min-h-dvh max-w-[430px] flex-col justify-center bg-background px-6 text-foreground">
      <h1 className="font-display text-4xl font-semibold">Deletion requested</h1>
      <p className="mt-4 text-sm leading-6">
        Your account has <strong>not</strong> been deleted yet. Our team will complete your request by{" "}
        <strong>{formatDue(status.due_at)}</strong> and email you when it's done.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Request reference: #{status.request_id}</p>
      <p className="mt-3 text-sm text-muted-foreground">You've been signed out on this device.</p>
      <Link to="/" className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
        Back to sign in
      </Link>
    </main>
  );
}

function DeleteForm({ onDone }: { onDone: (s: DeletionStatus) => void }) {
  const { getToken, endSession } = useAuth();
  const [status, setStatus] = useState<DeletionStatus | null>(null);
  const [loadError, setLoadError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadError("");
    try {
      setStatus(await authService.fetchDeletion(token));
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "We couldn't load the deletion policy.");
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    const errs: Record<string, string> = {};
    if (!password) errs["password"] = "Please enter your current password.";
    if (!confirmed) errs["confirm"] = "Please confirm you understand.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const token = getToken();
    if (!token) return;
    setBusy(true);
    try {
      const result = await authService.requestDeletion(token, password);
      setPassword("");
      endSession();
      onDone(result);
    } catch (e) {
      const err = e instanceof ApiError ? e : null;
      if (err?.code === "yogarox_reauth_failed") setErrors({ password: "That password isn't right." });
      else if (err?.code === "timeout" || err?.code === "yogarox_request_busy" || err?.code === "yogarox_invalid_deletion_response") {
        setError(`${err.message} Checking the current status…`);
        await load();
      } else setError(err?.message ?? "We couldn't send your request.");
      setBusy(false);
    }
  };

  if (!status && !loadError) {
    return (
      <div className="flex justify-center py-10" role="status">
        <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  if (!status) {
    return (
      <div className="space-y-4">
        <Notice message={loadError} tone="error" />
        <Button variant="outline" className="w-full" onClick={() => void load()}>Try again</Button>
      </div>
    );
  }

  if (status.status === "requested") {
    return (
      <div className="rounded-lg bg-secondary/70 p-5 text-sm leading-6">
        <p className="font-display text-xl font-semibold">Deletion already requested</p>
        <p className="mt-2">
          Your request (#{status.request_id}) will be completed by <strong>{formatDue(status.due_at)}</strong>. You can keep
          using your account until then. We'll email you when it's done.
        </p>
      </div>
    );
  }

  return (
    <form method="post" noValidate onSubmit={submit} className="space-y-5">
      <div className="space-y-3 rounded-lg bg-destructive/5 p-5 text-sm leading-6">
        <p>
          This permanently deletes your YogaRox account for both the app and website. You will lose access to your account
          and membership content.
        </p>
        <p>
          Our team will process the request within {status.processing_days} calendar days and email you when complete.
        </p>
        <p>
          Every website subscription on this account will be cancelled during processing; no refund is issued automatically.
          Records we must keep by law may be retained.
        </p>
      </div>
      <label className="block text-sm font-semibold">
        Current password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 h-12 w-full rounded-lg border border-input bg-card px-4 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
        <FieldError message={errors["password"]} />
      </label>
      <label className="flex items-start gap-3 text-sm leading-5">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-5 accent-destructive" />
        <span>I understand my account and subscriptions will be permanently deleted.</span>
      </label>
      <FieldError message={errors["confirm"]} />
      <Notice message={error} tone="error" />
      <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={busy}>
        {busy ? "Sending request…" : "Request account deletion"}
      </Button>
      <Link to="/profile" className="block text-center text-sm font-semibold text-primary">
        Cancel
      </Link>
    </form>
  );
}
