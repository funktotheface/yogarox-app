import { createFileRoute, Link } from "@tanstack/react-router";
import { MoonStar, Sunrise } from "lucide-react";

import { AppShell, AuthenticatedScreen, DeveloperNote } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/live-classes/")({
  head: () => ({ meta: [
    { title: "Live classes — YogaRox" },
    { name: "description", content: "Join the YogaRox 6:30am Club and 9:30am Club live sessions." },
    { property: "og:title", content: "Live classes — YogaRox" },
    { property: "og:description", content: "Join the YogaRox 6:30am Club and 9:30am Club live sessions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LiveClassesPage,
});

const sessions = [
  { session: "am" as const, label: "6:30am Club", description: "The recurring 6:30am live YogaRox session", icon: Sunrise },
  { session: "pm" as const, label: "9:30am Club", description: "The recurring 9:30am live YogaRox session", icon: MoonStar },
];

function LiveClassesPage() {
  return (
    <AuthenticatedScreen>
      <AppShell title="Live classes" eyebrow="Practise together" backTo="/home">
        <p className="text-sm leading-6 text-muted-foreground">
          Join the recurring live streams. Vimeo shows whether a session is currently broadcasting.
        </p>
        <div className="mt-6 grid gap-4">
          {sessions.map(({ session, label, description, icon: Icon }) => (
            <article key={session} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <Icon aria-hidden="true" className="size-7 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-2xl font-semibold">{label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <Button asChild className="mt-5 w-full">
                <Link to="/live-classes/$session" params={{ session }}>View live session</Link>
              </Button>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <DeveloperNote>
            LIVE STREAM NOTE: Each session opens the permanent YogaRox Vimeo recurring-event embed configured in src/config/live.ts.
            There is intentionally no timetable or live/offline detection — Vimeo owns the event state. Access is gated by the existing
            membership check on the session screen.
          </DeveloperNote>
        </div>
      </AppShell>
    </AuthenticatedScreen>
  );
}
