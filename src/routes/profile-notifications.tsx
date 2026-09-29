import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AuthenticatedScreen, DeveloperNote } from "@/components/app/app-shell";
import { Switch } from "@/components/ui/switch";
export const Route = createFileRoute("/profile-notifications")({ head: () => ({ meta: [
  { title: "Notification preferences — YogaRox" }, { name: "description", content: "YogaRox notification preference frontend." },
  { property: "og:title", content: "Notification preferences — YogaRox" }, { property: "og:description", content: "YogaRox notification preference frontend." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: NotificationsPage });
const rows = ["NOTIFICATION TYPE GOES HERE", "CLASS REMINDER TYPE GOES HERE", "MEMBER UPDATE TYPE GOES HERE"];
function NotificationsPage() { return <AuthenticatedScreen><AppShell title="Notifications" backTo="/profile"><p className="text-sm leading-6 text-muted-foreground">These controls demonstrate preference placement only. Changes are not saved.</p><section className="mt-6 rounded-lg border border-border bg-card px-4">{rows.map((row, index) => <div key={row} className="flex min-h-16 items-center justify-between gap-4 border-b border-border last:border-0"><label htmlFor={`notice-${index}`} className="text-xs font-bold uppercase">{row}</label><Switch id={`notice-${index}`} aria-label={row} /></div>)}</section><div className="mt-5"><DeveloperNote>NOTIFICATIONS TODO: Connect notification preferences and device push registration once the notification architecture is agreed.</DeveloperNote></div></AppShell></AuthenticatedScreen>; }
