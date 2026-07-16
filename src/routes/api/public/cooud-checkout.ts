import { createFileRoute } from "@tanstack/react-router";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
  "Access-Control-Max-Age": "86400",
};

const COOUD_API_BASE = (process.env.COOUD_API_URL || process.env.VITE_COOUD_API_URL || "https://api.cooud.com/v2").replace(
  /\/+$/,
  "",
);
const COMPAT_DATE = process.env.COOUD_COMPAT_DATE || process.env.VITE_COOUD_COMPAT_DATE || "2026-09-01";
const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 9999900;

type JsonObject = Record<string, unknown>;
type CooudApiError = Error & { status?: number; cooud?: unknown };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseAmountCents(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Number.isInteger(value) && value >= MIN_AMOUNT_CENTS ? value : Math.round(value * 100);
  }

  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    return parsed >= MIN_AMOUNT_CENTS ? parsed : Math.round(parsed * 100);
  }

  const normalized = raw
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

function normalizeCurrency(value: unknown): string {
  const currency = String(value || "eur")
    .trim()
    .toLowerCase();
  return /^[a-z]{3}$/.test(currency) ? currency : "eur";
}

function normalizeSessionId(value: unknown): string {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function normalizeTheme(value: unknown): "auto" | "light" | "dark" {
  return value === "light" || value === "dark" || value === "auto" ? value : "auto";
}

function cleanMetadata(payload: JsonObject): Record<string, string> {
  const payloadMetadata = asObject(payload.metadata);
  const metadata: Record<string, unknown> = {
    ...payloadMetadata,
    customer_name: payloadMetadata.customer_name || payload.fullName || payload.name,
    customer_phone: payloadMetadata.customer_phone || payload.phone || payload.telefone,
    message: payloadMetadata.message || payload.message,
    anonymous: payloadMetadata.anonymous,
    src: payloadMetadata.src || payload.src || "lovable",
  };

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value).slice(0, 500)]),
  );
}

function cooudError(data: unknown, fallback: string) {
  const payload = asObject(data);
  const payloadError = asObject(payload.error);
  return asString(payloadError.message) || asString(payload.message) || fallback;
}

function errorStatus(error: unknown, fallback = 502) {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number" && status >= 400) return status;
  }
  return fallback;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function cooudPost(path: string, body: JsonObject, idempotencyKey?: string) {
  const key = process.env.COOUD_SECRET_KEY || process.env.VITE_COOUD_SECRET_KEY;
  if (!key) {
    const error = new Error("COOUD_SECRET_KEY is not configured") as CooudApiError;
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${COOUD_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Cooud-Compat-Date": COMPAT_DATE,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = asObject(await response.json().catch(() => ({})));
  if (!response.ok) {
    const error = new Error(
      cooudError(data, `Cooud API error ${response.status}`),
    ) as CooudApiError;
    error.status = response.status;
    error.cooud = data;
    throw error;
  }

  return data;
}

async function createElementConfig(sessionId: string, theme: "auto" | "light" | "dark") {
  return cooudPost(`/checkout-sessions/${encodeURIComponent(sessionId)}/element-config`, {
    appearance: { theme },
  });
}

export const Route = createFileRoute("/api/public/cooud-checkout")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = normalizeSessionId(
          url.searchParams.get("sessionId") || url.searchParams.get("session_id"),
        );
        const theme = normalizeTheme(url.searchParams.get("theme"));
        if (!sessionId) return json({ error: "Missing sessionId" }, 400);

        try {
          const config = await createElementConfig(sessionId, theme);
          return json(config);
        } catch (err: unknown) {
          console.error("Cooud element-config failed", err);
          return json({ error: errorMessage(err, "Element config error") }, errorStatus(err));
        }
      },

      POST: async ({ request }) => {
        let payload: JsonObject;
        try {
          payload = asObject(await request.json());
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        if (payload?.action === "element_config" || payload?.session_id) {
          const sessionId = normalizeSessionId(payload?.session_id || payload?.sessionId);
          if (!sessionId) return json({ error: "Missing session_id" }, 400);

          try {
            const config = await createElementConfig(sessionId, normalizeTheme(payload?.theme));
            return json(config);
          } catch (err: unknown) {
            console.error("Cooud element-config failed", err);
            return json({ error: errorMessage(err, "Element config error") }, errorStatus(err));
          }
        }

        const amount =
          parseAmountCents(
            payload?.amount_cents ?? payload?.amountCents ?? payload?.valorCentavos,
          ) ?? parseAmountCents(payload?.amount ?? payload?.valor);
        if (!amount || amount < MIN_AMOUNT_CENTS) {
          return json({ error: "Minimum payment amount is 1.00" }, 400);
        }
        if (amount > MAX_AMOUNT_CENTS) {
          return json({ error: "Maximum payment amount is 99,999.00" }, 400);
        }

        const currency = normalizeCurrency(payload?.currency);
        const productName = String(payload?.productName || "Ebook Seeds of Hope ES").slice(0, 120);
        const email = payload?.customerEmail ? String(payload.customerEmail).trim() : undefined;
        const metadata = cleanMetadata(payload);

        const body: JsonObject = {
          ui_mode: "custom",
          line_items: [
            {
              name: productName,
              amount,
              currency,
              quantity: 1,
              delivery: { mode: "external" },
            },
          ],
          customer_email: email || undefined,
          success_url: payload?.success_url || `${new URL(request.url).origin}/donate?success=1`,
          cancel_url: payload?.cancel_url || `${new URL(request.url).origin}/donate?canceled=1`,
          metadata,
        };

        const headerIdempotencyKey = request.headers.get("Idempotency-Key");
        const generatedIdempotencyKey =
          globalThis.crypto && "randomUUID" in globalThis.crypto
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const idempotencyKey = headerIdempotencyKey || generatedIdempotencyKey;

        try {
          const data = await cooudPost("/checkout-sessions", body, idempotencyKey);
          const sessionId = normalizeSessionId(data.id);
          if (!sessionId) {
            return json({ error: "Cooud did not return a checkout session id" }, 502);
          }

          const config = await createElementConfig(sessionId, normalizeTheme(payload.theme));

          return json({
            id: sessionId,
            session_id: sessionId,
            livemode: data.livemode,
            status: data.status,
            cooud_session_secret: config.cooud_session_secret || data.cooud_session_secret,
            cooud_element_token: config.cooud_element_token,
            element: config.element,
            provider: config.provider,
          });
        } catch (err: unknown) {
          console.error("Cooud fetch failed", err);
          return json({ error: errorMessage(err, "Network error") }, errorStatus(err));
        }
      },
    },
  },
});
