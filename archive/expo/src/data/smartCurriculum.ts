// ─────────────────────────────────────────────────────────────────────────────
// smartCurriculum.ts
//
// Static curriculum data for the Learn tab, faithfully structured from the
// "THINK + SMART" blueprint by Metabolic Mind.
//
// Pillars
//   THINK  — Therapeutic Integration of Nutritional Ketosis  (5 phases)
//   SLEEP  — Rest & Circadian Health                         (4 phases)
//   MOVE   — Reclaiming Energy                               (4 phases)
//   AVOID  — Protecting the Brain                            (4 phases)
//   REBUILD — Nourishing Mind & Spirit                       (4 phases)
//   TRACK  — Data-Informed Insight                           (4 phases)
//
// Progressive disclosure defaults
//   Phase 1 of every pillar  → isLocked: false  (open on first launch)
//   Phases 2–N               → isLocked: true   (unlock after prior phase completes)
//   All isCompleted          → false             (initial state)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type PillarId = 'THINK' | 'SLEEP' | 'MOVE' | 'AVOID' | 'REBUILD' | 'TRACK';

export type Lesson = {
  id: string;
  title: string;
  /** One-sentence summary from the blueprint — expand into full article copy at render time. */
  body: string;
  readingTime: string;
  isCompleted: boolean;
};

export type Application = {
  id: string;
  /** Full habit instruction as written in the blueprint. */
  habit: string;
  frequency: string;
  isCompleted: boolean;
};

export type CurriculumUnit = {
  id: string;         // e.g. "sleep-2"
  pillar: PillarId;
  phase: number;      // 1-indexed
  phaseTitle: string; // e.g. "Mastering Circadian Cues (Zeitgebers)"
  lessons: Lesson[];
  applications: Application[];
  isCompleted: boolean;
  isLocked: boolean;
};

export type PillarMeta = {
  id: PillarId;
  label: string;
  /** Full expanded name of the pillar acronym. */
  fullName: string;
  tagline: string;
  accentColor: string;
  icon: string;
  /** Pillar-level overview lesson (pre-phase, from the blueprint header). */
  introLesson: string;
  /** Pillar-level habits listed before the phase structure begins. */
  introHabits: string[];
};

// ── Pillar metadata ──────────────────────────────────────────────────────────

export const PILLAR_META: Record<PillarId, PillarMeta> = {
  THINK: {
    id: 'THINK',
    label: 'Think',
    fullName: 'Therapeutic Integration of Nutritional Ketosis',
    tagline: 'Harness metabolic science to stabilize mood and enhance mental clarity.',
    accentColor: '#7C3AED',
    icon: '🧠',
    introLesson: 'The science behind the Therapeutic Integration of Nutritional Ketosis.',
    introHabits: [
      'Use ketogenic therapy to stabilize mood and increase clarity.',
      'Track dietary intake intuitively or with visual food journals.',
    ],
  },
  SLEEP: {
    id: 'SLEEP',
    label: 'Sleep',
    fullName: 'Rest & Circadian Health',
    tagline: "Align your body's master clock to unlock restorative sleep and metabolic reset.",
    accentColor: '#1D4ED8',
    icon: '🌙',
    introLesson:
      'How environmental cues like light, food, and movement regulate circadian rhythms and metabolism.',
    introHabits: [
      'Get morning sunlight within an hour of waking to set your internal clock.',
      'Maintain a cool, dark, and quiet environment to encourage deeper sleep.',
    ],
  },
  MOVE: {
    id: 'MOVE',
    label: 'Move',
    fullName: 'Reclaiming Energy',
    tagline: 'Use movement as medicine to improve insulin sensitivity and support mitochondrial health.',
    accentColor: '#059669',
    icon: '⚡',
    introLesson:
      'The role of movement in improving insulin sensitivity and supporting mitochondrial health.',
    introHabits: [
      'Take peaceful walks in nature to lower stress and improve mood.',
      'Incorporate strength training to support metabolic resilience.',
    ],
  },
  AVOID: {
    id: 'AVOID',
    label: 'Avoid',
    fullName: 'Protecting the Brain',
    tagline: 'Remove the inputs that keep your nervous system locked in a state of over-activation.',
    accentColor: '#9333EA',
    icon: '🛡️',
    introLesson:
      'How substances, unsupportive relationships, and digital overload keep the nervous system in a state of over-activation.',
    introHabits: [
      'Set boundaries around excessive screen time and doom scrolling.',
      'Evaluate and reduce intake of caffeine, alcohol, or nicotine.',
    ],
  },
  REBUILD: {
    id: 'REBUILD',
    label: 'Rebuild',
    fullName: 'Nourishing Mind & Spirit',
    tagline: 'Cultivate the emotional and relational foundations that make metabolic healing last.',
    accentColor: '#0E7490',
    icon: '🌱',
    introLesson: 'The metabolic benefits of lowering cortisol and calming the stress response.',
    introHabits: [
      'Practice coherent breathing for five minutes twice daily, utilizing a six-second inhale and six-second exhale.',
      'Utilize journaling to process emotions and clarify values.',
    ],
  },
  TRACK: {
    id: 'TRACK',
    label: 'Track',
    fullName: 'Data-Informed Insight',
    tagline: 'Collect just enough data to see patterns, build confidence, and graduate to intuition.',
    accentColor: '#D97706',
    icon: '📊',
    introLesson:
      'How to collect just enough information to spot patterns without causing data overwhelm.',
    introHabits: [
      'Log mood patterns or energy levels daily.',
      'Measure ketone levels and blood glucose to observe physical responses.',
    ],
  },
};

// ── Curriculum ───────────────────────────────────────────────────────────────

export const SMART_CURRICULUM: CurriculumUnit[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // THINK — Therapeutic Integration of Nutritional Ketosis
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'think-1',
    pillar: 'THINK',
    phase: 1,
    phaseTitle: 'Foundations of Metabolic Psychiatry',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'think-1-l1',
        title: 'The Science of Metabolic Psychiatry',
        body: 'Understand the emerging field that proves mental health is deeply connected to metabolic health.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-1-l2',
        title: 'Mitochondria and Brain Energy',
        body: 'Learn how mitochondria turn nutrients into ATP, the fuel that powers every process in your body, and how ketosis optimizes this.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-1-l3',
        title: 'Glucose vs. Ketones',
        body: "Explore metabolic flexibility, which is the body's ability to efficiently switch between burning fat and glucose.",
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'think-1-a1',
        habit: 'Assess your current baseline by logging your standard daily meals without altering them yet.',
        frequency: 'Daily — Baseline week',
        isCompleted: false,
      },
      {
        id: 'think-1-a2',
        habit: 'Identify high-glycemic foods in your pantry and begin planning realistic swaps.',
        frequency: 'Once',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'think-2',
    pillar: 'THINK',
    phase: 2,
    phaseTitle: 'The Brain-Energy Connection',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'think-2-l1',
        title: 'Calming the Nervous System',
        body: 'Learn how a well-formulated ketogenic diet can reduce the daily highs and lows that often drive self-medicating.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-2-l2',
        title: 'Neuroinflammation',
        body: 'Understand how shifting to ketone production reduces brain inflammation and oxidative stress.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-2-l3',
        title: 'Mood Stability and Clarity',
        body: 'Discover how nutritional ketosis helps stabilize mood, reduce symptoms, and increase mental clarity.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'think-2-a1',
        habit: 'Complete a daily mood check-in to establish your pre-ketosis emotional baseline.',
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'think-2-a2',
        habit: 'Use a visual food journal to snap photos of your meals, shifting toward intuitive eating.',
        frequency: 'Daily — With meals',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'think-3',
    pillar: 'THINK',
    phase: 3,
    phaseTitle: 'Practical Implementation',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'think-3-l1',
        title: 'Formulating a Clinical Ketogenic Diet',
        body: 'Learn the difference between healthy fats, proteins, and hidden carbohydrates.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-3-l2',
        title: 'The Adaptation Phase',
        body: 'Understand the temporary shifts your body goes through as it enters a higher-energy state, which can temporarily disrupt sleep.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-3-l3',
        title: 'Electrolytes and Hydration',
        body: 'Discover why sodium, magnesium, and potassium are critical during the transition to ketosis.',
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'think-3-a1',
        habit: "Track your daily water intake and proactively add electrolytes to prevent the 'keto flu.'",
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'think-3-a2',
        habit: 'Build a localized grocery list focusing on whole foods, healthy fats, and low-glycemic vegetables.',
        frequency: 'Weekly',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'think-4',
    pillar: 'THINK',
    phase: 4,
    phaseTitle: 'Adaptation & Resilience',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'think-4-l1',
        title: 'Overcoming Setbacks',
        body: 'Learn why progress stalls, which is often due to external factors like disrupted sleep, stress, or overstimulation.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-4-l2',
        title: 'Dining Out and Social Situations',
        body: 'Strategies for navigating restaurant menus and social pressure without breaking your protocol.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-4-l3',
        title: 'Recognizing the Momentum',
        body: 'Notice how ketosis creates the momentum to begin moving more, sleeping better, or making intentional choices.',
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'think-4-a1',
        habit: "Log a 'Vitality Streak' when you successfully maintain your nutritional boundaries in a challenging social setting.",
        frequency: 'As needed',
        isCompleted: false,
      },
      {
        id: 'think-4-a2',
        habit: 'Pair your nutritional routine with a low-friction SMART habit, such as a short morning walk.',
        frequency: 'Daily — Morning',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'think-5',
    pillar: 'THINK',
    phase: 5,
    phaseTitle: 'Advanced Tracking & Intuition',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'think-5-l1',
        title: 'Turning Data into Insight',
        body: 'Learn to collect just enough information to connect symptoms with causes and spot patterns.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'think-5-l2',
        title: 'Understanding Biomarkers',
        body: 'Explore what continuous glucose monitors (CGMs) and ketone meters reveal about how your body responds in real time.',
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'think-5-l3',
        title: 'Shifting to Intuitive Awareness',
        body: "Learn how to transition from constant measurement to trusting your body's natural signals.",
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'think-5-a1',
        habit: 'Track your blood or breath ketone levels daily to confirm you are in therapeutic ketosis.',
        frequency: 'Daily — Fasted morning',
        isCompleted: false,
      },
      {
        id: 'think-5-a2',
        habit: 'Monitor your postprandial blood glucose to see how specific meals impact your metabolic stability.',
        frequency: 'After each meal',
        isCompleted: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLEEP — Rest & Circadian Health
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'sleep-1',
    pillar: 'SLEEP',
    phase: 1,
    phaseTitle: 'The Biology of Rest',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'sleep-1-l1',
        title: 'Sleep as an Active Metabolic Reset',
        body: 'Understand that sleep is not a passive state; it is a period where the body reduces cortisol, restores insulin sensitivity, and synchronizes hormonal rhythms that govern appetite and energy.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-1-l2',
        title: 'Brain Washing and Emotional Calibration',
        body: 'Learn how the brain uses sleep to clear waste, reset neurotransmitter systems, and recalibrate emotional regulation.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-1-l3',
        title: 'The Ketosis-Sleep Connection',
        body: 'Discover how poor sleep can elevate cortisol and blood glucose, which can actively interfere with nutritional ketosis and your overall metabolic balance.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'sleep-1-a1',
        habit: 'Log your current bedtime and wake time to establish your baseline sleep window before making any adjustments.',
        frequency: 'Daily — Baseline week',
        isCompleted: false,
      },
      {
        id: 'sleep-1-a2',
        habit: 'Set a consistent sleep and wake schedule that you can maintain every day, including weekends.',
        frequency: 'Daily — Ongoing',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'sleep-2',
    pillar: 'SLEEP',
    phase: 2,
    phaseTitle: 'Mastering Circadian Cues (Zeitgebers)',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'sleep-2-l1',
        title: 'Environmental Cues and Your Internal Clock',
        body: "Understand that your brain takes constant cues (called zeitgebers or 'time givers') from your environment—like light, food, movement, and social interaction—to regulate sleep and metabolism.",
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'sleep-2-l2',
        title: 'The Power of Natural Light',
        body: 'Learn how exposure to natural environments and daylight helps regulate your circadian rhythm and reduce stress.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-2-l3',
        title: 'Social Rhythms',
        body: 'Discover why even a brief conversation early in the day acts as a powerful circadian cue, signaling your brain that it is time to be alert.',
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'sleep-2-a1',
        habit: 'Get outside for morning sunlight within an hour of waking to set a healthy circadian rhythm.',
        frequency: 'Daily — Morning',
        isCompleted: false,
      },
      {
        id: 'sleep-2-a2',
        habit: 'Prioritize early-day social interaction to help ground your biological clock.',
        frequency: 'Daily — Morning',
        isCompleted: false,
      },
      {
        id: 'sleep-2-a3',
        habit: 'Take a short walk outside during the day to support both your metabolic and mental well-being.',
        frequency: 'Daily',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'sleep-3',
    pillar: 'SLEEP',
    phase: 3,
    phaseTitle: 'The Pre-Sleep Runway',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'sleep-3-l1',
        title: 'The Impact of Late-Night Inputs',
        body: 'Learn how artificial light at night and screen use within an hour or two of bedtime misalign your circadian system.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-3-l2',
        title: 'Digestion and Sleep Disruption',
        body: 'Understand why irregular meal timing or eating heavy meals too close to bedtime can impair insulin sensitivity and disrupt restorative sleep.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-3-l3',
        title: 'Stimulants and the Sleep Cycle',
        body: 'Explore how caffeine and alcohol disrupt your sleep architecture and why timing their consumption is critical.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'sleep-3-a1',
        habit: 'Limit screens at night, or transition to using blue-light blockers or red light after dark.',
        frequency: 'Nightly',
        isCompleted: false,
      },
      {
        id: 'sleep-3-a2',
        habit: 'Build a calming wind-down routine—such as reading, stretching, or listening to soothing music—to transition out of a high-stress state.',
        frequency: 'Nightly',
        isCompleted: false,
      },
      {
        id: 'sleep-3-a3',
        habit: 'Create a cool, dark, and quiet sleep environment to encourage deeper rest.',
        frequency: 'Nightly — Setup',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'sleep-4',
    pillar: 'SLEEP',
    phase: 4,
    phaseTitle: 'Troubleshooting & Tracking',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'sleep-4-l1',
        title: 'Ketosis Adaptation and Sleep Changes',
        body: 'Prepare for the reality that ketogenic therapy can temporarily disrupt sleep during the adaptation phase as the body enters a higher-energy state, though this usually passes.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-4-l2',
        title: 'Identifying Underlying Blockers',
        body: 'Learn to recognize factors like sleep apnea, chronic pain, or medication side effects that might be interrupting restful sleep despite good hygiene.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'sleep-4-l3',
        title: 'Quantifying Sleep Quality',
        body: 'Understand the value of tracking not just sleep duration, but quality markers like REM, deep sleep, and nighttime disruptions.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'sleep-4-a1',
        habit: 'Track your sleep using a wearable tool like an Oura Ring, Apple Watch, or WHOOP to understand your recovery and circadian alignment.',
        frequency: 'Daily — Morning review',
        isCompleted: false,
      },
      {
        id: 'sleep-4-a2',
        habit: 'Keep nourishing sleep habits consistently, even when improvements feel slow, trusting that they provide the essential foundation for progress.',
        frequency: 'Daily — Ongoing',
        isCompleted: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVE — Reclaiming Energy
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'move-1',
    pillar: 'MOVE',
    phase: 1,
    phaseTitle: 'Meeting You Where You Are',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'move-1-l1',
        title: 'Recontextualizing Fatigue',
        body: "Understand that low energy isn't laziness; it's often a sign of deeper metabolic impairment or the effects of long-term illness and medication.",
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'move-1-l2',
        title: 'Prioritizing the Pillars',
        body: 'Learn why movement might not be the immediate first step if you are not yet sleeping well, using harmful substances, or eating a metabolically disruptive diet.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'move-1-l3',
        title: 'Agency and Body Awareness',
        body: 'Discover how movement contributes to psychological recovery by reinforcing a sense of agency, self-efficacy, and connection to your body.',
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'move-1-a1',
        habit: 'Start small with gentle movement, such as walking, light stretching, or casual biking, building from what feels manageable.',
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'move-1-a2',
        habit: 'Choose forms of movement that leave you feeling restored and energized, not drained.',
        frequency: 'Each session',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'move-2',
    pillar: 'MOVE',
    phase: 2,
    phaseTitle: 'The Mental Health & Neurobiology Connection',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'move-2-l1',
        title: 'The Biochemistry of Movement',
        body: 'Learn how physical activity increases endorphins (nature\'s mood elevators) and stimulates brain-derived neurotrophic factor (BDNF), which supports neuroplasticity and learning.',
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'move-2-l2',
        title: 'Cortisol and Stress Reduction',
        body: 'Understand how exercise reduces circulating levels of cortisol, which are often chronically elevated in many psychiatric conditions.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'move-2-l3',
        title: 'Nervous System Regulation',
        body: 'Explore how movement helps regulate the autonomic nervous system, which is frequently dysregulated in trauma, PTSD, and chronic stress.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'move-2-a1',
        habit: 'Take peaceful walks in nature to utilize fresh air, daylight, and green space to regulate your circadian rhythm and lower stress.',
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'move-2-a2',
        habit: 'Track your mood shifts before and after gentle movement to observe changes in focus and groundedness.',
        frequency: 'After each session',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'move-3',
    pillar: 'MOVE',
    phase: 3,
    phaseTitle: 'Building the Metabolic Machinery',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'move-3-l1',
        title: 'Muscle as a Metabolic Organ',
        body: 'Learn how muscle plays a vital role in glucose disposal and overall energy balance, improving insulin sensitivity even with small amounts of physical activity.',
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'move-3-l2',
        title: 'Mitochondrial Support',
        body: 'Discover how exercise supports mitochondria, the cellular powerhouses that turn the nutrients and electrons from your food into ATP fuel.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'move-3-l3',
        title: 'Ketosis and Fat Oxidation',
        body: 'Understand how movement enhances fat oxidation and makes it easier for the body to enter and sustain nutritional ketosis.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'move-3-a1',
        habit: 'Incorporate strength training, such as lifting weights or doing bodyweight exercises, to improve mitochondrial health and stimulate muscle growth.',
        frequency: '2–3× Weekly',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'move-4',
    pillar: 'MOVE',
    phase: 4,
    phaseTitle: 'Optimization & Sustainability',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'move-4-l1',
        title: "The Social 'Twofer'",
        body: 'Learn why pairing exercise with a social activity amplifies progress by layering the psychological benefits of connection with the physiological benefits of movement.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'move-4-l2',
        title: 'Long-Term Metabolic Resilience',
        body: 'See how consistent movement over time reduces visceral fat, lowers fasting blood glucose, and improves lipid profiles.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'move-4-a1',
        habit: 'Combine movement with connection by joining a class, walking with a friend, or playing a team sport to make the habit more sustainable and joyful.',
        frequency: 'Weekly',
        isCompleted: false,
      },
      {
        id: 'move-4-a2',
        habit: 'Move vigorously (when it feels achievable for you) to elevate your heart rate, boost endorphins, and increase mental clarity.',
        frequency: '2–3× Weekly',
        isCompleted: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AVOID — Protecting the Brain
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'avoid-1',
    pillar: 'AVOID',
    phase: 1,
    phaseTitle: 'The Psychology of Coping',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'avoid-1-l1',
        title: 'The Curiosity Mindset',
        body: "Learn to explore the 'why' behind your habits, understanding that behaviors like drinking wine to relax or scrolling late at night to soothe loneliness serve a purpose.",
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'avoid-1-l2',
        title: 'Creating Space, Not Restriction',
        body: "Discover how avoiding what harms you isn't about restriction for its own sake; it's about creating space for healing and setting the stage for restorative experiences.",
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'avoid-1-a1',
        habit: 'Select one daily habit and explore its purpose with curiosity (not judgment) to open the door to healthier alternatives.',
        frequency: 'Daily — Reflection',
        isCompleted: false,
      },
      {
        id: 'avoid-1-a2',
        habit: 'Shift your mindset to recognize that every boundary you set is a concrete step toward balance and healing.',
        frequency: 'Daily — Ongoing',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'avoid-2',
    pillar: 'AVOID',
    phase: 2,
    phaseTitle: 'Chemical Inputs & Metabolic Disruption',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'avoid-2-l1',
        title: 'Neurotransmitter Disruption',
        body: 'Understand how substances like alcohol, nicotine, and caffeine alter brain chemistry in ways that often worsen anxiety, depression, and mood instability.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'avoid-2-l2',
        title: 'The Cycle of Temporary Relief',
        body: 'Learn how nicotine and caffeine stimulate dopamine and stress hormones, creating a volatile cycle of temporary relief followed by withdrawal and irritability.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'avoid-2-l3',
        title: 'Metabolic Inflexibility',
        body: 'Discover how alcohol and nicotine strongly impair insulin sensitivity, reducing the ability of cells to use fuel efficiently and making it harder to sustain ketosis.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'avoid-2-a1',
        habit: 'Evaluate and gently reduce your intake of caffeine, noting if moderate amounts worsen your anxiety or disturb your sleep.',
        frequency: 'Daily — Monitor',
        isCompleted: false,
      },
      {
        id: 'avoid-2-a2',
        habit: 'Set boundaries around alcohol and recreational drugs to prevent inflammation, oxidative stress, and mitochondrial damage.',
        frequency: 'Daily — Ongoing',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'avoid-3',
    pillar: 'AVOID',
    phase: 3,
    phaseTitle: 'Environmental & Digital Stressors',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'avoid-3-l1',
        title: 'Digital Overload and Cortisol',
        body: "Learn how excessive screen time and 'doom scrolling' expose you to negative content that elevates cortisol and reinforces feelings of hopelessness.",
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'avoid-3-l2',
        title: 'The Biology of Toxic Relationships',
        body: "Understand how unsupportive relationships repeatedly trigger the brain's stress pathways, keeping the nervous system in a state of over-activation and clouding mental clarity.",
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'avoid-3-a1',
        habit: 'Set healthy boundaries around excessive screen time and negative media consumption to lower your stress baseline.',
        frequency: 'Daily — Evening',
        isCompleted: false,
      },
      {
        id: 'avoid-3-a2',
        habit: 'Identify unsupportive people or situations in your life and establish boundaries to protect your progress from those who pressure you into unhealthy choices.',
        frequency: 'Ongoing — Reflection',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'avoid-4',
    pillar: 'AVOID',
    phase: 4,
    phaseTitle: 'Synergizing Avoidance with Ketosis',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'avoid-4-l1',
        title: 'Fading Reliance on Self-Medication',
        body: 'Learn how a well-formulated ketogenic diet creates more stable energy and calmer moods, allowing your reliance on caffeine or alcohol to naturally fade without forced willpower.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'avoid-4-l2',
        title: 'Hidden Food Triggers',
        body: "Understand that even some foods generally considered 'healthy' may still trigger mood shifts or cravings that undermine your metabolic balance.",
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'avoid-4-a1',
        habit: 'Monitor your cravings as you adapt to nutritional ketosis, noting when your desire for quick-burning carbohydrates or stimulants naturally begins to decrease.',
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'avoid-4-a2',
        habit: 'Identify and remove specific foods from your diet that trigger irritability or energy crashes, replacing them with metabolically stable alternatives.',
        frequency: 'As identified',
        isCompleted: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REBUILD — Nourishing Mind & Spirit
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'rebuild-1',
    pillar: 'REBUILD',
    phase: 1,
    phaseTitle: 'The Physiological Shift',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'rebuild-1-l1',
        title: 'The Foundation for Rebuilding',
        body: 'Understand how ketogenic therapy provides the biological stability—more energy, less anxiety, and clearer thinking—required to tackle the harder emotional work of rebuilding your life.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'rebuild-1-l2',
        title: 'The Metabolic Cost of Stress',
        body: 'Learn how chronic stress elevates cortisol, which in turn destabilizes blood glucose, disrupts sleep, and makes it significantly harder to sustain ketosis.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'rebuild-1-l3',
        title: 'The Science of Breathwork',
        body: 'Discover how regulating your breath directly stabilizes your autonomic nervous system, lowers stress hormones, and optimizes oxygen delivery to your mitochondria.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'rebuild-1-a1',
        habit: 'Practice coherent breathing for five minutes twice daily, utilizing a six-second inhale and six-second exhale, to reduce stress-induced glucose spikes.',
        frequency: '2× Daily',
        isCompleted: false,
      },
      {
        id: 'rebuild-1-a2',
        habit: 'Integrate gentle nervous system restoration practices like yoga or meditation to lower cortisol and inflammation, giving your body the space to repair.',
        frequency: 'Daily',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'rebuild-2',
    pillar: 'REBUILD',
    phase: 2,
    phaseTitle: 'Emotional Processing & Agency',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'rebuild-2-l1',
        title: 'Regulating the Nervous System',
        body: 'Understand that practices like journaling and meditation are science-backed tools that directly improve stress regulation and boost cognitive flexibility.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'rebuild-2-l2',
        title: 'Post-Traumatic Growth',
        body: 'Learn how to process years of grief, disconnection, and the emotional pain that often accompanies living with mental illness.',
        readingTime: '6 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'rebuild-2-a1',
        habit: 'Utilize journaling and visualization to process emotions, clarify your values, and actively envision a hopeful future.',
        frequency: 'Daily',
        isCompleted: false,
      },
      {
        id: 'rebuild-2-a2',
        habit: 'Practice reframing past challenges as valuable lessons that serve to strengthen your ongoing resilience.',
        frequency: 'Daily — Reflection',
        isCompleted: false,
      },
      {
        id: 'rebuild-2-a3',
        habit: 'Engage with therapy, coaching, or peer support groups to deepen your recovery and expand your emotional coping tools.',
        frequency: 'Weekly',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'rebuild-3',
    pillar: 'REBUILD',
    phase: 3,
    phaseTitle: 'Identity & Purpose',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'rebuild-3-l1',
        title: 'Reconnecting with Purpose',
        body: 'Discover why returning to community, school, or meaningful work buffers against relapse and strengthens your overall physical health.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'rebuild-3-l2',
        title: 'The Biology of Connection',
        body: 'Learn how consistent social connection physically lowers cortisol and inflammation, reinforcing both metabolic and mental recovery.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'rebuild-3-a1',
        habit: 'Cultivate meaningful relationships that are reciprocal, supportive, and growth-oriented.',
        frequency: 'Ongoing',
        isCompleted: false,
      },
      {
        id: 'rebuild-3-a2',
        habit: 'Engage in volunteering and advocacy to transform your past pain into purpose, helping others on their journey.',
        frequency: 'Weekly or as able',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'rebuild-4',
    pillar: 'REBUILD',
    phase: 4,
    phaseTitle: 'Expanding Capabilities',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'rebuild-4-l1',
        title: 'Transforming Recovery into Renewal',
        body: "Understand that rebuilding goes beyond mere symptom management; it is about integrating what you've been through and creating a life that feels whole and sustainable.",
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'rebuild-4-l2',
        title: 'Embracing the Nonlinear Path',
        body: 'Acknowledge that recovery stories often include setbacks and false starts, and that the struggle itself is a necessary part of growth.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'rebuild-4-a1',
        habit: 'Learn new skills or pick up new hobbies to actively build cognitive flexibility and self-confidence.',
        frequency: 'Weekly',
        isCompleted: false,
      },
      {
        id: 'rebuild-4-a2',
        habit: 'Pursue educational or vocational reintegration, when the time feels right, to fully rebuild your identity and autonomy.',
        frequency: 'At your own pace',
        isCompleted: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRACK — Data-Informed Insight
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'track-1',
    pillar: 'TRACK',
    phase: 1,
    phaseTitle: 'The Psychology of Visibility',
    isCompleted: false,
    isLocked: false,
    lessons: [
      {
        id: 'track-1-l1',
        title: 'The Purpose of Tracking',
        body: "Understand that the goal isn't to become a full-time data analyst or to overwhelm yourself with numbers—it is about collecting just enough information to connect symptoms with causes, spot patterns, and make more informed decisions.",
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'track-1-l2',
        title: 'Overcoming the Fear of Hope',
        body: 'Recognize that after years of disappointment, believing in lasting change can feel risky. Tracking provides objective patterns that offer reassurance, confirming that progress is real and not imagined.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'track-1-a1',
        habit: 'Start simple by choosing just one or two areas to monitor, such as mood and sleep, before expanding to other metrics.',
        frequency: 'Initially',
        isCompleted: false,
      },
      {
        id: 'track-1-a2',
        habit: 'Log mood patterns or energy levels daily—using simple check-ins or apps—to reveal long-term trends, like shorter depressive episodes or less intense anxiety.',
        frequency: 'Daily',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'track-2',
    pillar: 'TRACK',
    phase: 2,
    phaseTitle: 'Real-Time Metabolic Feedback',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'track-2-l1',
        title: 'Bridging Intention and Outcome',
        body: 'Learn how continuous glucose monitors (CGMs) and ketone meters reveal how your body responds in real time to food, stress, sleep, and movement.',
        readingTime: '6 min',
        isCompleted: false,
      },
      {
        id: 'track-2-l2',
        title: 'The Stress-Glucose Connection',
        body: 'See the immediate physiological impact of stress management; for instance, watching stress spike your glucose on a CGM, and then seeing it drop after just five minutes of breathing.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'track-2-l3',
        title: 'Beyond Standard Metrics',
        body: 'Understand why body composition measures (like a DEXA scan or waist measurement) offer better insights into improved insulin sensitivity and mitochondrial health than traditional BMI.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'track-2-a1',
        habit: 'Measure ketone levels and blood glucose to observe your physical responses and confirm you are maintaining metabolic balance.',
        frequency: 'Daily — Fasted morning',
        isCompleted: false,
      },
      {
        id: 'track-2-a2',
        habit: 'Track your sleep quality to reveal subtle, underlying signals of growing metabolic resilience, such as shifts in circadian alignment and heart rate variability.',
        frequency: 'Daily — Morning review',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'track-3',
    pillar: 'TRACK',
    phase: 3,
    phaseTitle: 'Identity Shift & Trigger Identification',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'track-3-l1',
        title: 'Shifting Your Identity',
        body: "Discover how documenting your measurable progress supports a profound psychological shift: moving from identifying as 'someone stuck in illness' to 'someone actively healing.'",
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'track-3-l2',
        title: 'Spotting Hidden Blockers',
        body: 'Learn to use your data to identify specific triggers—like poor sleep, hidden stress, or certain foods—that may be causing setbacks even if your diet aligns with a ketogenic protocol.',
        readingTime: '5 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'track-3-a1',
        habit: 'Cross-reference your numbers and use them as feedback to test how changes in stress management, diet, or movement actively alter your results.',
        frequency: 'Weekly — Review',
        isCompleted: false,
      },
      {
        id: 'track-3-a2',
        habit: 'Track medication timing and dosages closely, especially if you are in the process of tapering under medical supervision.',
        frequency: 'Daily (if tapering)',
        isCompleted: false,
      },
    ],
  },

  {
    id: 'track-4',
    pillar: 'TRACK',
    phase: 4,
    phaseTitle: 'Graduation to Intuition',
    isCompleted: false,
    isLocked: true,
    lessons: [
      {
        id: 'track-4-l1',
        title: 'The Data Horizon',
        body: 'Understand that you do not have to track everything forever; the ultimate goal is building confidence in your recovery, aiming for clarity rather than pressure.',
        readingTime: '5 min',
        isCompleted: false,
      },
      {
        id: 'track-4-l2',
        title: 'Trusting the Baseline',
        body: 'Recognize that even if metabolic lab markers look normal, tracking your subjective symptoms remains critical if you still feel unwell.',
        readingTime: '4 min',
        isCompleted: false,
      },
    ],
    applications: [
      {
        id: 'track-4-a1',
        habit: "Allow intuitive awareness to naturally replace constant measurement as you learn to connect your body's signals with your daily choices.",
        frequency: 'Ongoing',
        isCompleted: false,
      },
      {
        id: 'track-4-a2',
        habit: 'Share your data and personalized roadmap with your care team to guide collaborative, informed treatment decisions when appropriate.',
        frequency: 'At appointments',
        isCompleted: false,
      },
    ],
  },
];

// ── Derived helpers ──────────────────────────────────────────────────────────

/** All units for a given pillar, ordered by phase number. */
export function getUnitsByPillar(pillar: PillarId): CurriculumUnit[] {
  return SMART_CURRICULUM.filter((u) => u.pillar === pillar);
}

/**
 * The currently active unit for a pillar:
 * the lowest-numbered phase that is unlocked and not yet completed.
 */
export function getActivePillarUnit(pillar: PillarId): CurriculumUnit | undefined {
  return SMART_CURRICULUM.find(
    (u) => u.pillar === pillar && !u.isLocked && !u.isCompleted,
  );
}

/** Ordered list of all pillar IDs in curriculum sequence. */
export const PILLAR_ORDER: PillarId[] = ['THINK', 'SLEEP', 'MOVE', 'AVOID', 'REBUILD', 'TRACK'];

/** Total lesson count across the entire curriculum. */
export const TOTAL_LESSONS = SMART_CURRICULUM.reduce(
  (sum, unit) => sum + unit.lessons.length,
  0,
);

/** Total application count across the entire curriculum. */
export const TOTAL_APPLICATIONS = SMART_CURRICULUM.reduce(
  (sum, unit) => sum + unit.applications.length,
  0,
);
