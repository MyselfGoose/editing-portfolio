import { expect, test } from "@playwright/test";

test.describe("Contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("mailto fallback href present", async ({ page }) => {
    await page.goto("/contact");

    const mailto = page
      .locator('a[href="mailto:gooseproductionsstudio@gmail.com"]')
      .first();
    await expect(mailto).toBeVisible({ timeout: 15_000 });
  });

  test("contact form submits successfully with mocked network", async ({
    page,
  }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Goose Client");
    await page.getByLabel("Email").fill("client@example.com");
    await page.getByLabel("Message").fill("Need a cinematic wedding film for September.");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByRole("status")).toContainText("Message sent");
  });
});
