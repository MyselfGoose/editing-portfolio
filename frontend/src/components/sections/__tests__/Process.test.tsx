import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Process } from "@/components/sections/Process";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("Process", () => {
  it("renders three process phases", () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
    });
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithProviders(<Process />);

    expect(screen.getAllByText("SELECTS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GRADE").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DELIVER").length).toBeGreaterThan(0);
  });
});
