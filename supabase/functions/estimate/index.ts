// =====================================================================
// Qetos Estimate — Supabase Edge Function (Deno) · Gemini 2.5 Flash
// Turns a plain-text meal description (no photo) into estimated macros.
// Returns the SAME shape as vision 'food' so the UI renders identically:
//   { result: { name, ingredients[{item,qty}], kcal, net_carbs_g, protein_g,
//               fat_g, fiber_g, cholesterol_impact, note } }
// Fallback path for ketone-pen / manual-tracking users.
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

const SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    ingredients: { type: "array", items: { type: "object", properties: {
      item: { type: "string" }, qty: { type: "string" },
    }, required: ["item", "qty"] } },
    kcal: { type: "number" }, net_carbs_g: { type: "number" },
    protein_g: { type: "number" }, fat_g: { type: "number" }, fiber_g: { type: "number" },
    cholesterol_impact: { type: "string" }, note: { type: "string" },
  },
  required: ["name", "kcal", "net_carbs_g", "protein_g", "note"],
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
    const { text, context } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) return json({ error: "no text" }, 400);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sec } = await admin.from("app_secrets").select("value").eq("key", "gemini").single();
    const KEY = sec?.value;
    if (!KEY) return json({ error: "not configured" }, 500);

    const prompt = `A user logged a meal by typing what they ate. Parse it into individual foods and estimate nutrition for the amounts described.
Meal: "${text.trim()}"
User goals/context: ${JSON.stringify(context ?? {})}.
For each food, add an 'ingredients' entry with a short 'item' name and a 'qty' that echoes the amount the user implied (normalize units, e.g. '2 thighs', '1 medium', '1/2'). Then compute realistic TOTALS across all items: kcal, net_carbs_g (total carbs minus fiber), protein_g, fat_g, fiber_g. name = a short title for the meal. cholesterol_impact = one of raises_ldl|neutral|lowers_ldl. note = one short sentence stating the key assumptions you made (portion sizes, cooking fat). Do not ask questions — give your best single estimate.`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.2, maxOutputTokens: 1200, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    const out = await r.json();
    const t = out?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!t) return json({ error: "no result", raw: out }, 502);
    let result; try { result = JSON.parse(t); } catch { result = null; }
    return json({ result });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
