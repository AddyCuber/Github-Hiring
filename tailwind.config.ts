import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#24292e",
        accent: "#0366d6",
        success: "#28a745",
        border: "#e1e4e8"
      }
    }
  },
  plugins: []
}

export default config
