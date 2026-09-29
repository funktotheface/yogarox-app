import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";

export const Route = createFileRoute("/forum")({
  head: () => ({ meta: [
    { title: "Forum coming soon — YogaRox" },
    { name: "description", content: "The future YogaRox member community." },
    { property: "og:title", content: "Forum coming soon — YogaRox" },
    { property: "og:description", content: "The future YogaRox member community." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ForumPage,
});
function ForumPage() { return <AuthenticatedScreen><AppShell><section className="flex min-h-[68dvh] flex-col items-center justify-center text-center"><div className="flex size-20 items-center justify-center rounded-full bg-accent text-primary"><MessageCircle aria-hidden="true" className="size-9" strokeWidth={1.5} /></div><p className="mt-6 text-xs font-bold uppercase text-primary">Member community</p><h1 className="mt-2 font-display text-[2.5rem] font-semibold leading-none">Forum coming soon</h1><p className="mt-4 max-w-72 text-sm leading-6 text-muted-foreground">The YogaRox member community will be available here in a future update.</p></section></AppShell></AuthenticatedScreen>; }
