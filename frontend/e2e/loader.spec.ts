import { expect, test } from "@playwright/test";

test.describe("Loader accessibility", () => {
  test("tab does not reach main content while loader visible", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.removeItem("gp:loader-played");
    });

    await page.goto("/");

    await expect(page.getByText("WELCOME TO")).toBeVisible({ timeout: 10_000 });

    const mainHadFocus = await page.evaluate(() => {
      for (let i = 0; i < 8; i += 1) {
        const active = document.activeElement;
        if (active?.id === "main" || active?.getAttribute("href") === "#main") {
          return true;
        }
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
        );
      }
      return false;
    });

    expect(mainHadFocus).toBe(false);
  });
});
