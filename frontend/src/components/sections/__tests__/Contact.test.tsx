import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Contact } from "@/components/sections/Contact";
import { CONTACT } from "@/lib/constants";
import { renderWithProviders } from "@/test-utils/render";

describe("Contact", () => {
  it("renders contact heading and CTA", () => {
    renderWithProviders(<Contact />);

    expect(
      screen.getByRole("heading", { name: /Ready to tell/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(CONTACT.ctaLabel)).toBeInTheDocument();
  });

  it("renders mailto links with correct email", () => {
    renderWithProviders(<Contact />);

    const links = screen.getAllByRole("link");
    const mailtoLinks = links.filter(
      (link) => link.getAttribute("href") === `mailto:${CONTACT.email}`,
    );
    expect(mailtoLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders credits section", () => {
    renderWithProviders(<Contact />);
    expect(screen.getByText("Credits")).toBeInTheDocument();
    expect(screen.getByText("Director")).toBeInTheDocument();
  });

  it("renders footer with brand name", () => {
    renderWithProviders(<Contact />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
