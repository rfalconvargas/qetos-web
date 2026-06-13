/**
 * Food decision cards for the Qetos Decision Lab.
 *
 * Health language here is intentionally cautious, educational, and
 * source-ready: no definitive medical claims, no shame, no failure states.
 * A craving is treated as a signal to read, never a moral test.
 */

export type FoodCard = {
  id: string;
  emoji: string;
  /** Short noun for use inside sentences, e.g. "candy". */
  short: string;
  name: string;
  category: string;
  temptationPattern: string;
  commonTriggers: string[];
  personalRuleConflict: string;
  /** Cautious, source-ready wording — no disease claims. */
  evidenceConcern: string;
  betterSwaps: string[];
  emergencySentence: string;
  tone: string;
};

export const FOODS: FoodCard[] = [
  {
    id: "candy",
    emoji: "🍬",
    short: "candy",
    name: "Reese's / candy",
    category: "Added sugar / ultra-palatable snack",
    temptationPattern:
      "A fast reward after stress, boredom, or weekend permission.",
    commonTriggers: ["reward", "stress", "checkout aisle", "convenience", "nostalgia"],
    personalRuleConflict:
      "Breaks a no-added-sugar reset and can restart the craving loop.",
    evidenceConcern:
      "Frequent added-sugar intake can displace nutrient-dense foods and make energy regulation harder. General education — not a disease claim.",
    betterSwaps: [
      "a Greek-style dairy-free protein option",
      "fruit with nut butter",
      "tea",
      "sparkling water",
      "a planned dessert window",
      "a short walk",
    ],
    emergencySentence: "I do not need to negotiate with candy today.",
    tone: "Clear, calm, non-shaming.",
  },
  {
    id: "cheese",
    emoji: "🧀",
    short: "cheese",
    name: "Cheese",
    category: "Dairy / high-reward savory food",
    temptationPattern: "Comfort, salt, fat, and social meals.",
    commonTriggers: ["restaurants", "pizza", "weekend meals", "stress", "convenience"],
    personalRuleConflict:
      "Breaks a no-dairy protocol and can create rule erosion.",
    evidenceConcern:
      "Dairy isn't universally unhealthy. For some people it can conflict with a chosen protocol or digestion goals — a personal call worth reviewing against a credible source.",
    betterSwaps: [
      "avocado",
      "olive oil",
      "hummus",
      "a dairy-free sauce",
      "a protein-forward meal",
    ],
    emergencySentence: "I am protecting the experiment, not fighting cheese forever.",
    tone: "Nuanced, respectful.",
  },
  {
    id: "bread",
    emoji: "🥖",
    short: "bread",
    name: "Bread / gluten",
    category: "Gluten / refined grain (depending on the food)",
    temptationPattern: "Convenience and social eating.",
    commonTriggers: ["restaurants", "sandwiches", "pastries", "weekend exceptions"],
    personalRuleConflict: "Breaks a no-gluten experiment or protocol.",
    evidenceConcern:
      "Gluten isn't universally harmful. For most people this is a personal rule; it's medically relevant mainly for specific conditions like celiac disease — worth confirming with a credible source.",
    betterSwaps: [
      "a rice bowl",
      "a potato",
      "a corn tortilla if tolerated",
      "a lettuce wrap",
      "a whole-food meal",
    ],
    emergencySentence: "I can choose the meal without choosing the spiral.",
    tone: "Nuanced, non-dogmatic.",
  },
  {
    id: "pizza",
    emoji: "🍕",
    short: "pizza",
    name: "Pizza",
    category: "Mixed-trigger food: gluten, dairy, high reward",
    temptationPattern: "Social permission and comfort.",
    commonTriggers: ["weekends", "friends", "late nights", "fatigue"],
    personalRuleConflict: "Often breaks gluten and dairy rules simultaneously.",
    evidenceConcern:
      "This is a protocol conflict, not a moral failure. Whether it fits is about your chosen rules — not right or wrong.",
    betterSwaps: [
      "a protein bowl",
      "a compliant pizza alternative",
      "a grilled meal",
      "a pre-planned exception",
    ],
    emergencySentence: "I am not missing out; I am choosing tomorrow's clarity.",
    tone: "Supportive.",
  },
  {
    id: "icecream",
    emoji: "🍨",
    short: "ice cream",
    name: "Ice cream",
    category: "Added sugar / dairy",
    temptationPattern: "Reward, soothing, and the evening craving.",
    commonTriggers: ["stress", "heat", "late-night comfort", "celebration"],
    personalRuleConflict: "Can break both a no-sugar and a no-dairy reset.",
    evidenceConcern:
      "Kept modest and source-ready: this combines added sugar and dairy, which may sit outside your current reset. General education, not a medical claim.",
    betterSwaps: [
      "frozen fruit",
      "a smoothie bowl",
      "a protein shake",
      "tea",
      "a planned dessert",
    ],
    emergencySentence: "A craving is a signal, not a command.",
    tone: "Calm.",
  },
];

/**
 * Triggers reveal the pattern behind a craving. {craving} is interpolated
 * with the selected food's short name.
 */
export type Trigger = {
  id: string;
  label: string;
  pattern: string;
  meaning: string;
};

export const TRIGGERS: Trigger[] = [
  {
    id: "stress",
    label: "Stress",
    pattern: "Stress Soothing Loop",
    meaning:
      "you're not hungry for {craving} — you're reaching for something to settle your nervous system.",
  },
  {
    id: "boredom",
    label: "Boredom",
    pattern: "Idle-Hands Reach",
    meaning:
      "this isn't hunger. Your hands and attention just want something to do.",
  },
  {
    id: "reward",
    label: "Reward",
    pattern: "Earned-It Reward Trap",
    meaning:
      "you're not craving {craving} — you're looking for a reward after effort.",
  },
  {
    id: "social",
    label: "Social pressure",
    pattern: "Go-Along Pull",
    meaning:
      "the pull here is the moment and the people, more than the food itself.",
  },
  {
    id: "hunger",
    label: "Hunger",
    pattern: "Real-Hunger Signal",
    meaning:
      "this one is real signal — your body actually needs fuel right now.",
  },
  {
    id: "sleep",
    label: "Poor sleep",
    pattern: "Tired-Brain Bargain",
    meaning:
      "short sleep raises cravings and lowers willpower. This is biology, not a character flaw.",
  },
  {
    id: "weekend",
    label: "Weekend exception",
    pattern: "Weekend Permission Spiral",
    meaning:
      "you're not hungry for {craving} — you're looking for a reward and a release after a long week.",
  },
];
