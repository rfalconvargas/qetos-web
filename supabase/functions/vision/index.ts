// =====================================================================
// Qetos Vision — Supabase Edge Function (Deno) · Gemini 2.5 Flash (vision)
// Reads an image or PDF and returns STRUCTURED JSON, per mode:
//   mode 'food'    → meal name + macros + cholesterol impact
//   mode 'ketone'  → Keto-Mojo screen → BHB mmol / glucose mg/dL
//   mode 'document'→ lab report / health plan → observations/actions/pending/metrics
// Key is read from public.app_secrets (service-role only).
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

const PROMPTS: Record<string, string> = {
  food: "Identify the food/meal in this image and estimate nutrition for the visible portion. Set cholesterol_impact to one of: raises_ldl, neutral, lowers_ldl (based on saturated/trans fat vs fiber/omega-3/unsaturated fat). Be realistic and state assumptions briefly in 'note'.",
  ketone: "This is a Keto-Mojo or similar blood meter screen. Read the large displayed number and its unit. If the unit is mmol/L it is a blood ketone reading (set bhb_mmol, leave glucose_mgdl null). If mg/dL it is glucose (set glucose_mgdl, leave bhb_mmol null). Give one calm sentence interpreting it in 'note'. If unreadable, say so in 'note'.",
  document: "This is a medical lab report or a practitioner health plan (image or PDF). Extract faithful, structured content: observations (key findings), actions (recommended steps), pending_labs (future/ordered tests), and metrics (numeric labs as metric/value/unit/flag where flag is optimal|watch|high|low). Do NOT invent numbers; only include what is present. Title = the report's title or 'Health Report'.",
};

const SCHEMAS: Record<string, unknown> = {
  food: { type: "object", properties: {
    name: { type: "string" }, kcal: { type: "number" }, net_carbs_g: { type: "number" },
    protein_g: { type: "number" }, fat_g: { type: "number" }, fiber_g: { type: "number" },
    cholesterol_impact: { type: "string" }, note: { type: "string" },
  }, required: ["name", "kcal", "net_carbs_g", "protein_g", "fat_g", "note"] },
  ketone: { type: "object", properties: {
    bhb_mmol: { type: "number", nullable: true }, glucose_mgdl: { type: "number", nullable: true },
    reading_type: { type: "string" }, note: { type: "string" },
  }, required: ["note"] },
  document: { type: "object", properties: {
    title: { type: "string" },
    observations: { type: "array", items: { type: "string" } },
    actions: { type: "array", items: { type: "string" } },
    pending_labs: { type: "array", items: { type: "string" } },
    metrics: { type: "array", items: { type: "object", properties: {
      metric: { type: "string" }, value: { type: "number" }, unit: { type: "string" }, flag: { type: "string" },
    }, required: ["metric"] } },
  }, required: ["title", "observations", "actions"] },
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { mode = "food", data, mimeType = "image/jpeg" } = await req.json();
    const m = SCHEMAS[mode] ? mode : "food";
    if (!data) return json({ error: "no image data" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sec } = await admin.from("app_secrets").select("value").eq("key", "gemini").single();
    const KEY = sec?.value;
    if (!KEY) return json({ error: "vision not configured" }, 500);

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ inlineData: { mimeType, data } }, { text: PROMPTS[m] }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMAS[m], temperature: 0.2, maxOutputTokens: 1200, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    const out = await r.json();
    const text = out?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: "no result", raw: out }, 502);
    let parsed; try { parsed = JSON.parse(text); } catch { parsed = { note: text }; }
    return json({ mode: m, result: parsed });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
