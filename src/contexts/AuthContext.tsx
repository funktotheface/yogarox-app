import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { setUnauthorizedHandler } from "@/services/api";
import * as authService from "@/services/auth";
import { authStorage } from "@/services/authStorage";
import { ApiError, type LoginInput, type Membership, type YogaRoxUser } from "@/types/auth";

type AuthContextValue = {
  user: YogaRoxUser | null;
  membership: Membership | null;
  /** Set when membership could not be checked (network/server), distinct from has_access:false. */
  membershipError: string | null;
  isRestoring: boolean;
  isMembershipLoading: boolean;
  hasAccess: boolean;
  /** One-off message shown on the sign-in screen (e.g. after password change). */
  authNotice: string;
  setAuthNotice: (notice: string) => void;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<{ revoked: boolean }>;
  signOutAll: () => Promise<void>;
  /** Clears local session without calling the server (token already invalid). */
  endSession: (notice?: string) => void;
  setUser: (user: YogaRoxUser) => void;
  getToken: () => string | null;
  refreshMembership: () => Promise<void>;
};

// Reuse a single context instance across hot reloads so the provider and
// consumers never end up referencing different context objects.
const g = globalThis as unknown as { __yogaroxAuthContext?: import("react").Context<AuthContextValue | null> };
const AuthContext = (g.__yogaroxAuthContext ??= createContext<AuthContextValue | null>(null));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<YogaRoxUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  // Every session change bumps the generation and aborts in-flight reads, so a
  // late response for account A can never populate account B's session.
  const generation = useRef(0);
  const controller = useRef<AbortController>(new AbortController());

  const resetLocal = useCallback(() => {
    generation.current += 1;
    controller.current.abort();
    controller.current = new AbortController();
    authStorage.clear();
    setUserState(null);
    setMembership(null);
    setMembershipError(null);
  }, []);

  const loadMembership = useCallback(async (token: string) => {
    const gen = generation.current;
    setIsMembershipLoading(true);
    try {
      const result = await authService.fetchMembership(token, controller.current.signal);
      if (gen !== generation.current) return;
      setMembership(result);
      setMembershipError(null);
    } catch (error) {
      if (gen !== generation.current) return;
      // Fail closed: never assume entitlement locally.
      setMembership(null);
      setMembershipError(
        error instanceof ApiError ? error.message : "Membership status is unavailable right now.",
      );
    } finally {
      if (gen === generation.current) setIsMembershipLoading(false);
    }
  }, []);

  const endSession = useCallback(
    (notice?: string) => {
      resetLocal();
      if (notice) setAuthNotice(notice);
    },
    [resetLocal],
  );

  useEffect(() => {
    setUnauthorizedHandler((token) => {
      if (authStorage.get()?.token === token) endSession("Your session has ended. Please sign in again.");
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const revalidate = useCallback(async () => {
    const stored = authStorage.get();
    if (!stored) return;
    const gen = generation.current;
    try {
      const restored = await authService.fetchMe(stored.token, controller.current.signal);
      if (gen !== generation.current) return;
      setUserState(restored.user);
      authStorage.set({ token: stored.token, expires_at: restored.expires_at ?? stored.expires_at });
      await loadMembership(stored.token);
    } catch (error) {
      if (gen !== generation.current) return;
      if (error instanceof ApiError && error.status === 401) resetLocal();
    }
  }, [loadMembership, resetLocal]);

  useEffect(() => {
    const stored = authStorage.get();
    if (!stored) {
      setIsRestoring(false);
      return;
    }
    authService
      .fetchMe(stored.token, controller.current.signal)
      .then(async (restored) => {
        setUserState(restored.user);
        authStorage.set({ token: stored.token, expires_at: restored.expires_at ?? stored.expires_at });
        await loadMembership(stored.token);
      })
      .catch(() => {
        resetLocal();
      })
      .finally(() => setIsRestoring(false));
  }, [loadMembership, resetLocal]);

  const signIn = useCallback(
    async (input: LoginInput) => {
      resetLocal();
      const gen = generation.current;
      const result = await authService.login(input);
      if (gen !== generation.current) return;
      authStorage.set({ token: result.token, expires_at: result.expires_at });
      setAuthNotice("");
      setUserState(result.user);
      await loadMembership(result.token);
    },
    [loadMembership, resetLocal],
  );

  const signOut = useCallback(async () => {
    const stored = authStorage.get();
    let revoked = !stored;
    if (stored) {
      try {
        await authService.logout(stored.token);
        revoked = true;
      } catch {
        revoked = false;
      }
    }
    resetLocal();
    if (!revoked) {
      setAuthNotice("You're signed out on this device, but we couldn't confirm the session was ended on the server.");
    }
    return { revoked };
  }, [resetLocal]);

  const signOutAll = useCallback(async () => {
    const stored = authStorage.get();
    if (!stored) return;
    // Throws on failure so the UI never claims all devices were signed out.
    await authService.logoutAll(stored.token);
    resetLocal();
    setAuthNotice("You've been signed out of YogaRox on all app devices.");
  }, [resetLocal]);

  const refreshMembership = useCallback(async () => {
    const stored = authStorage.get();
    if (stored) await loadMembership(stored.token);
  }, [loadMembership]);

  const getToken = useCallback(() => authStorage.get()?.token ?? null, []);

  // Revalidate the session and membership on foreground return.
  const lastCheck = useRef(Date.now());
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheck.current < 60_000) return;
      lastCheck.current = Date.now();
      void revalidate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [revalidate]);

  const value = useMemo(
    () => ({
      user,
      membership,
      membershipError,
      isRestoring,
      isMembershipLoading,
      hasAccess: membership?.has_access === true,
      authNotice,
      setAuthNotice,
      signIn,
      signOut,
      signOutAll,
      endSession,
      setUser: setUserState,
      getToken,
      refreshMembership,
    }),
    [user, membership, membershipError, isRestoring, isMembershipLoading, authNotice, signIn, signOut, signOutAll, endSession, getToken, refreshMembership],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
