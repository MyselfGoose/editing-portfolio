import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("gp:loader-played", "1");
    });
  });

  test("home page has no critical axe violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (violation) => violation.impact === "critical",
    );

    expect(critical).toEqual([]);
  });

  test("tab order reaches modal close button", async ({ page }) => {
    await page.goto("/#work");

    await expect(
      page.getByRole("heading", { name: /Each project is a chapter/i }),
    ).toBeVisible({ timeout: 15_000 });

    const projectButton = page.getByRole("button", {
      name: "Open [THE WEDDING FILM]",
    });
    await expect(projectButton).toBeVisible();
    await projectButton.focus();
    await page.keyboard.press("Enter");

    const closeButton = page.getByRole("button", { name: "Close project" });
    await expect(closeButton).toBeFocused();
  });
});

test.describe("Reduced motion", () => {
  test("loader dismisses without hanging", async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.removeItem("gp:loader-played");
      window.matchMedia = (query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      });
    });

    await page.goto("/");

    await expect(page.locator("#hero")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("WELCOME TO")).toHaveCount(0);
  });
});
