"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ExperienceContextValue {
  scrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

interface ExperienceProviderProps {
  children: React.ReactNode;
}

export function ExperienceProvider({
  children,
}: ExperienceProviderProps): React.ReactElement {
  const [scrollLocked, setScrollLockedState] = useState<boolean>(false);

  const setScrollLocked = useCallback((locked: boolean): void => {
    setScrollLockedState(locked);
    if (typeof document !== "undefined") {
      if (locked) {
        document.documentElement.dataset.scrollLocked = "true";
      } else {
        delete document.documentElement.dataset.scrollLocked;
      }
    }
  }, []);

  const value = useMemo<ExperienceContextValue>(
    () => ({ scrollLocked, setScrollLocked }),
    [scrollLocked, setScrollLocked],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    return {
      scrollLocked: false,
      setScrollLocked: () => undefined,
    };
  }
  return ctx;
}
