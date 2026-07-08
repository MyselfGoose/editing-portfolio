import { expect, test } from "@playwright/test";

test.describe("Section navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("hash navigation reveals target sections", async ({ page }) => {
    await page.goto("/#work");
    await expect(page.locator("#work")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Each project is a chapter/i }),
    ).toBeVisible();

    await page.goto("/#contact");
    await expect(page.locator("#contact")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Ready to tell/i }),
    ).toBeVisible();
  });

  test("work section lists all projects", async ({ page }) => {
    await page.goto("/#work");

    await expect(page.getByText("Carezza Leanne")).toBeVisible();
    await expect(page.getByText("Meghan and Edward")).toBeVisible();
    await expect(page.getByText("Elvira")).toBeVisible();
    await expect(page.getByText("Dominguez Quince")).toBeVisible();
  });
});
