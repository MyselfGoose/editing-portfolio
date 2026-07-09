import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Process } from "@/components/sections/Process";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

function mockMobileViewport(): void {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 390,
  });
}

describe("Process", () => {
  it("renders three process phases in reduced-motion fallback", () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
    });
    mockMobileViewport();

    renderWithProviders(<Process />);

    expect(screen.getAllByText("SELECTS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GRADE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DELIVER").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("uses scroll-pin scrub layout on mobile when motion is allowed", async () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": false,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
      "(pointer: coarse)": true,
    });
    mockMobileViewport();

    renderWithProviders(<Process />);

    await waitFor(() => {
      expect(screen.getAllByText(/Stage 01 \/ 03/).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
