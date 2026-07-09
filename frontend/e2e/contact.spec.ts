import { expect, test } from "@playwright/test";

test.describe("Contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("mailto href present", async ({ page }) => {
    await page.goto("/#contact");

    const mailto = page.locator('a[href="mailto:info@gooseproductions.com"]').first();
    await expect(mailto).toBeVisible({ timeout: 15_000 });
  });
});
