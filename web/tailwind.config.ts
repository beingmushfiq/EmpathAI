import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      colors: {
        // Brand core
        brand: {
          50:  "hsl(250, 100%, 97%)",
          100: "hsl(250, 95%, 92%)",
          200: "hsl(252, 90%, 84%)",
          300: "hsl(255, 85%, 74%)",
          400: "hsl(258, 80%, 64%)",
          500: "hsl(261, 75%, 55%)",  // primary
          600: "hsl(263, 72%, 46%)",
          700: "hsl(265, 70%, 38%)",
          800: "hsl(267, 67%, 28%)",
          900: "hsl(270, 65%, 18%)",
        },
        // Accent (warm pink/rose)
        accent: {
          50:  "hsl(330, 100%, 97%)",
          100: "hsl(330, 95%, 90%)",
          200: "hsl(330, 85%, 80%)",
          300: "hsl(330, 78%, 68%)",
          400: "hsl(330, 73%, 58%)",
          500: "hsl(330, 70%, 50%)",
          600: "hsl(330, 67%, 42%)",
        },
        // Surface system
        surface: {
          glass: "rgba(255, 255, 255, 0.06)",
          "glass-strong": "rgba(255, 255, 255, 0.12)",
          base: "hsl(240, 15%, 6%)",
          elevated: "hsl(240, 13%, 9%)",
          overlay: "hsl(240, 12%, 12%)",
          border: "rgba(255, 255, 255, 0.08)",
          "border-subtle": "rgba(255, 255, 255, 0.04)",
        },
        // Semantic
        success: "hsl(142, 70%, 50%)",
        warning: "hsl(38, 95%, 55%)",
        danger: "hsl(0, 75%, 58%)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero": "linear-gradient(135deg, hsl(240,15%,6%) 0%, hsl(255,30%,10%) 50%, hsl(240,15%,6%) 100%)",
        "gradient-brand": "linear-gradient(135deg, hsl(261,75%,55%) 0%, hsl(330,70%,50%) 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, hsla(261,75%,55%,0.15) 0%, hsla(330,70%,50%,0.15) 100%)",
        "gradient-glow": "radial-gradient(ellipse at 50% 0%, hsla(261,75%,55%,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glass-sm": "0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
        brand: "0 0 30px hsla(261, 75%, 55%, 0.4), 0 0 60px hsla(261, 75%, 55%, 0.15)",
        "brand-sm": "0 0 15px hsla(261, 75%, 55%, 0.3)",
        glow: "0 0 40px hsla(261, 75%, 70%, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
