import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/app/logo";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Flower2, Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ApiError } from "@/types/auth";
import { SignupFlow } from "@/components/app/signup-flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to YogaRox" },
      { name: "description", content: "Log in or create your YogaRox account." },
      { property: "og:title", content: "Welcome to YogaRox" },
      { property: "og:description", content: "Log in or create your YogaRox account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "login" | "signup";
type FormErrors = Record<string, string>;


function Index() {
  const { user, isRestoring, signIn, authNotice, setAuthNotice } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");

  // Show one-off messages (password changed, signed out elsewhere, etc.).
  useEffect(() => {
    if (authNotice) {
      setNotice(authNotice);
      setAuthNotice("");
    }
  }, [authNotice, setAuthNotice]);

  useEffect(() => {
    if (!isRestoring && user) void navigate({ to: "/home" });
  }, [isRestoring, user, navigate]);

  const changeView = (nextView: View) => {
    setView(nextView);
    setErrors({});
    setNotice("");
    setApiMessage("");
    setShowPassword(false);
  };

  const describe = (error: unknown) =>
    error instanceof ApiError
      ? error.message
      : "Something went wrong. Please try again in a moment.";

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextErrors: FormErrors = {};
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email) nextErrors["email"] = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      nextErrors["email"] = "That email address doesn’t look quite right.";
    if (!password) nextErrors["password"] = "Please enter your password.";
    setErrors(nextErrors);
    setApiMessage("");
    setNotice("");
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      await signIn({ login: email, password });
      void navigate({ to: "/home" });
    } catch (error) {
      setApiMessage(describe(error));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top,var(--color-accent),transparent_68%)] opacity-55"
      />
      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-8">
        <header className="flex min-h-12 items-center">
          {view === "signup" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeView("login")}
              aria-label="Back to login"
              className="-ml-3"
            >
              <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.7} />
            </Button>
          ) : (
            <div className="size-11" />
          )}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Logo className="h-8" />
          </div>
        </header>

        <div key={view} className="screen-enter flex flex-1 flex-col">
          <div
            className={cn(
              "flex flex-col items-center text-center",
              view === "login" ? "pt-12" : "pt-2",
            )}
          >
            <div
              className={cn(
                "relative flex items-center justify-center rounded-full bg-secondary text-primary",
                view === "login" ? "mb-7 size-[88px]" : "mb-3 size-[60px]",
              )}
            >
              <Flower2
                aria-hidden="true"
                className={view === "login" ? "size-11" : "size-8"}
                strokeWidth={1.25}
              />
              <Sparkles
                aria-hidden="true"
                className="absolute right-1 top-1 size-5"
                strokeWidth={1.4}
              />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase text-primary">
              Your practice, wherever you are
            </p>
            <h1 className="font-display text-[2.65rem] font-semibold leading-[0.96]">
              {view === "login" ? "Welcome back" : "Join YogaRox"}
            </h1>
            <p
              className={cn(
                "max-w-[19rem] text-[0.95rem] text-muted-foreground",
                view === "login" ? "mt-3 leading-6" : "mt-2 leading-5",
              )}
            >
              {view === "login"
                ? "Find a little space for yourself and continue your practice."
                : "Create a free account. You can sign in on the app and the YogaRox website with the same details."}
            </p>
          </div>

          {view === "login" ? (
            <form method="post" className="mt-10 flex flex-col gap-5" noValidate onSubmit={submitLogin}>
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                defaultValue={prefillEmail}
                key={prefillEmail}
                error={errors["email"]}
              />
              <PasswordField
                label="Password"
                name="password"
                autoComplete="current-password"
                shown={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                error={errors["password"]}
              />
              <div className="-mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-sm"
                  onClick={() =>
                    setNotice("You can reset your password on the YogaRox website for now.")
                  }
                >
                  Forgot password?
                </Button>
              </div>
              <StatusNotice notice={notice} tone="info" />
              <StatusNotice notice={apiMessage} tone="error" />
              <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in…" : "Log in"}
              </Button>
            </form>
          ) : (
            <SignupFlow
              onSignedIn={() => void navigate({ to: "/home" })}
              onNeedLogin={(nextEmail, message) => {
                changeView("login");
                setPrefillEmail(nextEmail);
                setNotice(message);
              }}
            />
          )}

          <div
            className={cn(
              "mt-auto text-center text-sm text-muted-foreground",
              view === "login" ? "pt-9" : "pt-4",
            )}
          >
            {view === "login" ? "New to YogaRox?" : "Already part of YogaRox?"}{" "}
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 font-semibold"
              onClick={() => changeView(view === "login" ? "signup" : "login")}
            >
              {view === "login" ? "Create an account" : "Log in"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
};

function Field({ label, name, error, type = "text", autoComplete, placeholder, defaultValue }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-13 w-full rounded-2xl border bg-field px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:bg-field-focus focus:ring-2 focus:ring-primary/15",
          error ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-transparent",
        )}
      />
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm leading-5 text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type PasswordFieldProps = Omit<FieldProps, "type" | "placeholder"> & {
  shown: boolean;
  onToggle: () => void;
};

function PasswordField({ label, name, error, autoComplete, shown, onToggle }: PasswordFieldProps) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <span className="relative block">
        <input
          name={name}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-13 w-full rounded-2xl border bg-field px-4 pr-14 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary focus:bg-field-focus focus:ring-2 focus:ring-primary/15",
            error ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-transparent",
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
        >
          {shown ? (
            <EyeOff aria-hidden="true" className="size-5" strokeWidth={1.7} />
          ) : (
            <Eye aria-hidden="true" className="size-5" strokeWidth={1.7} />
          )}
        </Button>
      </span>
      {error ? (
        <span id={errorId} className="mt-1.5 block text-sm leading-5 text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function StatusNotice({ notice, tone }: { notice: string; tone: "info" | "error" }) {
  if (!notice) return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-5",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      {notice}
    </p>
  );
}
