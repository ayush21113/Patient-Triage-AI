import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  use: {
    baseURL: "http://127.0.0.1:4190",
    channel: "chrome",
    viewport: { width: 1280, height: 800 }
  }
});
