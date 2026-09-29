import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { LiveClassPlayer } from "@/components/app/live-class-player";
import { Button } from "@/components/ui/button";
import { AM_LIVE_EVENT_URL, PM_LIVE_EVENT_URL } from "@/config/live";
import { useAuth } from "@/contexts/AuthContext";

const sessionMeta = {
  am: { title: "6:30am Club", embedUrl: AM_LIVE_EVENT_URL },
  pm: { title: "9:30am Club", embedUrl: PM_LIVE_EVENT_URL },
} as const;

type SessionKey = keyof typeof sessionMeta;

export const Route = createFileRoute("/live-classes/$session")({
  head: () => ({ meta: [
    { title: "Live session — YogaRox" },
    { name: "description", content: "Watch a YogaRox live session." },
    { property: "og:title", content: "Live session — YogaRox" },
    { property: "og:description", content: "Watch a YogaRox live session." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LiveSessionPage,
});

function LiveSessionPage() {
  const { session } = Route.useParams();
  const { hasAccess, isMembershipLoading, membership } = useAuth();
  const key: SessionKey = session === "pm" ? "pm" : "am";
  const { title, embedUrl } = sessionMeta[key];

  return (
    <AuthenticatedScreen>
      <AppShell title={title} eyebrow="Live class" backTo="/live-classes">
        {hasAccess ? (
          <>
            <LiveClassPlayer embedUrl={embedUrl} title={`YogaRox ${title} live session`} />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              If no session is currently broadcasting, the player will show the event's waiting state. You can watch fullscreen
              using the player's own controls.
            </p>
          </>
        ) : (
          <section className="mt-2 rounded-lg border border-border bg-card p-6 text-center" aria-label="Membership required">
            <Lock aria-hidden="true" className="mx-auto size-7 text-primary" strokeWidth={1.5} />
            <h2 className="mt-4 font-display text-2xl font-semibold">Membership required</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isMembershipLoading && !membership
                ? "Checking your membership…"
                : "An active YogaRox membership is needed to join live sessions."}
            </p>
            {!isMembershipLoading ? (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href="https://yogarox.uk/my-account/" target="_blank" rel="noreferrer">Manage membership</a>
              </Button>
            ) : null}
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/live-classes">Back to live classes</Link>
            </Button>
          </section>
        )}
      </AppShell>
    </AuthenticatedScreen>
  );
}
