import { ApiError, type ApiErrorShape } from "@/types/auth";

// Calls go through this app's own server, which forwards them to the YogaRox
// WordPress API. This avoids cross-origin/browser-network blocking entirely.
export const API_BASE_URL = (
  import.meta.env["VITE_API_BASE_URL"] ?? "/api/public/yogarox"
).replace(/\/$/, "");

const TIMEOUT_MS = 20_000;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | undefined;
  signal?: AbortSignal | undefined;
};

// Called when a protected request is rejected with 401 so the session can be
// cleared centrally. Registered by AuthProvider.
let unauthorizedHandler: ((token: string) => void) | null = null;
export function setUnauthorizedHandler(handler: ((token: string) => void) | null) {
  unauthorizedHandler = handler;
}

const FRIENDLY: Record<string, string> = {
  yogarox_origin_denied: "This app isn't allowed to reach YogaRox yet (origin configuration).",
  yogarox_https_required: "YogaRox requires a secure connection (hosting configuration).",
  yogarox_member_account_required:
    "This account can't be used in the app. Please sign in with a member (customer) account.",
  yogarox_request_busy: "YogaRox is still processing a previous request. Please try again shortly.",
  yogarox_subscriptions_unavailable:
    "Membership status is temporarily unavailable. Please try again shortly.",
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Hosting-level caching can otherwise serve a stale authenticated GET
  // (e.g. /me succeeding after logout), so every read is made unique.
  const url =
    method === "GET"
      ? `${API_BASE_URL}${path}?_=${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
      : `${API_BASE_URL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);
  const onAbort = () => controller.abort("cancelled");
  signal?.addEventListener("abort", onAbort);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      cache: "no-store",
      // Keep same-origin preview access cookies when calling our own proxy.
      // The proxy forwards only the explicit bearer token, never these cookies.
      credentials: "same-origin",
      signal: controller.signal,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    if (controller.signal.reason === "timeout") {
      throw new ApiError(
        "YogaRox is taking too long to respond. Your request may still have gone through.",
        "timeout",
        0,
      );
    }
    if (controller.signal.aborted) throw new ApiError("Request cancelled.", "cancelled", 0);
    throw new ApiError(
      "We couldn't reach YogaRox just now. Please check your connection and try again.",
      "network_error",
      0,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  let payload: unknown = null;
  let isJson = false;
  if (text && contentType.includes("json")) {
    try {
      payload = JSON.parse(text);
      isJson = true;
    } catch {
      payload = null;
    }
  }

  // Hosting challenges (e.g. SiteGround CAPTCHA pages) can return HTML with a
  // 2xx status. That is never a valid API response.
  if (text && !isJson) {
    throw new ApiError(
      "YogaRox returned an unexpected page instead of a response. Please try again later.",
      "yogarox_non_json_response",
      response.status,
    );
  }

  if (!response.ok) {
    const shape = payload as ApiErrorShape | null;
    const status = shape?.data?.status ?? response.status;
    const code = shape?.code ?? "unknown_error";
    if (status === 401 && token && unauthorizedHandler) unauthorizedHandler(token);
    const fallback =
      status === 401
        ? token
          ? "Your session has ended. Please sign in again."
          : "Incorrect email or password."
        : status === 429
          ? "Too many attempts. Please wait about 15 minutes and try again."
          : status >= 500
            ? "YogaRox is having trouble right now. Please try again in a moment."
            : "Something went wrong. Please try again in a moment.";
    throw new ApiError(FRIENDLY[code] ?? shape?.message ?? fallback, code, status);
  }

  return payload as T;
}
