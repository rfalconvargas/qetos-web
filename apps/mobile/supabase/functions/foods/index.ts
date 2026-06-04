// =====================================================================
// Qetos Foods — nutrition search (Open Food Facts, keyless).
// Server-side fetch avoids browser CORS and lets us add USDA later.
// Returns normalized items with net carbs + a cholesterol-impact tag
// grounded in lipid science (sat/trans fat ↑ LDL; soluble fiber ↓ LDL).
// =====================================================================
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

function impact(sat: number, fiber: number): string {
  if (sat >= 5 && fiber < 3) return "raises_ldl";
  if (fiber >= 5) return "lowers_ldl";
  return "neutral";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { query } = await req.json();
    if (!query || !String(query).trim()) return json({ items: [] });
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=12&fields=product_name,brands,nutriments,serving_size`;
    const r = await fetch(url, { headers: { "User-Agent": "Qetos/0.1 (raul@rfalcon.com)" } });
    const d = await r.json();
    const items = (d.products || [])
      .filter((p: Record<string, unknown>) => p.product_name && p.nutriments)
      .slice(0, 10)
      .map((p: Record<string, unknown>) => {
        const n = p.nutriments as Record<string, number>;
        const carbs = +n["carbohydrates_100g"] || 0;
        const fiber = +n["fiber_100g"] || 0;
        const sat = +n["saturated-fat_100g"] || 0;
        return {
          name: p.product_name, brand: p.brands || "", basis: "per 100g",
          kcal: Math.round(+n["energy-kcal_100g"] || 0),
          carbs, fiber, net_carbs: Math.max(0, +(carbs - fiber).toFixed(1)),
          protein: +n["proteins_100g"] || 0, fat: +n["fat_100g"] || 0, sat_fat: sat,
          cholesterol_impact: impact(sat, fiber),
        };
      });
    return json({ items });
  } catch (e) {
    return json({ items: [], error: String(e) }, 200);
  }
});
