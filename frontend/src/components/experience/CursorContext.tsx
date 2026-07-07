"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CursorState =
  | { kind: "default" }
  | { kind: "play"; label?: string }
  | { kind: "open"; label?: string }
  | { kind: "hidden" };

interface CursorContextValue {
  state: CursorState;
  setState: (next: CursorState) => void;
  reset: () => void;
}

const CursorContext = createContext<CursorContextValue | null>(null);

interface CursorProviderProps {
  children: React.ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps): React.ReactElement {
  const [state, setStateRaw] = useState<CursorState>({ kind: "default" });

  const setState = useCallback((next: CursorState): void => {
    setStateRaw(next);
  }, []);

  const reset = useCallback((): void => {
    setStateRaw({ kind: "default" });
  }, []);

  const value = useMemo<CursorContextValue>(
    () => ({ state, setState, reset }),
    [state, setState, reset],
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor(): CursorContextValue {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    return {
      state: { kind: "default" },
      setState: () => undefined,
      reset: () => undefined,
    };
  }
  return ctx;
}
