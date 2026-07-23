import { expect, test } from "@playwright/test";

test.describe("Site navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.documentElement.appendChild(style);
    });
  });

  test("desktop nav navigates to contact page at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", { name: "Contact" })
      .click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(
      page.getByRole("heading", { name: /Ready to begin your wedding film/i }),
    ).toBeVisible();
  });

  test("mobile nav opens and navigates to contact", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    });

    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Site navigation" });
    await expect(dialog).toBeVisible();

    // Soft-nav may unmount the menu panel mid-click; race URL with the click.
    await Promise.all([
      page.waitForURL(/\/contact$/),
      dialog.getByRole("link", { name: "Contact" }).click(),
    ]);

    await expect(
      page.getByRole("dialog", { name: "Site navigation" }),
    ).toBeHidden();
  });
});
