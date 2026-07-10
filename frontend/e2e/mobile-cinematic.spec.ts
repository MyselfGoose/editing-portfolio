import { expect, test } from "@playwright/test";

test.describe("Mobile cinematic features", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test("hero mounts ambient video on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero")).toBeVisible();

    const heroVideo = page.locator("#hero video, #hero mux-video");
    await expect(heroVideo.first()).toBeAttached({ timeout: 15_000 });

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const video = document.querySelector(
              "#hero video",
            ) as HTMLVideoElement | null;
            return video !== null;
          }),
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test("process scroll-pin advances stages on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#process")).toBeVisible();

    const stageCounter = page.locator("#process").getByText(/Stage \d{2} \/ 03/);
    await expect(stageCounter.first()).toContainText("Stage 01 / 03");

    await page.evaluate(() => {
      const process = document.getElementById("process");
      if (!process) return;
      const top = process.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + window.innerHeight * 0.75, behavior: "instant" });
    });

    await expect(
      page.locator("#process img").first(),
    ).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() => {
      const process = document.getElementById("process");
      if (!process) return;
      const top = process.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + window.innerHeight * 2.5, behavior: "instant" });
    });

    await expect
      .poll(async () => stageCounter.first().textContent(), { timeout: 15_000 })
      .toMatch(/Stage 0[2-3] \/ 03/);
  });
});

test.describe("Desktop process scroll-pin", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("process header stays visible while scrubbing stages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#process")).toBeVisible();

    const processHeader = page
      .locator("#process")
      .getByText("02 / The Process / Post-Production");
    await expect(processHeader.first()).toBeVisible();

    await page.evaluate(() => {
      const process = document.getElementById("process");
      if (!process) return;
      const top = process.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + window.innerHeight * 2.5, behavior: "instant" });
    });

    await expect(processHeader.first()).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator("#process").getByText(/Stage 0[2-3] \/ 03/).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
