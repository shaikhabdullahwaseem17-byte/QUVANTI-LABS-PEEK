/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── EURO-CHIC TYPOGRAPHY ENGINE ────────────────────────────
      fontFamily: {
        heading: ["var(--font-heading)", "Helvetica Neue", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      // ── QUVANTI SPACING & SIZING ───────────────────────────────
      letterSpacing: {
        "ultra-tight": "-0.06em",
        tighter: "-0.05em",
        tight: "-0.03em",
        editorial: "-0.04em",
      },

      // ── QUVANTI COLOUR TOKENS ──────────────────────────────────
      colors: {
        void: "#080B10",
        deep: "#0D1117",
        obsidian: "#050505",
        accent: "#5B8CFF",
        "accent-2": "#8A7CFF",
        "accent-3": "#34D399",
      },

      // ── BORDER RADIUS ──────────────────────────────────────────
      borderRadius: {
        card: "16px",
        btn: "12px",
        pill: "999px",
      },

      // ── BOX SHADOWS ───────────────────────────────────────────
      boxShadow: {
        float: "0 8px 40px rgba(0,0,0,0.55), 0 2px 12px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(91,140,255,0.12)",
        "glow-white": "0 0 40px rgba(255,255,255,0.08)",
      },

      // ── BACKDROP BLUR ─────────────────────────────────────────
      backdropBlur: {
        glass: "20px",
        deep: "40px",
      },
    },
  },
  plugins: [],
};



