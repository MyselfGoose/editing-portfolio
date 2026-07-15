import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectModal } from "@/components/projects/ProjectModal";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { featuredProjects } from "@/data/projects";
import { mockMatchMediaForQuery } from "@/test-utils/mocks";
import { renderWithProviders } from "@/test-utils/render";

vi.mock("next/dynamic", () => ({
  default: () => ProjectModal,
}));

describe("FeaturedWork", () => {
  it("renders all projects", () => {
    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(<FeaturedWork />);

    expect(screen.getByRole("heading", { name: /Here is our best work/i })).toBeInTheDocument();

    for (const project of featuredProjects) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it("opens modal when a project is clicked", async () => {
    const user = userEvent.setup();

    mockMatchMediaForQuery({
      "(pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": false,
    });

    renderWithProviders(<FeaturedWork />);

    const firstProject = featuredProjects[0];
    const openButton = screen.getByRole("button", {
      name: new RegExp(`Open ${firstProject.title.replace(/[[\]]/g, "\\$&")}`, "i"),
    });

    await user.click(openButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
