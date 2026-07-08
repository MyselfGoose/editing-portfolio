import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CustomCursor } from "@/components/experience/CustomCursor";
import { CursorProvider } from "@/components/experience/CursorContext";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";

function renderCursor() {
  return render(
    <CursorProvider>
      <CustomCursor />
    </CursorProvider>,
  );
}

describe("CustomCursor", () => {
  it("renders cursor elements on fine pointer without reduced motion", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    const { container } = renderCursor();
    expect(container.querySelector(".cursor-ring")).toBeTruthy();
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
