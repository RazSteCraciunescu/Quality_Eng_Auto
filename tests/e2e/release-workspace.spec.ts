import { expect, test } from "@playwright/test";

test("filters the workspace and opens supporting evidence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Release Readiness Lab" })).toBeVisible();
  await expect(page.getByText("3 releases shown.")).toBeVisible();

  await page.getByRole("button", { name: "Conditional", exact: true }).click();
  await expect(page.getByText("1 release shown.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Borealis" })).toBeVisible();

  await page.getByRole("button", { name: "View details" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Borealis 5.0.0-rc.2" })).toBeVisible();
  await expect(dialog.getByText("Coverage below 85% (78.3%)")).toBeVisible();
});

test("search is case-insensitive and supports environment values", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search" }).fill("STAGING");
  await expect(page.getByText("2 releases shown.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Aurora" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cirrus" })).toBeVisible();
});
