import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { About } from "@/components/sections/About";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("About", () => {
  it("smoke renders studio heading", () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
    });

    renderWithProviders(<About />);

    expect(
      screen.getByRole("heading", {
        name: /Wedding films finished with editorial care/i,
      }),
    ).toBeInTheDocument();
  });
});
