import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ShowreelOverlay } from "@/components/showreel/ShowreelOverlay";
import { renderWithProviders } from "@/test-utils/render";

describe("ShowreelOverlay", () => {
  it("renders dialog when open", () => {
    renderWithProviders(
      <ShowreelOverlay open onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog", { name: "Showreel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close showreel" }),
    ).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<ShowreelOverlay open onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("focuses close button when opened", async () => {
    renderWithProviders(<ShowreelOverlay open onClose={vi.fn()} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Close showreel" }),
      ).toHaveFocus();
    });
  });
});
