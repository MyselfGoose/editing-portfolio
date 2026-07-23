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
    await expect(
      page.getByRole("navigation", { name: "Site navigation" }).getByRole("link", {
        name: "Contact",
      }),
    ).toBeVisible();
  });

  test("contact form submit button fits at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/contact");

    const cta = page.getByRole("button", { name: "Send Message" });
    await expect(cta).toBeVisible({ timeout: 15_000 });

    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(320);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);
  });

  test("privacy page has no horizontal overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/privacy");

    await expect(
      page.getByRole("heading", { name: "Privacy policy" }),
    ).toBeVisible();

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);
  });

  test("film page and showreel fit at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/films/carezza-leanne");
    await expect(
      page.getByRole("heading", { name: "Carezza Leanne", level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    await page.goto("/");
    await page.getByRole("button", { name: "Watch Carezza" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Carezza Leanne" });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: "Close film" });
    const box = await close.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  });

  test("film page has no horizontal overflow at 768 and 1024", async ({
    page,
  }) => {
    for (const width of [768, 1024] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/films/carezza-leanne");
      await expect(
        page.getByRole("heading", { name: "Carezza Leanne", level: 1 }),
      ).toBeVisible({ timeout: 15_000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
      ).toBe(false);
    }
  });
});
