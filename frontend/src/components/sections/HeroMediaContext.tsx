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

import { pauseVideo, playVideo } from "@/lib/video-lifecycle";

interface HeroMediaContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  registerVideo: (element: HTMLVideoElement | null) => void;
  pauseAmbient: () => void;
  resumeAmbient: () => void;
  isAmbientPaused: boolean;
}

const HeroMediaContext = createContext<HeroMediaContextValue | null>(null);

interface HeroMediaProviderProps {
  children: React.ReactNode;
}

export function HeroMediaProvider({
  children,
}: HeroMediaProviderProps): React.ReactElement {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isAmbientPaused, setIsAmbientPaused] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wasPlayingBeforePauseRef = useRef<boolean>(false);

  const registerVideo = useCallback((element: HTMLVideoElement | null): void => {
    videoRef.current = element;
  }, []);

  const toggleMute = useCallback((): void => {
    setIsMuted((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) {
        video.muted = next;
        if (!next && !video.paused) {
          void video.play().catch(() => {
            /* autoplay policy */
          });
        }
      }
      return next;
    });
  }, []);

  const pauseAmbient = useCallback((): void => {
    const video = videoRef.current;
    if (video) {
      wasPlayingBeforePauseRef.current = !video.paused;
      pauseVideo(video);
    } else {
      wasPlayingBeforePauseRef.current = false;
    }
    setIsAmbientPaused(true);
  }, []);

  const resumeAmbient = useCallback((): void => {
    setIsAmbientPaused(false);
    const video = videoRef.current;
    if (video && wasPlayingBeforePauseRef.current) {
      video.muted = true;
      setIsMuted(true);
      playVideo(video);
    }
    wasPlayingBeforePauseRef.current = false;
  }, []);

  const value = useMemo<HeroMediaContextValue>(
    () => ({
      isMuted,
      toggleMute,
      videoRef,
      registerVideo,
      pauseAmbient,
      resumeAmbient,
      isAmbientPaused,
    }),
    [
      isMuted,
      toggleMute,
      registerVideo,
      pauseAmbient,
      resumeAmbient,
      isAmbientPaused,
    ],
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
