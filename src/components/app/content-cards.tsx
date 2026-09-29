import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Radio, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IntegrationPlaceholder } from "@/components/app/app-shell";


export function OnDemandClassCard() {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <IntegrationPlaceholder label="CLASS THUMBNAIL" className="min-h-32 rounded-none border-x-0 border-t-0" />
      <div className="p-4">
        <p className="text-xs font-bold uppercase text-primary">CLASS CATEGORY</p>
        <h3 className="mt-1 font-display text-xl font-semibold">CLASS TITLE</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock3 aria-hidden="true" className="size-3.5" /> CLASS DURATION</span>
          <span>CLASS LEVEL</span>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-lg">
          <Link to="/on-demand-class">View class <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </Button>
      </div>
    </article>
  );
}

export function OfferCard({ image = false }: { image?: boolean }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm">
      {image ? <IntegrationPlaceholder label="PARTNER IMAGE" className="mb-4 min-h-32" /> : null}
      <div className="px-1 pb-1">
        <p className="flex items-center gap-1 text-xs font-bold uppercase text-primary"><Tag aria-hidden="true" className="size-3.5" /> OFFER TYPE</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">OFFER TITLE GOES HERE</h2>
        <p className="mt-2 text-sm text-muted-foreground">PARTNER NAME GOES HERE</p>
        <p className="mt-1 text-xs text-muted-foreground">TERMS / EXPIRY GOES HERE</p>
        <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-lg">
          <Link to="/offer-detail">View offer</Link>
        </Button>
      </div>
    </article>
  );
}

export function AccessStateExamples() {
  return (
    <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
      <span className="rounded-lg bg-primary px-3 py-3 text-primary-foreground">Join</span>
      <span className="rounded-lg border border-border bg-card px-3 py-3 text-foreground">View</span>
      <span className="rounded-lg bg-muted px-3 py-3 text-muted-foreground">Unavailable</span>
      <span className="rounded-lg border border-primary/30 bg-accent/40 px-3 py-3 text-primary">Membership required</span>
    </div>
  );
}

export function LiveIndicator() {
  return <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-primary"><Radio aria-hidden="true" className="size-4" /> LIVE ONLINE</span>;
}
