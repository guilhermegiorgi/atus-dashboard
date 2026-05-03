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
          primary: "var(--dd-primary)",
          surface: "var(--dd-surface)",
          "surface-raised": "var(--dd-surface-raised)",
          "surface-overlay": "var(--dd-surface-overlay)",
          border: "var(--dd-border)",
          "border-subtle": "var(--dd-border-subtle)",
          secondary: "var(--dd-secondary)",
          muted: "var(--dd-muted)",
          "on-primary": "var(--dd-on-primary)",
          "on-surface": "var(--dd-on-surface)",
          "on-muted": "var(--dd-on-muted)",
          /* Accents */
          green: "var(--dd-accent-green)",
          "green-hover": "var(--dd-accent-green-hover)",
          "green-muted": "var(--dd-accent-green-muted)",
          pink: "var(--dd-accent-pink)",
          "pink-muted": "var(--dd-accent-pink-muted)",
          purple: "var(--dd-accent-purple)",
          "purple-muted": "var(--dd-accent-purple-muted)",
          orange: "var(--dd-accent-orange)",
          "orange-muted": "var(--dd-accent-orange-muted)",
          blue: "var(--dd-accent-blue)",
          "blue-muted": "var(--dd-accent-blue-muted)",
          red: "var(--dd-accent-red)",
          "red-hover": "var(--dd-accent-red-hover)",
          "red-muted": "var(--dd-accent-red-muted)",
          /* Badges */
          "badge-new": "var(--dd-badge-new)",
          "badge-waiting": "var(--dd-badge-waiting)",
          "badge-urgent": "var(--dd-badge-urgent)",
          "badge-urgent-bg": "var(--dd-badge-urgent-bg)",
          "badge-indicated": "var(--dd-badge-indicated)",
          "badge-bot-bg": "var(--dd-badge-bot-bg)",
          "badge-human-bg": "var(--dd-badge-human-bg)",
          "badge-human": "var(--dd-badge-human)",
          /* States */
          "conversation-active": "var(--dd-conversation-active)",
          "conversation-hover": "var(--dd-conversation-hover)",
          scrollbar: "var(--dd-scrollbar)",
          selection: "var(--dd-selection)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border) / 0.5)",
        "border-hover": "hsl(var(--border-hover) / 0.8)",
        "border-active": "hsl(var(--border-active) / 0.8)",
        input: "hsl(var(--input) / 0.8)",
        ring: "hsl(var(--ring) / 0.2)",
        text: {
          primary: "hsl(var(--text-primary) / 1)",
          secondary: "hsl(var(--text-secondary) / 0.83)",
          muted: "hsl(var(--text-muted) / 0.6)",
          subtle: "hsl(var(--text-muted) / 0.4)",
          label: "rgba(154, 154, 154, 0.8)",
        },
        surface: {
          DEFAULT: "var(--dd-surface)",
          raised: "var(--dd-surface-raised)",
          hover: "var(--dd-surface-overlay)",
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
