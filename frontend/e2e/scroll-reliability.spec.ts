import { expect, test } from "@playwright/test";

const PROCESS_HEADLINES = [
  "We find the best parts",
  "The vision and structure are formed",
  "Bringing out the colors",
  "The film leaves the timeline.",
] as const;

const PROCESS_STAGE_OFFSETS = [0.5, 1.5, 2.5, 3.5] as const;

async function scrubProcessToStageOffset(
  page: import("@playwright/test").Page,
  pinStartScroll: number,
  viewportHeight: number,
  stageOffset: number,
): Promise<void> {
  const scrollTop = pinStartScroll + viewportHeight * stageOffset;
  await page.evaluate((top) => {
    if (window.__portfolioScrollTo) {
      window.__portfolioScrollTo(top);
    } else {
      window.scrollTo({ top, behavior: "instant" });
    }
  }, scrollTop);
}

test.describe("Scroll reliability", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("process headline matches stage while scrubbing on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("#process")).toBeVisible();

    const { pinStartScroll, viewportHeight } = await page.evaluate(() => {
      const process = document.getElementById("process");
      const pinStartScroll =
        process !== null
          ? process.getBoundingClientRect().top + window.scrollY
          : window.scrollY;
      return { pinStartScroll, viewportHeight: window.innerHeight };
    });

    for (let stage = 0; stage < PROCESS_HEADLINES.length; stage += 1) {
      const headline = PROCESS_HEADLINES[stage];
      const offsetCandidates = [
        PROCESS_STAGE_OFFSETS[stage],
        PROCESS_STAGE_OFFSETS[stage] - 0.25,
        PROCESS_STAGE_OFFSETS[stage] + 0.25,
      ];

      await expect
        .poll(
          async () => {
            for (const offset of offsetCandidates) {
              await scrubProcessToStageOffset(
                page,
                pinStartScroll,
                viewportHeight,
                offset,
              );
              const activeStage = page.locator(
                `#process [data-active-stage="${stage}"]`,
              );
              if (
                await activeStage
                  .getByRole("heading", { name: headline })
                  .isVisible()
              ) {
                return true;
              }
            }
            return false;
          },
          { timeout: 15_000 },
        )
        .toBe(true);

      const stageLabel = `Stage 0${stage + 1} / 04`;
      await expect(
        page.locator("#process").getByText(stageLabel).first(),
      ).toBeVisible();
    }
  });

  test("home page scroll reaches contact CTA after services", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("#services")).toBeVisible();

    await page.evaluate(() => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      window.scrollTo({ top: maxScroll, behavior: "instant" });
    });

    await expect(page.locator("#contact-cta")).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /Ready to craft your cinematic story/i }),
    ).toBeVisible();
  });

  test("contact page resets scroll after navigating from deep home scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("#services")).toBeVisible();

    await page.evaluate(() => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      );
      window.scrollTo({ top: maxScroll, behavior: "instant" });
    });

    await page
      .getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", { name: "Contact" })
      .click();

    await expect(page).toHaveURL(/\/contact$/);

    await expect
      .poll(async () => page.evaluate(() => window.scrollY), {
        timeout: 10_000,
      })
      .toBeLessThan(50);

    await expect(
      page.getByRole("heading", { name: /Ready to craft your cinematic story/i }),
    ).toBeVisible();
  });
});
