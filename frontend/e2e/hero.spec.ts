import { expect, test } from "@playwright/test";

test.describe("Hero audio", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("audio toggle changes muted state on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Unmute hero video" });
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Mute hero video" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
