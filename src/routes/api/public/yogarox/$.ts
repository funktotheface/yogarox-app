import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = (
  process.env["YOGAROX_API_BASE_URL"] ?? "https://yogarox.uk/wp-json/yogarox/v1"
).replace(/\/$/, "");

const ALLOWED = new Set([
  "health",
  "login",
  "me",
  "membership",
  "logout",
  "logout-all",
  "me/membership",
  "me/change-password",
  "me/deletion",
  "registration",
  "register",
  "register/verify",
]);

async function forward(request: Request, splat: string | undefined) {
  const path = (splat ?? "").replace(/^\/+|\/+$/g, "");
  if (!ALLOWED.has(path)) {
    return new Response(JSON.stringify({ code: "not_found", message: "Unknown endpoint." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const body = request.method === "GET" ? undefined : await request.text();

  const search = new URL(request.url).search;

  try {
    const upstream = await fetch(`${UPSTREAM}/${path}${search}`, {
      method: request.method,
      headers,
      ...(body ? { body } : {}),
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      // Pass the real content type through so the app can detect HTML
      // hosting challenges instead of treating them as API responses.
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/plain",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ code: "upstream_unreachable", message: "YogaRox did not respond." }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const Route = createFileRoute("/api/public/yogarox/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => forward(request, params._splat),
      POST: ({ request, params }) => forward(request, params._splat),
      PATCH: ({ request, params }) => forward(request, params._splat),
      DELETE: ({ request, params }) => forward(request, params._splat),
    },
  },
});
