import { expect, test } from "@playwright/test";

test.describe("Desktop navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.documentElement.appendChild(style);
    });
  });

  test("desktop nav jumps to process at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Site navigation" })
      .getByRole("link", { name: "Process" })
      .click();

    await expect(page.locator("#process")).toBeInViewport();
  });

  test("mobile nav open click process closes menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    });

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();

    await page.getByRole("link", { name: "Process" }).click();
    await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeHidden();
    await expect(page.locator("#process")).toBeInViewport();
  });
});
