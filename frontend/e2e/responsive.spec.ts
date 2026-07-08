import { expect, test } from "@playwright/test";

test.describe("Responsive layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("320px viewport has no horizontal overflow on home", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);
    await expect(page.locator("#hero")).toBeVisible();
  });

  test("375px viewport shows mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toBeVisible();
  });

  test("1024px viewport hides mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toHaveCount(0);
  });

  test("contact CTA fits at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/#contact");

    const cta = page.getByRole("link", { name: /START A PROJECT/i });
    await expect(cta).toBeVisible({ timeout: 15_000 });

    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(320);
    }
  });
});
