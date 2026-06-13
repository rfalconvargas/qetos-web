/**
 * Personal "rules" the user is protecting (used by the Decision Lab and the
 * 30-Day Reset), plus the logic that turns a (food · trigger · rule) choice
 * into a calm decision mirror.
 *
 * Language stays cautious and non-judgmental: a rule is a personal experiment,
 * not a universal dietary prescription.
 */
import { FOODS, TRIGGERS, type FoodCard, type Trigger } from "@/data/foods";

export type Rule = {
  id: string;
  label: string;
};

export const RULES: Rule[] = [
  { id: "no-sugar", label: "No added sugar" },
  { id: "no-dairy", label: "No dairy" },
  { id: "no-gluten", label: "No gluten" },
  { id: "ketosis", label: "Ketosis support" },
  { id: "high-protein", label: "High-protein breakfast" },
  { id: "hydration", label: "Hydration target" },
  { id: "sleep", label: "Sleep recovery" },
  { id: "custom", label: "Custom rule" },
];

/** Rules a person can actively "protect" in the moment (excludes Custom). */
export const PROTECTABLE_RULES = RULES.filter((r) => r.id !== "custom");

export type DecisionResult = {
  pattern: string;
  meaning: string;
  conflict: string;
  caution: string;
  better: string;
  emergency: string;
  rule: string;
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Joins swaps into "a, b, or c". */
function joinSwaps(swaps: string[]): string {
  const top = swaps.slice(0, 3);
  if (top.length <= 1) return top.join("");
  return `${top.slice(0, -1).join(", ")}, or ${top[top.length - 1]}`;
}

/**
 * A calm decision mirror — names the pattern, reflects what it's really about,
 * shows how it sits with the chosen rule, adds a cautious note, and offers one
 * better step plus a sentence to hold onto. Real hunger gets a supportive
 * override: it deserves food, not resistance.
 */
export function deriveDecision(
  foodId: string,
  triggerId: string,
  ruleId: string
): DecisionResult {
  const food: FoodCard = FOODS.find((f) => f.id === foodId) ?? FOODS[0];
  const trigger: Trigger =
    TRIGGERS.find((t) => t.id === triggerId) ?? TRIGGERS[0];
  const rule: Rule = RULES.find((r) => r.id === ruleId) ?? RULES[0];

  const meaning = cap(trigger.meaning.replace(/\{craving\}/g, food.short));
  const better = `Choose ${joinSwaps(food.betterSwaps)}.`;

  if (trigger.id === "hunger") {
    return {
      pattern: trigger.pattern,
      meaning,
      conflict: `Even real hunger doesn't have to break ${rule.label.toLowerCase()} — it just needs the right food.`,
      caution: food.evidenceConcern,
      better,
      emergency: "Real hunger deserves real food — I'll eat something that fits my plan.",
      rule: rule.label,
    };
  }

  return {
    pattern: trigger.pattern,
    meaning,
    conflict: food.personalRuleConflict,
    caution: food.evidenceConcern,
    better,
    emergency: food.emergencySentence,
    rule: rule.label,
  };
}
