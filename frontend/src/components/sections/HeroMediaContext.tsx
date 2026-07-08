"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

interface HeroMediaContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  registerVideo: (element: HTMLVideoElement | null) => void;
}

const HeroMediaContext = createContext<HeroMediaContextValue | null>(null);

interface HeroMediaProviderProps {
  children: React.ReactNode;
}

export function HeroMediaProvider({
  children,
}: HeroMediaProviderProps): React.ReactElement {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const registerVideo = useCallback((element: HTMLVideoElement | null): void => {
    videoRef.current = element;
  }, []);

  const toggleMute = useCallback((): void => {
    setIsMuted((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) {
        video.muted = next;
        if (!next) {
          void video.play().catch(() => {
            /* autoplay policy */
          });
        }
      }
      return next;
    });
  }, []);

  const value = useMemo<HeroMediaContextValue>(
    () => ({ isMuted, toggleMute, videoRef, registerVideo }),
    [isMuted, toggleMute, registerVideo],
  );

  return (
    <HeroMediaContext.Provider value={value}>{children}</HeroMediaContext.Provider>
  );
}

export function useHeroMedia(): HeroMediaContextValue {
  const ctx = useContext(HeroMediaContext);
  if (!ctx) {
    throw new Error("useHeroMedia must be used within HeroMediaProvider");
  }
  return ctx;
}
