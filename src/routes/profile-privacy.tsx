import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell, AuthenticatedScreen, DeveloperNote } from "@/components/app/app-shell";
export const Route = createFileRoute("/profile-privacy")({ head: () => ({ meta: [
  { title: "Privacy and terms — YogaRox" }, { name: "description", content: "YogaRox privacy and terms placeholder." },
  { property: "og:title", content: "Privacy and terms — YogaRox" }, { property: "og:description", content: "YogaRox privacy and terms placeholder." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: PrivacyPage });
function PrivacyPage() { return <AuthenticatedScreen><AppShell title="Privacy & terms" backTo="/profile"><div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary"><FileText aria-hidden="true" className="size-6" /></div><section className="mt-6 space-y-4"><div className="rounded-lg border border-border bg-card p-4"><h2 className="font-display text-xl font-semibold">PRIVACY NOTICE GOES HERE</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Approved privacy content and its effective date will appear here.</p></div><div className="rounded-lg border border-border bg-card p-4"><h2 className="font-display text-xl font-semibold">TERMS GO HERE</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Approved member and app terms will appear here.</p></div></section><div className="mt-5"><DeveloperNote>LEGAL CONTENT TODO: Replace these structural placeholders only with approved YogaRox privacy and terms content.</DeveloperNote></div></AppShell></AuthenticatedScreen>; }
