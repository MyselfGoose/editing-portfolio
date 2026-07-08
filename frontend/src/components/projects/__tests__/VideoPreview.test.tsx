import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VideoPreview } from "@/components/projects/VideoPreview";
import { PLACEHOLDER_PLAYBACK_ID, REAL_PLAYBACK_ID } from "@/test-utils/fixtures";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("VideoPreview", () => {
  it("renders poster image for real playback ID", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(
      <VideoPreview
        playbackId={REAL_PLAYBACK_ID}
        aspectRatio="16/9"
        duration="03:42"
        posterTime={12}
        previewRange={{ start: 8, end: 12 }}
        ariaLabel="Test Video"
        onOpen={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Open Test Video/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({ aspectRatio: "16/9" });

    const img = button.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.src).toContain("image.mux.com");
    expect(img?.src).toContain("thumbnail.webp");
  });

  it("shows Coming Soon for placeholder playback ID", () => {
    renderWithProviders(
      <VideoPreview
        playbackId={PLACEHOLDER_PLAYBACK_ID}
        aspectRatio="16/9"
        ariaLabel="Placeholder Video"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Placeholder Video — coming soon/i }),
    ).toHaveAttribute("tabindex", "-1");
  });

  it("calls onOpen on click for real playback ID", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(
      <VideoPreview
        playbackId={REAL_PLAYBACK_ID}
        aspectRatio="16/9"
        ariaLabel="Test Video"
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Open Test Video/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("calls onOpen on Enter key", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(
      <VideoPreview
        playbackId={REAL_PLAYBACK_ID}
        aspectRatio="16/9"
        ariaLabel="Test Video"
        onOpen={onOpen}
      />,
    );

    const button = screen.getByRole("button", { name: /Open Test Video/i });
    button.focus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
