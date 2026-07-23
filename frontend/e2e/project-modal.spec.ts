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

    await expect(page).not.toHaveURL(/[?&]project=/);
    await expect(
      dialog.getByRole("button", { name: "Close project" }),
    ).toBeFocused();

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

    await dialog.click({ position: { x: 8, y: 120 } });
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

  test("legacy deep link redirects to film page", async ({ page }) => {
    await page.goto("/?project=carezza-leanne");
    await expect(page).toHaveURL(/\/films\/carezza-leanne$/);
    await expect(
      page.getByRole("heading", { name: "Carezza Leanne", level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("modal offers open film page and adjacent navigation", async ({
    page,
  }) => {
    const { dialog } = await openFirstProject(page);
    await expect(
      dialog.getByRole("link", { name: "Open film page" }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Next film" }),
    ).toBeVisible();
  });
});
