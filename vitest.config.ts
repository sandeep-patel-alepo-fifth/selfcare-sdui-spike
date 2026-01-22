import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM testing
    environment: "jsdom",
    // Global test setup file
    setupFiles: ["./src/test/setup.ts"],
    // Include test files
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Exclude node_modules and build output
    exclude: ["node_modules", ".next", "out"],
    // Enable globals (describe, it, expect) without imports
    globals: true,
    // CSS handling
    css: true,
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
