// Vimeo showcase embeds for each on-demand class category.
// Source of truth: the embed codes supplied by YogaRox. Update URLs here only.
export const CLASS_CATEGORIES = [
  { slug: "live-sessions", title: "Live Sessions", description: "Catch up on recordings of past live YogaRox sessions.", showcaseUrl: "https://vimeo.com/showcase/12293567/embed2" },
  { slug: "power-yoga", title: "Power Yoga", description: "Strong, energising flows to build heat and strength.", showcaseUrl: "https://vimeo.com/showcase/12265319/embed2" },
  { slug: "pm-yoga", title: "PM Yoga", description: "Evening classes to unwind and reset.", showcaseUrl: "https://vimeo.com/showcase/12265300/embed2" },
  { slug: "face-yoga", title: "Face Yoga", description: "Gentle face yoga routines.", showcaseUrl: "https://vimeo.com/showcase/12265336/embed2" },
  { slug: "core-yoga", title: "Core Yoga", description: "Classes focused on core strength and stability.", showcaseUrl: "https://vimeo.com/showcase/12265331/embed2" },
  { slug: "beginner-yoga", title: "Beginner Yoga", description: "A friendly place to start your practice.", showcaseUrl: "https://vimeo.com/showcase/12265325/embed2" },
  // The supplied file had no label on this final embed; mapped to AM Yoga as the only remaining category.
  { slug: "am-yoga", title: "AM Yoga", description: "Morning classes to start the day well.", showcaseUrl: "https://vimeo.com/showcase/12265314/embed2" },
] as const;

export type ClassCategory = (typeof CLASS_CATEGORIES)[number];

export function findCategory(slug: string): ClassCategory | undefined {
  return CLASS_CATEGORIES.find((c) => c.slug === slug);
}
