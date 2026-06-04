// =====================================================================
// Qetos Waitlist — captures SMS-consented phone numbers from the landing
// page into public.waitlist using the service role (table is RLS-locked
// with no policies, so only this function can write).
// =====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS: reflect the request origin only if it's an allowed Qetos surface
// (localhost for dev, *.vercel.app for deploys, or the custom domain).
const CUSTOM_DOMAINS = [
  "https://getqetos.com",
  "https://www.getqetos.com",
  "https://qetos.app",
  "https://qetos.ailiur.com",
];
function allowOrigin(origin: string | null): string {
  if (!origin) return CUSTOM_DOMAINS[0];
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return origin;
    if (u.hostname.endsWith(".vercel.app")) return origin;
    if (CUSTOM_DOMAINS.includes(origin)) return origin;
  } catch (_) { /* fallthrough */ }
  return CUSTOM_DOMAINS[0];
}
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowOrigin(origin),
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
const json = (b: unknown, s: number, origin: string | null) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders(origin), "content-type": "application/json" } });

// Normalize to E.164: keep leading +, strip the rest to digits. A bare
// 10-digit number is assumed US (+1). Accept 10–15 digits total.
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const hadPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!hadPlus && digits.length === 10) digits = "1" + digits;     // default US
  if (digits.length < 10 || digits.length > 15) return null;
  return "+" + digits;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, origin);

  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(body.phone);
    if (!phone) return json({ ok: false, error: "invalid_phone" }, 400, origin);
    if (body.sms_consent !== true) return json({ ok: false, error: "consent_required" }, 400, origin);

    const goal = typeof body.goal === "string" ? body.goal.slice(0, 120) : null;
    const source = typeof body.source === "string" ? body.source.slice(0, 60) : "landing";
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null;
    const user_agent = (req.headers.get("user-agent") || "").slice(0, 300);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Dedupe on phone — never error or leak whether it already existed.
    const { error } = await sb
      .from("waitlist")
      .upsert({ phone, sms_consent: true, goal, source, referrer, user_agent }, { onConflict: "phone", ignoreDuplicates: true });

    if (error) { console.error("[waitlist] insert error:", error.message); return json({ ok: false, error: "server" }, 500, origin); }
    return json({ ok: true }, 200, origin);
  } catch (e) {
    console.error("[waitlist] error:", String(e));
    return json({ ok: false, error: "server" }, 500, origin);
  }
});
