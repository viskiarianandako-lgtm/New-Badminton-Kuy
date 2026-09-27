import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors dari design_guidelines.json
        surface: {
          DEFAULT: "#FAFAFA",
          secondary: "#FFFFFF",
          tertiary: "#F5F5F5",
          inverse: "#1A1A1A",
        },
        brand: {
          DEFAULT: "#FF5C00",
          primary: "#FF5C00",
          secondary: "#FFECE0",
          tertiary: "#FFF5F0",
        },
        onSurface: {
          DEFAULT: "#1A1A1A",
          secondary: "#1A1A1A",
          tertiary: "#404040",
          inverse: "#FFFFFF",
        },
        onBrand: {
          DEFAULT: "#FFFFFF",
          primary: "#FFFFFF",
          secondary: "#D94E00",
          tertiary: "#B24000",
        },
        success: "#008A4D",
        warning: "#FFB020",
        error: "#E03030",
        info: "#404040",
        border: "#E5E5E5",
        borderStrong: "#CCCCCC",
        divider: "#F0F0F0",
        muted: "#737373",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "20px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
