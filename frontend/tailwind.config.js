/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "#fff" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "#fff" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "#fff" },
        ring: "hsl(var(--ring))",
      },
      borderRadius: { lg: "0.5rem", md: "0.375rem", sm: "0.25rem" },
      fontFamily: { sans: ["Fira Sans","Inter","system-ui"], mono: ["Fira Code","monospace"] },
      boxShadow: { card: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)" }
    }
  },
  plugins: [],
}
