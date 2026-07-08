import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { BreakpointProvider } from "@/components/providers/BreakpointProvider";
import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import { CursorProvider } from "@/components/experience/CursorContext";

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps): React.ReactElement {
  return (
    <BreakpointProvider>
      <ExperienceProvider>
        <CursorProvider>{children}</CursorProvider>
      </ExperienceProvider>
    </BreakpointProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
