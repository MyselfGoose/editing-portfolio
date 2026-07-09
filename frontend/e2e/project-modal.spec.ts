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
    await expect(page.getByRole("dialog")).toBeVisible();
    return projectButton;
  }

  test("opens from featured work and closes with Escape", async ({ page }) => {
    const projectButton = await openFirstProject(page);
    const dialog = page.getByRole("dialog");

    await expect(dialog.getByRole("button", { name: "Close project" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(projectButton).toBeFocused();
  });

  test("closes when close button is clicked", async ({ page }) => {
    await openFirstProject(page);

    await page.getByRole("button", { name: "Close project" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("closes when overlay is clicked", async ({ page }) => {
    await openFirstProject(page);

    await page.getByRole("dialog").click({ position: { x: 8, y: 8 } });
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("opens second project Meghan and Edward", async ({ page }) => {
    await page.goto("/#work");
    const projectButton = page.getByRole("button", {
      name: "Open Meghan and Edward",
    });
    await expect(projectButton).toBeVisible({ timeout: 15_000 });
    await projectButton.scrollIntoViewIfNeeded();
    await projectButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("dialog").getByRole("heading", { name: "Meghan and Edward" }),
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
});
