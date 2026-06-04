// =====================================================================
// Qetos Recipe — AI step-by-step recipes (Gemini, structured JSON),
// tuned to the user's goals (low net carbs, cholesterol-aware).
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    servings: { type: "number" },
    time_min: { type: "number" },
    net_carbs_g: { type: "number" },
    ingredients: { type: "array", items: { type: "object", properties: { item: { type: "string" }, qty: { type: "string" } }, required: ["item"] } },
    steps: { type: "array", items: { type: "string" } },
    youtube_query: { type: "string" },
    cholesterol_note: { type: "string" },
  },
  required: ["title", "ingredients", "steps"],
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
    const { dish, context } = await req.json();
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sec } = await admin.from("app_secrets").select("value").eq("key", "gemini").single();
    const KEY = sec?.value;
    if (!KEY) return json({ error: "not configured" }, 500);

    const prompt = `Create a delicious ketogenic recipe for: ${dish || "a low-carb dinner"}.
User goals/context: ${JSON.stringify(context ?? {})}.
Keep net carbs low. Favor fats that support a healthy lipid profile (olive oil, avocado, fatty fish, nuts) over heavy saturated fat where reasonable.
Give clear, encouraging step-by-step instructions a beginner can follow. youtube_query = a good search phrase for a real video of this dish. cholesterol_note = one calm sentence on its likely LDL impact.`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.6, maxOutputTokens: 1400, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    const out = await r.json();
    const text = out?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return json({ error: "no result", raw: out }, 502);
    let recipe; try { recipe = JSON.parse(text); } catch { recipe = null; }
    return json({ recipe });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
