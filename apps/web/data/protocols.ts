/**
 * Sample protocol-translation data: the dense clinical plan, and the calm,
 * time-aware actions Qetos turns it into.
 *
 * Illustrative and educational only — paraphrased from the DRESS framework
 * (Diet · Rest · Exercise · Stress · Supplements) and the structure of a
 * typical "Optimal Health Plan." Not medical advice.
 */

export type StepWhen = "Morning" | "Midday" | "Evening" | "Daily" | "Anytime";

export type ProtocolStep = {
  id: string;
  when: StepWhen;
  title: string;
  action: string;
  why: string;
};

export const PROTOCOL_TITLE = "Optimal Health Plan — wk 6";

/** The dense, clinical-sounding source the protocol arrives as. */
export const PROTOCOL_RAW: string[] = [
  "AM micronutrient repletion: vitamin D3 5000 IU, omega-3 2 g combined EPA/DHA, magnesium glycinate 400 mg — administer with first meal to optimize fat-soluble absorption. Prioritize protein 1.4 g/kg lean mass.",
  "Maintain nutritional ketosis: net carbohydrate ceiling 20 g/day; document intake and hydration (2.5–3 L) at each eating occasion.",
  "Parasympathetic down-regulation: diaphragmatic breathing 5 min when subjective stress ≥ 6/10, preferentially evening.",
  "Log fasted beta-hydroxybutyrate daily; calculate GKI for trend review.",
  "Record subjective symptoms and energy daily; review weekly for adherence and correlation.",
];

/** The calm translation: each protocol element as one gentle action. */
export const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    id: "morning-metabolic-support",
    when: "Morning",
    title: "Morning metabolic support",
    action: "Take your supplements with breakfast, and lead the plate with protein.",
    why: "Vitamin D3 and omega-3s absorb best with food, and protein-first steadies energy — so the whole plan rides on a meal you already eat.",
  },
  {
    id: "midday-nutrition-check",
    when: "Midday",
    title: "Midday nutrition check",
    action: "Log your meal and hydration at lunch.",
    why: "A few taps captures the carb, protein and water targets at once — the protocol's tracking, without the spreadsheet.",
  },
  {
    id: "evening-nervous-system-reset",
    when: "Evening",
    title: "Evening nervous-system reset",
    action: "A five-minute breathing reset, only if stress is elevated.",
    why: "Five slow minutes is the clinical dose. Qetos surfaces it when stress tends to peak — and stays quiet when you don't need it.",
  },
  {
    id: "ketone-logging",
    when: "Morning",
    title: "Ketone logging",
    action: "Log a fasted ketone reading once, before your first coffee.",
    why: "One morning data point is enough to see the trend. It turns an abstract target (GKI) into a single calm habit.",
  },
  {
    id: "symptom-reflection",
    when: "Anytime",
    title: "Symptom reflection",
    action: "A thirty-second note on how you feel today.",
    why: "Gentle reflection is what later reveals patterns — what moves with what — without it feeling like homework.",
  },
];
