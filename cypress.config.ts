import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL ?? "http://127.0.0.1:4173",
    specPattern: "tests/cypress/e2e/**/*.cy.ts",
    supportFile: false,
    video: false
  }
});
