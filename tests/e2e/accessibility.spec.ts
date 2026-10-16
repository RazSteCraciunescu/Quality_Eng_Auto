import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("dashboard has no automatically detectable critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("3 releases shown.")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious).toEqual([]);
});
