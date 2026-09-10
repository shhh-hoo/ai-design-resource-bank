import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  timeout: 45000,
  reporter: "list",
  outputDir: ".browser-test/results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    channel: process.env.AIDRB_CHROME ? "chrome" : undefined,
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
