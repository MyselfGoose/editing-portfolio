import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { placeholderProject, testProject } from "@/test-utils/fixtures";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

describe("ProjectCard", () => {
  it("renders project title and category", () => {
    renderWithProviders(
      <ProjectCard project={testProject} onOpen={vi.fn()} />,
    );

    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText(/Wedding Film/)).toBeInTheDocument();
    expect(screen.getByText(testProject.description)).toBeInTheDocument();
    expect(screen.getAllByText("03:42").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Coming Soon for placeholder playback ID", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(
      <ProjectCard project={placeholderProject} onOpen={vi.fn()} />,
    );

    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("calls onOpen when video preview is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(
      <ProjectCard project={testProject} onOpen={onOpen} />,
    );

    await user.click(screen.getByRole("button", { name: /Open Test Project/i }));
    expect(onOpen).toHaveBeenCalledWith(testProject);
  });
});
