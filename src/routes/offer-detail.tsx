import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AuthenticatedScreen, DeveloperNote, IntegrationPlaceholder } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/offer-detail")({ head: () => ({ meta: [
  { title: "Offer details — YogaRox" }, { name: "description", content: "YogaRox member offer placeholder details." },
  { property: "og:title", content: "Offer details — YogaRox" }, { property: "og:description", content: "YogaRox member offer placeholder details." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: OfferDetail });
function OfferDetail() { return <AuthenticatedScreen><AppShell title="Offer details" backTo="/offers"><IntegrationPlaceholder label="PARTNER OFFER IMAGE GOES HERE" /><p className="mt-6 text-xs font-bold uppercase text-primary">OFFER TYPE</p><h2 className="mt-2 font-display text-[2rem] font-semibold">OFFER TITLE GOES HERE</h2><p className="mt-3 text-sm text-muted-foreground">PARTNER NAME GOES HERE</p><div className="mt-6 rounded-lg border border-border bg-card p-4"><p className="text-sm font-semibold">OFFER DESCRIPTION GOES HERE</p><p className="mt-3 text-xs text-muted-foreground">TERMS / EXPIRY GOES HERE</p></div><Button className="mt-6 w-full" disabled>External destination not connected</Button><div className="mt-5"><DeveloperNote>OFFER ACTION TODO: Connect this action only after an approved destination URL is supplied.</DeveloperNote></div></AppShell></AuthenticatedScreen>; }
