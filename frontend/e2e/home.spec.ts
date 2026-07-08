import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

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
    await expect(page.locator("#hero")).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Skip to content" });
    for (let i = 0; i < 5; i += 1) {
      const focused = await skipLink.evaluate(
        (el) => el === document.activeElement,
      );
      if (focused) break;
      await page.keyboard.press("Tab");
    }

    await expect(skipLink).toBeFocused();
    await skipLink.click();
    await expect(page.locator("#main")).toBeVisible();
  });
});
