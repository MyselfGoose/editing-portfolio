import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";

import { CustomCursor } from "@/components/experience/CustomCursor";
import { renderWithProviders } from "@/test-utils/render";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";

function renderCursor() {
  return renderWithProviders(<CustomCursor />);
}

describe("CustomCursor", () => {
  it("renders cursor elements on fine pointer without reduced motion", async () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    const { container } = renderCursor();
    await waitFor(() => {
      expect(container.querySelector(".cursor-ring")).toBeTruthy();
    });
    expect(container.querySelector(".cursor-dot")).toBeTruthy();
  });

  it("returns null with reduced motion", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });

    const { container } = renderCursor();
    expect(container.querySelector(".cursor-ring")).toBeNull();
  });

  it("returns null on coarse pointer", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": false,
      "(prefers-reduced-motion: reduce)": false,
    });

    const { container } = renderCursor();
    expect(container.querySelector(".cursor-ring")).toBeNull();
  });
});
