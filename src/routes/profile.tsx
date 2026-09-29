import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { AppShell, AuthenticatedScreen, MenuRow } from "@/components/app/app-shell";
import { Notice } from "@/components/app/signup-flow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/types/auth";
import { formatDue } from "@/lib/format-date";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile and account — YogaRox" },
      { name: "description", content: "Your YogaRox profile and account options." },
      { property: "og:title", content: "Profile and account — YogaRox" },
      { property: "og:description", content: "Your YogaRox profile and account options." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, membership, membershipError, hasAccess, signOut, signOutAll, refreshMembership } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState<"" | "one" | "all">("");
  const [error, setError] = useState("");
  const name = user?.display_name || user?.first_name || "Member";
  const deletion = user?.deletion;

  async function handleLogout() {
    setLeaving("one");
    await signOut();
    void navigate({ to: "/", replace: true });
  }

  async function handleLogoutAll() {
    setLeaving("all");
    setError("");
    try {
      await signOutAll();
      void navigate({ to: "/", replace: true });
    } catch (e) {
      setError(
        `We couldn't sign you out of all devices. ${e instanceof ApiError ? e.message : ""}`.trim(),
      );
      setLeaving("");
    }
  }

  const status = membership
    ? hasAccess
      ? "Membership active"
      : "No active membership"
    : membershipError
      ? "Membership status unavailable"
      : "Checking membership…";

  return (
    <AuthenticatedScreen>
      <AppShell>
        <header>
          <p className="text-xs font-bold uppercase text-primary">Your account</p>
          <h1 className="mt-2 font-display text-[2.5rem] font-semibold leading-none">Profile</h1>
        </header>

        {deletion?.status === "requested" ? (
          <div className="mt-6 rounded-lg bg-destructive/10 p-4 text-sm leading-5 text-destructive" role="status">
            Account deletion requested — it will be completed by {formatDue(deletion.due_at)}. You can keep using
            YogaRox until then.
          </div>
        ) : null}

        <section className="mt-7 flex items-center gap-4 rounded-lg bg-secondary/70 p-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-7" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold">{name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{status}</p>
            {membershipError && !membership ? (
              <Button variant="link" size="sm" className="h-auto px-0 text-xs" onClick={() => void refreshMembership()}>
                Try again
              </Button>
            ) : null}
          </div>
        </section>

        <section className="mt-7" aria-label="Account menu">
          <MenuRow to="/profile-personal-details" label="My profile" />
          <MenuRow to="/profile-password" label="Change password" />
          <MenuRow to="/profile-notifications" label="Notifications" />
          <MenuRow to="/profile-payment-details" label="Payment details" />
          <MenuRow to="/profile-privacy" label="Privacy & terms" />
          <MenuRow to="/profile-delete-account" label="Delete account" />
        </section>

        <div className="mt-7 space-y-3">
          <Notice message={error} tone="error" />
          <Button type="button" variant="outline" className="w-full" onClick={handleLogout} disabled={Boolean(leaving)}>
            <LogOut aria-hidden="true" className="size-4" />
            {leaving === "one" ? "Logging out…" : "Log out"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={handleLogoutAll} disabled={Boolean(leaving)}>
            {leaving === "all" ? "Signing out everywhere…" : "Log out of all app devices"}
          </Button>
        </div>
      </AppShell>
    </AuthenticatedScreen>
  );
}
