/** @type {import('tailwindcss').Config} */
// Tokens lifted verbatim from the former inline Stitch config in www/index.html.
// Build with:  npm run build:css   →   www/assets/tailwind.css
module.exports = {
  content: ["./www/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#071834", "primary-container": "#1e2d4a", "on-primary": "#ffffff",
        "on-primary-container": "#8695b7", "inverse-primary": "#b7c6eb", "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#b7c6eb", "on-primary-fixed": "#0a1b37", "on-primary-fixed-variant": "#384765",
        "secondary": "#58605d", "on-secondary": "#ffffff", "secondary-container": "#d9e1de",
        "on-secondary-container": "#5c6461", "secondary-fixed": "#dce4e0", "secondary-fixed-dim": "#c0c8c5",
        "tertiary": "#221600", "tertiary-container": "#3c2a01", "on-tertiary-container": "#ac915d",
        "tertiary-fixed": "#ffdea4", "tertiary-fixed-dim": "#e1c28a",
        "error": "#ba1a1a", "on-error": "#ffffff", "error-container": "#ffdad6", "on-error-container": "#93000a",
        "background": "#fbf8fb", "background-base": "#FBF9F6", "on-background": "#1b1b1e",
        "surface": "#fbf8fb", "surface-bright": "#fbf8fb", "surface-dim": "#dbd9dc",
        "surface-container-lowest": "#ffffff", "surface-container-low": "#f5f3f6", "surface-container": "#efedf0",
        "surface-container-high": "#eae7ea", "surface-container-highest": "#e4e2e5", "surface-variant": "#e4e2e5",
        "on-surface": "#1b1b1e", "on-surface-variant": "#44474d", "inverse-surface": "#303033", "inverse-on-surface": "#f2f0f3",
        "outline": "#75777e", "outline-variant": "#c5c6ce", "surface-tint": "#505e7e",
        "soft-mint": "#E8F0EC", "text-muted": "#5A6E85",
        "accent-teal": "#CBE7E3", "accent-lavender": "#E3E0F2", "accent-orange": "#F5A97E", "star-glow": "#F7D070"
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
      spacing: { "micro": "4px", "space-2": "8px", "space-3": "12px", "space-4": "16px", "space-6": "24px", "space-8": "32px" },
      fontFamily: {
        "display-xl": ["Playfair Display"], "display-lg": ["Playfair Display"],
        "headline-md": ["Inter"], "body-base": ["Inter"], "body-sm": ["Inter"], "caption": ["Inter"]
      },
      fontSize: {
        "display-xl": ["40px", { "lineHeight": "1.1", "fontWeight": "700" }],
        "display-lg": ["28px", { "lineHeight": "1.2", "fontWeight": "500" }],
        "headline-md": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "body-base": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "300" }],
        "caption": ["12px", { "lineHeight": "1.4", "fontWeight": "500" }]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")],
};
