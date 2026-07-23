"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { BreakpointProvider } from "@/components/providers/BreakpointProvider";
import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { SiteNav } from "@/components/navigation/SiteNav";
import { EASE } from "@/lib/constants";
import { getExperienceMode, type ExperienceMode } from "@/lib/experience-mode";

import { CursorProvider } from "./CursorContext";
import { CustomCursor } from "./CustomCursor";
import { PathScrollReset } from "./PathScrollReset";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionManager } from "./TransitionManager";

const CinematicLoader = dynamic(() => import("./CinematicLoader"), {
  ssr: false,
});

interface ExperienceShellProps {
  children: React.ReactNode;
}

function useExperienceModeAttribute(mode: ExperienceMode): void {
  useEffect(() => {
    document.documentElement.dataset.experienceMode = mode;
    return () => {
      delete document.documentElement.dataset.experienceMode;
    };
  }, [mode]);
}

/**
 * Nav and CursorProvider stay mounted across mode changes so mobile menus
 * and focus are not torn down mid-navigation. Only scroll runtime + cinematic
 * chrome (cursor UI, loader, grain) swap with experience mode.
 */
export function ExperienceShell({
  children,
}: ExperienceShellProps): React.ReactElement {
  const pathname = usePathname() ?? "/";
  const mode = getExperienceMode(pathname);
  const cinematic = mode === "cinematic";
  useExperienceModeAttribute(mode);

  return (
    <BreakpointProvider>
      <ExperienceProvider>
        <MotionConfig
          reducedMotion="user"
          transition={{ duration: 0.6, ease: EASE.cinematic }}
        >
          {cinematic ? <SmoothScroll /> : <PathScrollReset />}
          <CursorProvider>
            <SiteNav />
            <DesktopNav />
            {cinematic ? <CustomCursor /> : null}
            {cinematic ? <CinematicLoader /> : null}
            {cinematic ? (
              <div className="film-grain" aria-hidden="true" />
            ) : null}
            <TransitionManager>{children}</TransitionManager>
          </CursorProvider>
        </MotionConfig>
      </ExperienceProvider>
    </BreakpointProvider>
  );
}
