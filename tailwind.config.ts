import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        leaf: "#1f8a5b",
        tomato: "#df4f3d",
        saffron: "#f2b84b",
        cloud: "#f7f5ef"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 27, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
