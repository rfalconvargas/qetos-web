---
name: Metabolic Editorial
colors:
  surface: '#fbf8fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#fbf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#303033'
  inverse-on-surface: '#f2f0f3'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#505e7e'
  primary: '#071834'
  on-primary: '#ffffff'
  primary-container: '#1e2d4a'
  on-primary-container: '#8695b7'
  inverse-primary: '#b7c6eb'
  secondary: '#58605d'
  on-secondary: '#ffffff'
  secondary-container: '#d9e1de'
  on-secondary-container: '#5c6461'
  tertiary: '#221600'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c2a01'
  on-tertiary-container: '#ac915d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b7c6eb'
  on-primary-fixed: '#0a1b37'
  on-primary-fixed-variant: '#384765'
  secondary-fixed: '#dce4e0'
  secondary-fixed-dim: '#c0c8c5'
  on-secondary-fixed: '#161d1b'
  on-secondary-fixed-variant: '#414846'
  tertiary-fixed: '#ffdea4'
  tertiary-fixed-dim: '#e1c28a'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#584417'
  background: '#fbf8fb'
  on-background: '#1b1b1e'
  surface-variant: '#e4e2e5'
  background-base: '#FBF9F6'
  text-muted: '#5A6E85'
  accent-teal: '#CBE7E3'
  accent-lavender: '#E3E0F2'
  accent-orange: '#F5A97E'
  star-glow: '#F7D070'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
  display-lg:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '300'
    lineHeight: '1.5'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  micro: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-6: 24px
  space-8: 32px
---

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
