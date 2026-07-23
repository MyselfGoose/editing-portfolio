import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
] as const;

test.describe("Visual regression", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  for (const viewport of VIEWPORTS) {
    test(`home snapshot (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");
      await expect(page.locator("#hero")).toBeVisible();
      await expect(page.locator("#contact")).not.toBeAttached();
      await expect(page.getByRole("link", { name: "Get in touch" })).toBeVisible();
      await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.06,
        timeout: 15_000,
      });
    });
  }

  test("project modal snapshot (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#work");
    const projectButton = page.getByRole("button", {
      name: "Open Carezza Leanne",
    });
    await expect(projectButton).toBeVisible({ timeout: 15_000 });
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();
    await expect(
      page.getByRole("dialog", { name: "Carezza Leanne" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveScreenshot("modal-desktop.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.06,
      timeout: 15_000,
    });
  });
});
