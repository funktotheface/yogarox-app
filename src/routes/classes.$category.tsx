import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { AppShell, AuthenticatedScreen, EmptyState } from "@/components/app/app-shell";
import { VimeoShowcase } from "@/components/app/vimeo-showcase";
import { Button } from "@/components/ui/button";
import { findCategory } from "@/config/classes";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/classes/$category")({
  loader: ({ params }) => {
    const category = findCategory(params.category);
    if (!category) throw notFound();
    return { title: category.title, description: category.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} classes — YogaRox` : "Classes — YogaRox";
    const description = loaderData?.description ?? "YogaRox on-demand classes.";
    return { meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  notFoundComponent: CategoryNotFound,
  component: CategoryPage,
});

function CategoryNotFound() {
  return (
    <AuthenticatedScreen>
      <AppShell title="Classes" backTo="/classes">
        <EmptyState title="Category not found" message="This class category doesn't exist." />
      </AppShell>
    </AuthenticatedScreen>
  );
}

function CategoryPage() {
  const { category: slug } = Route.useParams();
  const category = findCategory(slug)!;
  const { hasAccess, isMembershipLoading, membership } = useAuth();

  return (
    <AuthenticatedScreen>
      <AppShell title={category.title} eyebrow="Classes" backTo="/classes">
        <p className="text-sm leading-6 text-muted-foreground">{category.description}</p>
        <div className="mt-5">
          {hasAccess ? (
            <VimeoShowcase showcaseUrl={category.showcaseUrl} title={`YogaRox ${category.title} classes`} />
          ) : (
            <section className="rounded-lg border border-border bg-card p-6 text-center" aria-label="Membership required">
              <Lock aria-hidden="true" className="mx-auto size-7 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-2xl font-semibold">Membership required</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isMembershipLoading && !membership
                  ? "Checking your membership…"
                  : "An active YogaRox membership is needed to watch classes."}
              </p>
              {!isMembershipLoading ? (
                <Button asChild variant="outline" className="mt-5 w-full">
                  <a href="https://yogarox.uk/my-account/" target="_blank" rel="noreferrer">Manage membership</a>
                </Button>
              ) : null}
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/classes">Back to classes</Link>
              </Button>
            </section>
          )}
        </div>
      </AppShell>
    </AuthenticatedScreen>
  );
}
