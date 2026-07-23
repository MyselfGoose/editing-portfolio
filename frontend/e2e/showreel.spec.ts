import { expect, test } from "@playwright/test";

async function openShowreelFromHero(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/");
  // Prefer the footer CTA — header control can sit under fixed nav.
  const watchReel = page
    .locator("#hero footer")
    .getByRole("button", { name: "Watch Reel" });
  await expect(watchReel).toBeVisible({ timeout: 15_000 });
  await watchReel.scrollIntoViewIfNeeded();
  await watchReel.click();
}

test.describe("Showreel", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("opens and closes with Escape from hero", async ({ page }) => {
    await openShowreelFromHero(page);

    const dialog = page.getByRole("dialog", { name: "Showreel" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Close showreel" }),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      page.locator("#hero footer").getByRole("button", { name: "Watch Reel" }),
    ).toBeFocused();
  });

  test("closes with close button", async ({ page }) => {
    await openShowreelFromHero(page);
    const dialog = page.getByRole("dialog", { name: "Showreel" });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await dialog.getByRole("button", { name: "Close showreel" }).click();
    await expect(dialog).toBeHidden();
  });

  test("opens from films hero", async ({ page }) => {
    await page.goto("/films");
    await expect(
      page.getByRole("heading", { name: "Films" }),
    ).toBeVisible({ timeout: 15_000 });
    const watchReel = page
      .locator("#films-hero footer")
      .getByRole("button", { name: "Watch Reel" });
    await watchReel.scrollIntoViewIfNeeded();
    await watchReel.click();
    await expect(
      page.getByRole("dialog", { name: "Showreel" }),
    ).toBeVisible();
  });
});
