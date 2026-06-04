```markdown
# SKILL.md — Design System Rules & Front-End Guidelines
**Product Identity:** Ketofy (Formerly Mytabolism)
**Core Engine Logic:** Proactive, Inquisitive, Functional Metabolic & Mental Health UI

---

## 1. Typography Scale

Do not use random `text-` classes or arbitrary pixel assignments. All typographic elements must align directly to this strict editorial type system, preserving maximum readability and intentional whitespace for users processing cognitive fatigue.

| Token | CSS Class | Size / Leading | Weight | Font Family | Intended Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-xl` | `.text-display-xl` | 2.5rem (40px) / 1.1 | Bold | Serif | High-impact greeting states (e.g., "Good morning, Raúl") |
| `display-lg` | `.text-display-lg` | 1.75rem (28px) / 1.2 | Medium | Serif | Main card views, section summaries |
| `heading-md` | `.text-heading-md` | 1.25rem (20px) / 1.4 | SemiBold| Sans-Serif | DRESS component headers, dashboard panels |
| `body-base` | `.text-body-base` | 1.0rem (16px) / 1.6 | Regular | Sans-Serif | AI chat narrative blocks, user inputs |
| `body-sm` | `.text-body-sm` | 0.875rem (14px) / 1.5| Light | Sans-Serif | Subtitles, helper text, metrics labels |
| `caption` | `.text-caption` | 0.75rem (12px) / 1.4 | Medium | Sans-Serif | Dynamic navigation icons, metric flags |

### Font Custom Utilities
```css
.font-editorial-serif {
  font-family: Playfair Display, Georgia, Garamond, serif;
  letter-spacing: -0.02em;
}
.font-clean-sans {
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0.01em;
}

```

---

## 2. Spacing System (8px Base Grid)

All layout margins, paddings, item structural gaps, and content blocks must strictly conform to multipliers of an **8px base unit**. This prevents crowded visual arrays and supports the therapeutic, minimalist layout structure.

| Spacer | Size | Application Guide |
| --- | --- | --- |
| `space-1` | 4px | Micro-adjustments (Label text to icon gaps) |
| `space-2` | 8px | Core internal padding for inline interactive tags, list element gaps |
| `space-3` | 12px | Compact layout configurations |
| `space-4` | 16px | Global standard internal card padding, message item spacing |
| `space-6` | 24px | Layout row segmentation, major context component spacing |
| `space-8` | 32px | Massive negative space margins to promote optical relaxation |

### Layout Constraint Rule

$$\text{Margin/Padding} \pmod 8 = 0 \quad (\text{or } 4 \text{ for micro-spacing})$$

---

## 3. Color Tokens

Never declare raw, randomized hex codes across any dynamic interfaces. All element definitions must utilize these fixed structural token values.

```css
:root {
  /* Neutral Base System (The Premium Journal Feel) */
  --color-bg-base:      #FBF9F6;  /* Warm editorial cream / off-white */
  --color-panel-base:   #E8F0EC;  /* Gentle, soothing organic soft mint green */
  --color-text-primary: #1E2D4A;  /* Deep rich cobalt blue (replaces stark harsh blacks) */
  --color-text-muted:   #5A6E85;  /* Softened corporate tone for secondary details */

  /* DRESS Protocol Core Accents */
  --color-accent-teal:  #CBE7E3;  /* Diet / Data validation states */
  --color-accent-lav:   #E3E0F2;  /* Rest / Sleep & recovery tracking */
  --color-accent-orange:#F5A97E;  /* Low-saturation active accents / Notification pips */

  /* Behavioral Reinforcement States */
  --color-star-glow:    #F7D070;  /* Compassionate win states (replaces punishing streaks) */
}

```

---

## 4. Component Patterns

### 4.1 Interactive Button States

Buttons do not utilize sharp, uniform color shifts. They expand and adapt gracefully.

* **Primary Action Pill (e.g., `Log My Energy Win`):**
* *Default State:* Background color `var(--color-text-primary)`, text color `var(--color-bg-base)`, fully rounded `border-radius: 9999px`.
* *Hover/Focus State:* Subtle opacity shift to `90%`, elevation transitions smoothly via `transition-all duration-300 ease-out`.


* **Action Chips (e.g., `What's next?`):**
* *Default State:* Border size `1px solid var(--color-text-primary)`, background transparent, font size `body-sm`.
* *Active/Pressed State:* Background color transforms to `var(--color-panel-base)`.



### 4.2 Card Structure

All functional cards (DRESS component panels) must utilize a unified layout profile:

* Rounded border setting: `border-radius: 24px` (Highly smooth, circular child corners).
* Backdrop styling: Crisp base structure tracking over zero-elevation configurations. No drop shadows.
* Structural Division:

```
+-------------------------------------------------------------+
| Icon + Heading-md (Cobalt)                Accent Indicator  |
| Body-sm Text Block (Muted Text)                             |
|                                                             |
| +---------------------------------------------------------+ |
| | Custom Embedded Dynamic Metrics Data Loop Area          | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+

```

### 4.3 Form Ingestion Layouts

* Input fields (such as the primary baseline chat command row) must hide raw programmatic input structures behind soft structural pills.
* Rounded constraints: `rounded-full (9999px)`.
* Padding matrix: Internal vertical spacing at `12px (space-3)`, horizontal alignment at `24px (space-6)`.

---

## 5. Anti-Generic AI Aesthetic Directives

When processing script outputs, creating interface blocks, or composing CSS frameworks, you must explicitly **reject standard SaaS platform layouts**. Avoid the typical dashboards used by generic fitness platforms or tech tools.

* **Ban the Core Black Theme:** Do not generate standard pure black dark modes or bright white light modes. Always default to the off-white cream base (`#FBF9F6`) combined with deep cobalt blue (`#1E2D4A`).
* **Eliminate Aggressive Gamification Elements:** Do not implement intense visual trackers, progress circles, or flame streak counters. These trigger high-stress responses in users managing glycemic fluctuations or cognitive fatigue. Replace them with gentle markers like leaves, soft smiling expressions, and glowing stars.
* **No Linear Dashboards:** Do not structure interfaces into rigid tech grids. Follow an organic, continuous-path layout (inspired by a calming journey map) where actions connect to create a gentle, daily flow.
* **Remove Time Clocks:** Never display hard hour slots (such as *8:00 AM - 9:00 AM*) on primary view screens. Focus entirely on sequential context phases (e.g., *Breakfast, Afternoon, Evening Wind-Down*).
* **Calm Audio Layouts:** Avoid any features that require a sharp alarm or bell sound to end a session. All audio workflows must transition smoothly and continuously into the next context sequence.

```

```