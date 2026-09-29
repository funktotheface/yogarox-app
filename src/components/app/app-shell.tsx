import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clapperboard,
  ChevronRight,
  CircleAlert,
  CircleOff,
  House,
  Image,
  LoaderCircle,
  MessageCircle,
  Play,
  Tag,
  UserRound,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  backTo?: "/home" | "/classes" | "/offers" | "/profile" | "/live-classes";
  hideNavigation?: boolean;
};

const tabs = [
  { to: "/home" as const, label: "Home", icon: House },
  { to: "/classes" as const, label: "Classes", icon: Clapperboard },
  { to: "/forum" as const, label: "Forum", icon: MessageCircle },
  { to: "/offers" as const, label: "Offers", icon: Tag },
  { to: "/profile" as const, label: "Profile", icon: UserRound },
];

export function AuthenticatedScreen({ children }: { children: ReactNode }) {
  const { user, isRestoring } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isRestoring && !user) void navigate({ to: "/" });
  }, [isRestoring, navigate, user]);

  if (isRestoring || !user) return <AppLoading />;
  return <>{children}</>;
}

export function AppShell({ children, title, eyebrow, backTo, hideNavigation = false }: AppShellProps) {
  return (
    <main className="yogarox-app min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
        {(title || backTo) && <ScreenHeader title={title} eyebrow={eyebrow} backTo={backTo} />}
        <div
          className={cn(
            "flex-1 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]",
            hideNavigation
              ? "pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              : "pb-[calc(6.25rem+env(safe-area-inset-bottom))]",
            title || backTo ? "pt-2" : "",
          )}
        >
          {children}
        </div>
        {!hideNavigation && <BottomNavigation />}
      </div>
    </main>
  );
}

export function ScreenHeader({
  title,
  eyebrow,
  backTo,
}: {
  title?: string | undefined;
  eyebrow?: string | undefined;
  backTo?: "/home" | "/classes" | "/offers" | "/profile" | "/live-classes" | undefined;
}) {
  return (
    <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex min-h-11 items-center gap-2">
        {backTo ? (
          <Button asChild variant="ghost" size="icon" className="-ml-3" aria-label="Go back">
            <Link to={backTo}>
              <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </Link>
          </Button>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase text-primary">{eyebrow}</p> : null}
          {title ? <h1 className="font-display text-[2rem] font-semibold leading-none">{title}</h1> : null}
        </div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeRoot = pathname.startsWith("/classes")
    ? "/classes"
    : pathname.startsWith("/forum")
    ? "/forum"
    : pathname.startsWith("/offers")
      ? "/offers"
      : pathname.startsWith("/profile")
        ? "/profile"
        : "/home";

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-border bg-card/95 px-3 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md"
    >
      <div className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = activeRoot === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={active ? 2.2 : 1.7} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function IntegrationPlaceholder({
  label,
  detail,
  icon = "image",
  className,
}: {
  label: string;
  detail?: string;
  icon?: "image" | "video" | "empty";
  className?: string;
}) {
  const Icon = icon === "video" ? Play : icon === "empty" ? CircleOff : Image;
  return (
    <div
      className={cn(
        "flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-primary/35 bg-accent/35 px-5 py-7 text-center",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-7 text-primary" strokeWidth={1.5} />
      <div>
        <p className="text-xs font-bold uppercase text-foreground">{label}</p>
        {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}

export function DeveloperNote({ children: _children }: { children: ReactNode }) {
  // Developer notes are hidden from the app UI. To show them again during
  // development, return the <aside> markup below instead of null.
  return null;
}

export function MenuRow({
  to,
  label,
  trailing,
}: {
  to: "/profile-personal-details" | "/profile-password" | "/profile-notifications" | "/profile-payment-details" | "/profile-privacy" | "/profile-delete-account";
  label: string;
  trailing?: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center justify-between border-b border-border px-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{label}</span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {trailing}
        <ChevronRight aria-hidden="true" className="size-4" />
      </span>
    </Link>
  );
}

export function AppLoading() {
  return (
    <main className="yogarox-app flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
      <div className="text-center">
        <LoaderCircle aria-hidden="true" className="mx-auto size-7 animate-spin text-primary" />
        <p className="mt-3 text-sm">Loading your YogaRox space…</p>
      </div>
    </main>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-6 text-center">
      <CircleOff aria-hidden="true" className="mx-auto size-7 text-muted-foreground" />
      <h2 className="mt-3 font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{message}</p>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}
