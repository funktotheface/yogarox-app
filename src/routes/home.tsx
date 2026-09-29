import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/app/logo";
import { ArrowRight, CheckCircle2, MoonStar, PlayCircle, Sunrise } from "lucide-react";

import { AppShell, AuthenticatedScreen } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import amCardImage from "@/assets/gallery/IMG_8610.jpeg.asset.json";
import pmCardImage from "@/assets/gallery/IMG_8616.jpeg.asset.json";
import heroImage from "@/assets/yogarox-hero.png.asset.json";


export const Route = createFileRoute("/home")({
  head: () => ({ meta: [
    { title: "Your YogaRox practice" },
    { name: "description", content: "Your YogaRox member home and weekly class schedule." },
    { property: "og:title", content: "Your YogaRox practice" },
    { property: "og:description", content: "Your YogaRox member home and weekly class schedule." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomeScreen,
});

function HomeScreen() {
  const { user, hasAccess } = useAuth();
  const name = user?.first_name || user?.display_name || user?.email || "MEMBER NAME";

  return (
    <AuthenticatedScreen>
      <AppShell>
        <header className="relative -mx-5 -mt-[max(1.25rem,env(safe-area-inset-top))] overflow-hidden">
          <div className="relative flex h-64 flex-col justify-end">
            {/* Hero image: anchored so the subject stays framed in view */}
            <img
              src={heroImage.url}
              alt="YogaRox member practising yoga"
              className="absolute inset-0 size-full object-cover object-center"
            />
            {/* Soft washes: keep the wordmark readable and dissolve the photo into the page at the bottom */}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background/55 via-transparent to-transparent" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="relative px-5 pb-6">
              <Logo className="h-7" />
              <p className="mt-6 text-xs font-bold uppercase text-primary">Your practice</p>
              {/* Green tick shown only when the existing membership check reports active access */}
              <h1 className="mt-2 flex items-center gap-2 font-display text-[2.75rem] font-semibold leading-[0.95]">
                Hi, {name}
                {hasAccess ? (
                  <CheckCircle2 aria-label="Active membership" role="img" className="size-7 shrink-0 text-success" strokeWidth={1.8} />
                ) : null}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Make time for you this week.</p>
            </div>
          </div>
        </header>

        <section className="mt-8" aria-labelledby="live-heading">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Practise together</p>
            <h2 id="live-heading" className="mt-1 font-display text-[2rem] font-semibold">Live classes</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Join the recurring live streams. Vimeo shows whether a session is currently broadcasting.</p>
          <div className="mt-4 grid gap-4">
            <article className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              {/* Card background image: soft off-white gradient overlay keeps the burgundy text readable */}
              <img src={amCardImage.url} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
              <div className="relative p-5">
                <Sunrise aria-hidden="true" className="size-7 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-2xl font-semibold">6:30am Club</h3>
                <p className="mt-1 text-sm text-muted-foreground">The recurring 6:30am live YogaRox session</p>
                <Button asChild className="mt-5 w-full">
                  <Link to="/live-classes/$session" params={{ session: "am" }}>View 6:30am session</Link>
                </Button>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              {/* Card background image: soft off-white gradient overlay keeps the burgundy text readable */}
              <img src={pmCardImage.url} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
              <div className="relative p-5">
                <MoonStar aria-hidden="true" className="size-7 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-2xl font-semibold">9:30am Club</h3>
                <p className="mt-1 text-sm text-muted-foreground">The recurring 9:30am live YogaRox session</p>
                <Button asChild className="mt-5 w-full">
                  <Link to="/live-classes/$session" params={{ session: "pm" }}>View 9:30am session</Link>
                </Button>
              </div>
            </article>
          </div>
        </section>


        <section className="mt-8 rounded-lg bg-secondary/70 p-5" aria-labelledby="library-heading">
          <PlayCircle aria-hidden="true" className="size-7 text-primary" strokeWidth={1.5} />
          <h2 id="library-heading" className="mt-4 font-display text-2xl font-semibold">Practise on demand</h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">Explore the class library layout while video content awaits connection.</p>
          <Button asChild variant="outline" size="sm" className="mt-5 w-full rounded-lg">
            <Link to="/classes">Browse classes <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </Button>
        </section>

      </AppShell>
    </AuthenticatedScreen>
  );
}
