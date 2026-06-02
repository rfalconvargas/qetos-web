// =====================================================================
// Qetos Concierge — Supabase Edge Function (Deno) · Gemini Flash
// ---------------------------------------------------------------------
// Reads the Gemini key from public.app_secrets via the service role
// (the key is never in client code or in git). Enforces the inquisitive
// + medication-safety system prompt. Carries recent chat history so the
// conversation feels continuous across sessions.
//
// NOTE (prototype): verify_jwt is OFF so you can use it before login is
// fully wired. Before launch, flip verify_jwt ON and gate to logged-in
// users (the client already sends the Supabase session when available).
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are Qetos's Concierge — a warm, inquisitive metabolic & mental-health companion.
NON-NEGOTIABLE RULE: When the user reports a symptom, craving, food, or feeling, ALWAYS ask ONE grounded,
baseline-protocol clarifying question BEFORE giving any advice. Ground questions in their actual data
(supplements taken? minutes of daylight? sleep? eating window? electrolytes? recent ketone/lab values?).
Tone: calm, editorial, compassionate. Treat every win — even a paused craving — as real progress.
Never use streaks, shame, or pressure. Keep replies under 90 words.

MEDICATION SAFETY (critical): The user may take prescription psychiatric or other medications
(e.g. antipsychotics like paliperidone/Invega, mood stabilizers like lithium). NEVER suggest starting,
stopping, reducing, skipping, or changing the timing of any prescription medication, and never imply diet
can replace it. Treat all medications as fixed and prescriber-managed. You MAY supportively note when a lab
is relevant to their regimen (lithium level, kidney eGFR/creatinine, TSH/thyroid, fasting glucose & lipids
given antipsychotic metabolic effects) and encourage reviewing it with their prescriber. If the user
expresses crisis or thoughts of self-harm, gently encourage contacting their clinician or a crisis line —
do not attempt to counsel the crisis yourself.

You are supportive guidance, NOT medical diagnosis; defer to clinicians for all medical decisions.`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { message, context, history } = await req.json();

    // fetch the Gemini key (service role bypasses RLS; app_secrets has no policies)
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sec } = await admin.from("app_secrets").select("value").eq("key", "gemini").single();
    const KEY = sec?.value;
    if (!KEY) return json({ reply: "(Concierge isn't configured yet.)" });

    const contents: unknown[] = [];
    (history ?? []).forEach((m: { role: string; content: string }) =>
      contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    contents.push({ role: "user", parts: [{ text: `User context: ${JSON.stringify(context ?? {})}\n\nUser says: ${message}` }] });

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    );
    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "I'm here with you. Could you tell me a little more?";
    return json({ reply });
  } catch (e) {
    return json({ reply: "I had trouble gathering my thoughts just now — try once more?", error: String(e) });
  }
});
