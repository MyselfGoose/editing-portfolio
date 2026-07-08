import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { CursorProvider } from "@/components/experience/CursorContext";

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps): React.ReactElement {
  return <CursorProvider>{children}</CursorProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}
