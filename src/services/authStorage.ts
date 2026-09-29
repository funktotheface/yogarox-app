// Token storage abstraction.
//
// The browser preview uses sessionStorage (tab-scoped; still script-readable, NOT encrypted). When this app is packaged for
// iOS/Android (Capacitor), swap `activeAdapter` for a Keychain/Keystore
// backed adapter — nothing outside this file needs to change.

export interface StoredSession {
  token: string;
  expires_at: string;
}

export interface StorageAdapter {
  get(): StoredSession | null;
  set(session: StoredSession): void;
  clear(): void;
}

const STORAGE_KEY = "yogarox.session";

const memoryAdapter = (): StorageAdapter => {
  let value: StoredSession | null = null;
  return {
    get: () => value,
    set: (session) => {
      value = session;
    },
    clear: () => {
      value = null;
    },
  };
};

const localStorageAdapter: StorageAdapter = {
  get() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredSession>;
      if (typeof parsed.token !== "string" || !parsed.token) return null;
      return { token: parsed.token, expires_at: parsed.expires_at ?? "" };
    } catch {
      return null;
    }
  },
  set(session) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable — session stays in memory only */
    }
  },
  clear() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
  },
};

const fallback = memoryAdapter();

export const authStorage: StorageAdapter = {
  get: () => (typeof window === "undefined" ? fallback.get() : localStorageAdapter.get()),
  set: (session) =>
    typeof window === "undefined" ? fallback.set(session) : localStorageAdapter.set(session),
  clear: () => (typeof window === "undefined" ? fallback.clear() : localStorageAdapter.clear()),
};
