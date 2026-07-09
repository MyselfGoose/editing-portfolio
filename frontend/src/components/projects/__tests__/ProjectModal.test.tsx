import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectModal } from "@/components/projects/ProjectModal";
import { placeholderProject, testProject } from "@/test-utils/fixtures";
import { renderWithProviders } from "@/test-utils/render";

describe("ProjectModal", () => {
  it("renders nothing when project is null", () => {
    const { container } = renderWithProviders(
      <ProjectModal project={null} onClose={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders project metadata when open", () => {
    renderWithProviders(<ProjectModal project={testProject} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText(/Documentary/)).toBeInTheDocument();
    expect(screen.getByText("A test project description.")).toBeInTheDocument();
  });

  it("renders Mux player for real playback ID", () => {
    renderWithProviders(<ProjectModal project={testProject} onClose={vi.fn()} />);
    expect(screen.getByTestId("mux-player")).toBeInTheDocument();
  });

  it("shows coming soon message for placeholder playback ID", () => {
    renderWithProviders(<ProjectModal project={placeholderProject} onClose={vi.fn()} />);
    expect(screen.getByText("Video coming soon")).toBeInTheDocument();
    expect(screen.queryByTestId("mux-player")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ProjectModal project={testProject} onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<ProjectModal project={testProject} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close project" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sets body overflow to hidden while open", () => {
    const { unmount } = renderWithProviders(
      <ProjectModal project={testProject} onClose={vi.fn()} />,
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("wraps focus with Tab key inside modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectModal project={testProject} onClose={vi.fn()} />);

    const closeButton = screen.getByRole("button", { name: "Close project" });
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    await user.tab();
    // Focus should wrap back to close button (only focusable in mock)
    expect(closeButton).toHaveFocus();
  });
});
