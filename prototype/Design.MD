# DESIGN.md — System Rules & Front-End Guidelines
**Product Identity:** Ketofy (Formerly Mytabolism v3)
**Core Engine Logic:** Proactive, Inquisitive, Functional Metabolic & Mental Health UI

## 1. Typography Scale
- Display XL: 2.5rem (40px) / Leading 1.1 / Weight: Bold / Family: Editorial Serif (Playfair Display, Georgia)
- Display LG: 1.75rem (28px) / Leading 1.2 / Weight: Medium / Family: Editorial Serif
- Heading MD: 1.25rem (20px) / Leading 1.4 / Weight: SemiBold / Family: Clean Sans (Inter, -apple-system)
- Body Base: 1.0rem (16px) / Leading 1.6 / Weight: Regular / Family: Clean Sans
- Body SM: 0.875rem (14px) / Leading 1.5 / Weight: Light / Family: Clean Sans
- Caption: 0.75rem (12px) / Leading 1.4 / Weight: Medium / Family: Clean Sans

## 2. Spacing System (8px Base Grid)
- Multipliers: 4px (micro), 8px (space-2), 12px (space-3), 16px (space-4/cards), 24px (space-6), 32px (space-8/margins). All element spacing must satisfy: Margin_Padding MOD 8 == 0.

## 3. Color Tokens
- --color-bg-base:      #FBF9F6 (Warm editorial cream / off-white)
- --color-panel-base:   #E8F0EC (Gentle organic soft mint green panels)
- --color-text-primary: #1E2D4A (Deep rich cobalt blue for text and primary UI elements)
- --color-text-muted:   #5A6E85 (Softened slate tone for secondary body metadata)
- --color-accent-teal:  #CBE7E3 (Diet / Data validation elements)
- --color-accent-lav:   #E3E0F2 (Rest / Sleep & recovery tracking elements)
- --color-accent-orange:#F5A97E (Muted notification pips and active status highlights)
- --color-star-glow:    #F7D070 (Compassionate win markers)

## 4. Component Patterns
- Primary Action Pill: Fully rounded (border-radius: 9999px), primary text/bg color, clean transition scaling on interactive press.
- Functional Cards: Smooth circular borders (border-radius: 24px), completely flat zero-elevation layout styling with no aggressive shadow masks.
- Form Inputs: Enclosed within soft rounded-full layout pills with 12px vertical and 24px horizontal padding.

## 5. Anti-Generic AI Aesthetic Directives
- STRICTLY BAN standard pure dark modes or bright white themes. Default to the cream base and cobalt typography.
- ELIMINATE standard fitness tech grids, progress circles, and aggressive streak numbers. Replace them with glowing stars, leaves, or gentle natural markers.
- REMOVE strict hour slots and numerical clocks from primary views. Organize by sequential blocks (Breakfast, Afternoon, Evening Wind-Down).