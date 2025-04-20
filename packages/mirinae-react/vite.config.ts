import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })] as any,
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MirinaeReact",
      formats: ["es", "umd"],
      fileName: (format) => `mirinae.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
      components: resolve(__dirname, "./src/components"),
      hooks: resolve(__dirname, "./src/hooks"),
      utils: resolve(__dirname, "./src/utils"),
    },
  },
});
