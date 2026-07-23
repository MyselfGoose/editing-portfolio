import { expect, test } from "@playwright/test";

test.describe("Film slug pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("renders film page content and adjacent nav", async ({ page }) => {
    await page.goto("/films/carezza-leanne");
    await expect(
      page.getByRole("heading", { name: "Carezza Leanne", level: 1 }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "All films" })).toBeVisible();
    await expect(page.getByText("Role")).toBeVisible();
    await expect(page.getByText("Director / Editor")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Start a film like this" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Next film: Meghan and Edward/i }),
    ).toBeVisible();
  });

  test("adjacent next navigates to next film", async ({ page }) => {
    await page.goto("/films/carezza-leanne");
    await page
      .getByRole("link", { name: /Next film: Meghan and Edward/i })
      .click();
    await expect(page).toHaveURL(/\/films\/meghan-and-edward$/);
    await expect(
      page.getByRole("heading", { name: "Meghan and Edward", level: 1 }),
    ).toBeVisible();
  });

  test("unknown slug shows branded 404", async ({ page }) => {
    await page.goto("/films/not-a-real-film");
    await expect(
      page.getByRole("heading", {
        name: /cutting room floor/i,
      }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
