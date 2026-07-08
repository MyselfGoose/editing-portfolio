import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test-utils/**",
        "src/app/**",
        // Animation-heavy / shell components covered by e2e tests
        "src/components/experience/ExperienceShell.tsx",
        "src/components/experience/SmoothScroll.tsx",
        "src/components/experience/TransitionManager.tsx",
        "src/components/sections/Hero.tsx",
        "src/components/sections/HeroBackdrop.tsx",
        "src/components/sections/HeroPlayerBoundary.tsx",
        "src/components/sections/Process.tsx",
        "src/components/sections/About.tsx",
        "src/components/sections/Services.tsx",
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 60,
        statements: 75,
      },
    },
  },
});
