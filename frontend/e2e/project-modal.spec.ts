import { expect, test } from "@playwright/test";

test.describe("Project modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("opens from featured work and closes with Escape", async ({ page }) => {
    await page.goto("/#work");

    const projectButton = page.getByRole("button", { name: /Open \[/i }).first();
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close project" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(projectButton).toBeFocused();
  });

  test("closes when close button is clicked", async ({ page }) => {
    await page.goto("/#work");

    const projectButton = page.getByRole("button", { name: /Open \[/i }).first();
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();

    await page.getByRole("button", { name: "Close project" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
