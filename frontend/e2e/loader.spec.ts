import { expect, test } from "@playwright/test";

const LOADER_KEY = "gp:loader-played";

test.describe("Cinematic loader", () => {
  test("plays on first visit then dismisses", async ({ page }) => {
    await page.addInitScript((key) => {
      window.sessionStorage.removeItem(key);
    }, LOADER_KEY);

    await page.goto("/");

    await expect(page.getByText("WELCOME TO")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("WELCOME TO")).toBeHidden({ timeout: 15_000 });
    await expect(page.locator("#hero")).toBeVisible();
  });

  test("is skipped on repeat visit in the same session", async ({ page }) => {
    await page.addInitScript((key) => {
      window.sessionStorage.setItem(key, "1");
    }, LOADER_KEY);

    await page.goto("/");

    await expect(page.getByText("WELCOME TO")).toHaveCount(0);
    await expect(page.locator("#hero")).toBeVisible();
  });
});
