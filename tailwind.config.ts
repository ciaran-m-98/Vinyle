import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#191815",
        paper: "#f7f4ed",
        lime: "#d8f36a",
      },
    },
  },
  plugins: [],
};

export default config;
