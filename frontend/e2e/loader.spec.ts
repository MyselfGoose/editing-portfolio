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

    let mainHadFocus = false;
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      const activeTarget = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active) return "";
        return active.id || active.getAttribute("href") || active.tagName;
      });
      if (activeTarget === "main" || activeTarget === "#main") {
        mainHadFocus = true;
        break;
      }
    }

    expect(mainHadFocus).toBe(false);
  });
});
