import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* DarkDesk Design Tokens */
        dd: {
          primary: "#0F0F0F",
          surface: "#1A1A1A",
          "surface-raised": "#242424",
          "surface-overlay": "#2E2E2E",
          border: "#3A3A3A",
          "border-subtle": "#2A2A2A",
          secondary: "#6B6B6B",
          muted: "#4A4A4A",
          "on-primary": "#F0F0F0",
          "on-surface": "#D4D4D4",
          "on-muted": "#9A9A9A",
          /* Accents */
          green: "#1DB954",
          "green-muted": "#1A3A28",
          pink: "#E91E8C",
          "pink-muted": "#3A1228",
          purple: "#8B5CF6",
          "purple-muted": "#2A1A4A",
          orange: "#F97316",
          "orange-muted": "#3A2010",
          blue: "#3B82F6",
          "blue-muted": "#0F1E3A",
          /* Badges */
          "badge-new": "#1DB954",
          "badge-waiting": "#F97316",
          "badge-urgent": "#EF4444",
          "badge-indicated": "#8B5CF6",
          /* States */
          "conversation-active": "#1E2A1E",
          "conversation-hover": "#1E1E1E",
          scrollbar: "#3A3A3A",
          selection: "#1E3A2E",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "rgba(58, 58, 58, 0.5)",
        "border-hover": "rgba(58, 58, 58, 0.8)",
        "border-active": "rgba(107, 107, 107, 0.8)",
        input: "rgba(36, 36, 36, 0.8)",
        ring: "rgba(240, 240, 240, 0.2)",
        text: {
          primary: "hsl(var(--text-primary) / 1)",
          secondary: "hsl(var(--text-secondary) / 0.83)",
          muted: "hsl(var(--text-muted) / 0.6)",
          subtle: "hsl(var(--text-muted) / 0.4)",
          label: "rgba(154, 154, 154, 0.8)",
        },
        surface: {
          DEFAULT: "#1A1A1A",
          raised: "#242424",
          hover: "#2E2E2E",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground) / 0.6)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
        xs: "4px",
        dd: "8px",
        "dd-lg": "12px",
        "dd-full": "9999px",
      },
      spacing: {
        "dd-xs": "4px",
        "dd-sm": "8px",
        "dd-md": "12px",
        "dd-lg": "16px",
        "dd-xl": "24px",
        "dd-xxl": "32px",
        18: "4.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        h1: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["1.125rem", { lineHeight: "1.35", fontWeight: "600" }],
        h3: ["0.9375rem", { lineHeight: "1.4", fontWeight: "500" }],
        "body-md": ["0.875rem", { lineHeight: "1.5" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.45" }],
        label: ["0.75rem", { lineHeight: "1.3", fontWeight: "500" }],
        "label-caps": [
          "0.6875rem",
          { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.06em" },
        ],
        timestamp: ["0.6875rem", { lineHeight: "1.2" }],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      width: {
        sidebar: "64px",
        "conversation-list": "320px",
      },
      minWidth: {
        "conversation-list": "320px",
      },
      maxWidth: {
        "conversation-list": "320px",
      },
      animation: {
        "slide-in-right": "slideInRight 0.25s ease-out forwards",
        "slide-in-up": "slideInUp 0.2s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "pulse-gentle": "pulse-gentle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
