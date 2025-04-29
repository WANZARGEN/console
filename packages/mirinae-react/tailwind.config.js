import mirinaeTailwind from "mirinae-foundation/tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    ...mirinaeTailwind.theme,
  },
  plugins: [...mirinaeTailwind.plugins],
};
