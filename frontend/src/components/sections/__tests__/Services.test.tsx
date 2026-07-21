import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Services } from "@/components/sections/Services";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("Services", () => {
  it("smoke renders four service offerings", () => {
    mockMatchMediaForQuery({
      "(prefers-reduced-motion: reduce)": true,
      "(max-width: 767px)": true,
      "(min-width: 768px) and (max-width: 1023px)": false,
      "(min-width: 1024px)": false,
      "(pointer: fine)": false,
    });

    renderWithProviders(<Services />);

    expect(
      screen.getByRole("heading", {
        name: /Editorial finish for weddings and celebrations/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wedding Film Edit.")).toBeInTheDocument();
    expect(screen.getByText("Delivery & Revisions.")).toBeInTheDocument();
  });
});
