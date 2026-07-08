"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "motion/react";

import { BreakpointProvider } from "@/components/providers/BreakpointProvider";
import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import { SiteNav } from "@/components/navigation/SiteNav";
import { EASE } from "@/lib/constants";

import { CursorProvider } from "./CursorContext";
import { CustomCursor } from "./CustomCursor";
import { SmoothScroll } from "./SmoothScroll";
import { TransitionManager } from "./TransitionManager";

const CinematicLoader = dynamic(() => import("./CinematicLoader"), {
  ssr: false,
});

interface ExperienceShellProps {
  children: React.ReactNode;
}

export function ExperienceShell({
  children,
}: ExperienceShellProps): React.ReactElement {
  return (
    <BreakpointProvider>
      <ExperienceProvider>
        <MotionConfig
          reducedMotion="user"
          transition={{ duration: 0.6, ease: EASE.cinematic }}
        >
          <SmoothScroll>
            <CursorProvider>
              <SiteNav />
              <CustomCursor />
              <CinematicLoader />
              <div className="film-grain" aria-hidden="true" />
              <TransitionManager>{children}</TransitionManager>
            </CursorProvider>
          </SmoothScroll>
        </MotionConfig>
      </ExperienceProvider>
    </BreakpointProvider>
  );
}
