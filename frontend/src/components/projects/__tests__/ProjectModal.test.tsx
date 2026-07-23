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
    expect(screen.getByText(/Wedding Film/)).toBeInTheDocument();
    expect(screen.getByText(testProject.description)).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("03:42")).toBeInTheDocument();
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

    const openFilmPage = screen.getByRole("link", { name: "Open film page" });
    await user.tab();
    expect(openFilmPage).toHaveFocus();

    // Shift+Tab from first focusable wraps to last; Tab from last wraps to first.
    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });
});
