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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "rgba(255, 255, 255, 0.06)",
        "border-hover": "rgba(255, 255, 255, 0.1)",
        "border-active": "rgba(255, 255, 255, 0.15)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "rgba(255, 255, 255, 0.2)",
        text: {
          primary: "hsl(var(--text-primary) / 1)",
          secondary: "hsl(var(--text-secondary) / 0.6)",
          muted: "hsl(var(--text-muted) / 0.4)",
          subtle: "hsl(var(--text-subtle) / 0.3)",
          label: "rgba(255, 255, 255, 0.5)",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          raised: "#0f0f0f",
          hover: "#141414",
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
          foreground: "hsl(var(--muted-foreground) / 0.5)",
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
      },
      spacing: {
        18: "4.5rem",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
