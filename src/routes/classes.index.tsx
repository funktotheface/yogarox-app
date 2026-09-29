import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { CLASS_CATEGORIES } from "@/config/classes";

import liveSessionsImage from "@/assets/gallery/IMG_8622.jpeg.asset.json";
import powerYogaImage from "@/assets/gallery/IMG_8624.jpeg.asset.json";
import pmYogaImage from "@/assets/gallery/IMG_8669.jpeg.asset.json";
import faceYogaImage from "@/assets/gallery/IMG_8681.jpeg.asset.json";
import coreYogaImage from "@/assets/gallery/IMG_8887.jpeg.asset.json";
import beginnerYogaImage from "@/assets/gallery/IMG_8893.jpeg.asset.json";
import amYogaImage from "@/assets/gallery/IMG_8895.jpeg.asset.json";

// Category imagery in the same order as CLASS_CATEGORIES.
const CATEGORY_IMAGES: Record<ClassCategorySlug, string> = {
  "live-sessions": liveSessionsImage.url,
  "power-yoga": powerYogaImage.url,
  "pm-yoga": pmYogaImage.url,
  "face-yoga": faceYogaImage.url,
  "core-yoga": coreYogaImage.url,
  "beginner-yoga": beginnerYogaImage.url,
  "am-yoga": amYogaImage.url,
};

type ClassCategorySlug = (typeof CLASS_CATEGORIES)[number]["slug"];

export const Route = createFileRoute("/classes/")({
  head: () => ({ meta: [
    { title: "Classes — YogaRox" },
    { name: "description", content: "Browse YogaRox on-demand classes by category." },
    { property: "og:title", content: "Classes — YogaRox" },
    { property: "og:description", content: "Browse YogaRox on-demand classes by category." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <AuthenticatedScreen>
      <AppShell title="Classes" eyebrow="On demand">
        <p className="text-sm leading-6 text-muted-foreground">Choose a category to browse its classes.</p>
        <div className="mt-6 grid gap-4">
          {CLASS_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/classes/$category"
              params={{ category: c.slug }}
              className="block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative min-h-36">
                <img
                  src={CATEGORY_IMAGES[c.slug]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-semibold">{c.title}</h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{c.description}</p>
                </div>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </AppShell>
    </AuthenticatedScreen>
  );
}
