import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactPageContent } from "@/components/contact/ContactPageContent";
import { CONTACT } from "@/lib/constants";
import { renderWithProviders } from "@/test-utils/render";

describe("ContactPageContent", () => {
  it("renders contact heading and CTA", () => {
    renderWithProviders(<ContactPageContent />);

    expect(
      screen.getByRole("heading", { name: /Ready to begin your wedding film/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(CONTACT.ctaLabel)).toBeInTheDocument();
  });

  it("renders mailto link with correct email", () => {
    renderWithProviders(<ContactPageContent />);

    const links = screen.getAllByRole("link");
    const mailtoLinks = links.filter(
      (link) => link.getAttribute("href") === `mailto:${CONTACT.email}`,
    );
    expect(mailtoLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders footer with brand name", () => {
    renderWithProviders(<ContactPageContent />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
