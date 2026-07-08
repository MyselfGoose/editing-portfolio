import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { HeroAudioToggle } from "@/components/sections/HeroAudioToggle";
import { HeroMediaProvider } from "@/components/sections/HeroMediaContext";

function renderToggle() {
  return render(
    <HeroMediaProvider>
      <HeroAudioToggle />
    </HeroMediaProvider>,
  );
}

describe("HeroAudioToggle", () => {
  it("renders muted by default", () => {
    renderToggle();
    const button = screen.getByRole("button", { name: "Unmute hero video" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Sound Off")).toBeInTheDocument();
  });

  it("toggles to unmuted on click", async () => {
    const user = userEvent.setup();
    renderToggle();

    const button = screen.getByRole("button", { name: "Unmute hero video" });
    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Mute hero video" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Sound On")).toBeInTheDocument();
  });
});
