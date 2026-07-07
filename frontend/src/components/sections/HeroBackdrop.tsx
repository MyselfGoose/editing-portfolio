"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Phase 1 hero backdrop. Renders an animated cinematic gradient as a
 * stand-in for the real footage. Once a real hero loop is available at
 * `/videos/hero.mp4`, replace the inner render with a native `<video>` and
 * keep the gradient as poster/fallback.
 */
export function HeroBackdrop(): React.ReactElement {
  const isSmall = useMediaQuery("(max-width: 640px)");
  const reducedMotion = usePrefersReducedMotion();
  const still = isSmall || reducedMotion;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 40%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%), radial-gradient(90% 60% at 80% 70%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
        }}
      />
      {!still && (
        <>
          <div
            className="absolute inset-[-20%] opacity-70"
            style={{
              background:
                "conic-gradient(from 210deg at 50% 50%, rgba(255,255,255,0.02), rgba(255,255,255,0.09), rgba(255,255,255,0.02), rgba(0,0,0,0), rgba(255,255,255,0.02))",
              filter: "blur(60px)",
              animation: "hero-drift 22s linear infinite",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%)",
              animation: "hero-sweep 9s ease-in-out infinite",
            }}
          />
        </>
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.85) 100%)",
        }}
      />
      <style>{`
        @keyframes hero-drift {
          0% { transform: rotate(0deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1.05); }
        }
        @keyframes hero-sweep {
          0%, 100% { transform: translateX(-30%); opacity: 0.15; }
          50% { transform: translateX(30%); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
