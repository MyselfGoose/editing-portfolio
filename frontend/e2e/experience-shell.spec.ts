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

  test("privacy uses light shell", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/privacy");

    await expect
      .poll(async () =>
        page.evaluate(
          () => document.documentElement.dataset.experienceMode ?? "",
        ),
      )
      .toBe("light");

    await expect(page.locator(".film-grain")).toHaveCount(0);
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

  test("showreel soft-nav clears body overflow lock and veil", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const watchReel = page
      .locator("#hero footer")
      .getByRole("button", { name: "Watch Carezza" });
    await expect(watchReel).toBeVisible({ timeout: 15_000 });
    await watchReel.scrollIntoViewIfNeeded();
    await watchReel.click();

    await expect(
      page.getByRole("dialog", { name: "Carezza Leanne" }),
    ).toBeVisible();

    await expect
      .poll(async () =>
        page.evaluate(() => document.body.style.overflow),
      )
      .toBe("hidden");

    // Soft-nav via header Films link (not hard goto).
    await page.getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", { name: "Films" })
      .click();
    await expect(page).toHaveURL(/\/films$/);
    await expect(
      page.getByRole("dialog", { name: "Carezza Leanne" }),
    ).toHaveCount(0);

    await expect
      .poll(async () =>
        page.evaluate(() => document.body.style.overflow),
      )
      .toBe("");

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const veil = document.querySelector<HTMLElement>("[data-route-veil]");
          if (!veil) return "0";
          return window.getComputedStyle(veil).opacity;
        }),
      )
      .toBe("0");
  });
});

test.describe("Film open graph images", () => {
  test("per-slug OG endpoints return compressed JPEGs", async ({ request }) => {
    for (const slug of ["carezza-leanne", "meghan-and-edward"] as const) {
      const response = await request.get(`/films/${slug}/opengraph-image`);
      expect(response.status()).toBe(200);
      const contentType = response.headers()["content-type"] ?? "";
      expect(contentType).toMatch(/image\/jpeg/);
      const body = await response.body();
      expect(body.byteLength).toBeGreaterThan(1_000);
      expect(body.byteLength).toBeLessThan(350_000);
    }
  });
});
