import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AuthenticatedScreen, DeveloperNote } from "@/components/app/app-shell";
import { OfferCard } from "@/components/app/content-cards";
export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [
    { title: "Member offers — YogaRox" }, { name: "description", content: "YogaRox member offers layout awaiting partner content." },
    { property: "og:title", content: "Member offers — YogaRox" }, { property: "og:description", content: "YogaRox member offers layout awaiting partner content." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: OffersPage,
});
function OffersPage() { return <AuthenticatedScreen><AppShell><header><p className="text-xs font-bold uppercase text-primary">Member benefits</p><h1 className="mt-2 font-display text-[2.5rem] font-semibold leading-none">Member offers</h1><p className="mt-3 text-sm text-muted-foreground">Promotions from trusted YogaRox partners will appear here.</p></header><div className="mt-7 space-y-4"><OfferCard image /><OfferCard /></div><div className="mt-5"><DeveloperNote>OFFER DATA TODO: Future content may require an offer ID, title, image, partner name, description, terms, expiration, and external destination URL. Exact fields remain undefined.</DeveloperNote></div></AppShell></AuthenticatedScreen>; }
