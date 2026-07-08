import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads with hero and main sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.getByRole("heading", { name: /We don't edit videos/i })).toBeVisible();
    await expect(page.locator("#about")).toBeAttached();
    await expect(page.locator("#work")).toBeAttached();
    await expect(page.locator("#services")).toBeAttached();
    await expect(page.locator("#contact")).toBeAttached();
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeFocused();
    await skipLink.click();
    await expect(page.locator("#main")).toBeVisible();
  });
});
