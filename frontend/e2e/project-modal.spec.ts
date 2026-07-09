import { expect, test, type Page } from "@playwright/test";

test.describe("Project modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  async function openFirstProject(page: Page) {
    await page.goto("/#work");
    const projectButton = page.getByRole("button", {
      name: "Open Carezza Leanne",
    });
    await expect(projectButton).toBeVisible({ timeout: 15_000 });
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();
    const dialog = page.getByRole("dialog", { name: "Carezza Leanne" });
    await expect(dialog).toBeVisible();
    return { projectButton, dialog };
  }

  test("opens from featured work and closes with Escape", async ({ page }) => {
    const { projectButton, dialog } = await openFirstProject(page);

    await expect(dialog.getByRole("button", { name: "Close project" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(projectButton).toBeFocused();
  });

  test("closes when close button is clicked", async ({ page }) => {
    const { dialog } = await openFirstProject(page);

    await dialog.getByRole("button", { name: "Close project" }).click();
    await expect(dialog).toBeHidden();
  });

  test("closes when overlay is clicked", async ({ page }) => {
    const { dialog } = await openFirstProject(page);

    await dialog.click({ position: { x: 8, y: 8 } });
    await expect(dialog).toBeHidden();
  });

  test("opens second project Meghan and Edward", async ({ page }) => {
    await page.goto("/#work");
    const projectButton = page.getByRole("button", {
      name: "Open Meghan and Edward",
    });
    await expect(projectButton).toBeVisible({ timeout: 15_000 });
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();
    const dialog = page.getByRole("dialog", { name: "Meghan and Edward" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Meghan and Edward" }),
    ).toBeVisible();
  });

  test("deep link opens modal", async ({ page }) => {
    await page.goto("/?project=carezza-leanne");
    const dialog = page.getByRole("dialog", { name: "Carezza Leanne" });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(
      dialog.getByRole("heading", { name: "Carezza Leanne" }),
    ).toBeVisible();
  });

  test("captioned project still opens successfully", async ({ page }) => {
    await page.goto("/?project=carezza-leanne");
    const dialog = page.getByRole("dialog", { name: "Carezza Leanne" });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByRole("heading", { name: "Carezza Leanne" })).toBeVisible();
  });
});
