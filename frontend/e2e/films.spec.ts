import { expect, test } from "@playwright/test";

test.describe("Films page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("renders films hero and index", async ({ page }) => {
    await page.goto("/films");
    const heading = page.getByRole("heading", { name: "Films" });
    await expect(heading).toBeVisible({ timeout: 15_000 });

    const filmRow = page.getByRole("button", {
      name: /Carezza Leanne/,
    });
    await expect(filmRow).toBeVisible();
  });

  test("filter rail narrows results", async ({ page }) => {
    await page.goto("/films");
    await expect(
      page.getByRole("heading", { name: "Films" }),
    ).toBeVisible({ timeout: 15_000 });

    const birthdayTab = page.getByRole("tab", { name: /Birthday/i });
    await expect(birthdayTab).toBeVisible();
    await birthdayTab.click();

    const weddingRow = page.getByRole("button", {
      name: /Carezza Leanne/,
    });
    await expect(weddingRow).toBeHidden();

    const birthdayRow = page.getByRole("button", {
      name: /Dominguez Quince/,
    });
    await expect(birthdayRow).toBeVisible();
  });

  test("film row opens modal", async ({ page }) => {
    await page.goto("/films");
    await expect(
      page.getByRole("heading", { name: "Films" }),
    ).toBeVisible({ timeout: 15_000 });

    const filmRow = page.getByRole("button", {
      name: /Carezza Leanne/,
    });
    await filmRow.scrollIntoViewIfNeeded();
    await filmRow.click();

    const dialog = page.getByRole("dialog", { name: "Carezza Leanne" });
    await expect(dialog).toBeVisible();
  });

  test("legacy deep link redirects to film page", async ({ page }) => {
    await page.goto("/films?project=meghan-and-edward");
    await expect(page).toHaveURL(/\/films\/meghan-and-edward$/);
    await expect(
      page.getByRole("heading", { name: "Meghan and Edward", level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("navigation links include Films", async ({ page }) => {
    await page.goto("/");
    await expect(
      page
        .getByRole("navigation", { name: "Site navigation" })
        .getByRole("link", { name: "Films" }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});
