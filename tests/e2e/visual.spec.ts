import { expect, test } from "@playwright/test";

test("release workspace visual baseline", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "The committed visual baseline is maintained for Chromium.");
  await page.setViewportSize({ width: 850, height: 720 });
  await page.goto("/");
  const workspace = page.getByTestId("release-workspace");
  await expect(workspace).toBeVisible();
  await expect(workspace).toHaveScreenshot("release-workspace.png", {
    animations: "disabled",
    caret: "hide",
    maxDiffPixelRatio: 0.01
  });
});
