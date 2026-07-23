import { expect, test } from "@playwright/test";

test.describe("Experience shell modes", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("contact uses light shell without cinematic chrome", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.dataset.experienceMode ?? "",
        ),
      )
      .toBe("light");

    await expect(page.locator(".film-grain")).toHaveCount(0);
    await expect(page.locator(".cursor-layer")).toHaveCount(0);

    await expect
      .poll(async () =>
        page.evaluate(() => typeof window.__portfolioScrollTo),
      )
      .toBe("undefined");
  });

  test("home uses cinematic shell after returning from contact", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");
    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.dataset.experienceMode ?? "",
        ),
      )
      .toBe("light");

    await page
      .getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", { name: "Home" })
      .click();

    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.dataset.experienceMode ?? "",
        ),
      )
      .toBe("cinematic");

    await expect(page.locator(".film-grain")).toHaveCount(1);
    await expect(page.locator("#process")).toBeVisible();
  });

  test("showreel navigation clears body overflow lock", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const watchReel = page
      .locator("#hero footer")
      .getByRole("button", { name: "Watch Reel" });
    await expect(watchReel).toBeVisible({ timeout: 15_000 });
    await watchReel.scrollIntoViewIfNeeded();
    await watchReel.click();

    await expect(page.getByRole("dialog", { name: "Showreel" })).toBeVisible();

    await expect
      .poll(async () =>
        page.evaluate(() => document.body.style.overflow),
      )
      .toBe("hidden");

    // Soft-nav via URL — showreel dialog sits above desktop nav links.
    await page.goto("/films");
    await expect(page).toHaveURL(/\/films$/);
    await expect(page.getByRole("dialog", { name: "Showreel" })).toHaveCount(0);

    await expect
      .poll(async () =>
        page.evaluate(() => document.body.style.overflow),
      )
      .toBe("");
  });
});

test.describe("Film open graph images", () => {
  test("per-slug OG endpoint returns a PNG", async ({ request }) => {
    const response = await request.get(
      "/films/carezza-leanne/opengraph-image",
    );
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/image\/png/);
    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(1_000);
  });
});
