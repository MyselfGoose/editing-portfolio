/**
 * Maps scrub progress to the active process frame index.
 * Aligned with GSAP timeline crossfades at integer positions 1..n-1
 * over a timeline of duration `frameCount`.
 */
export function activeIndexFromTimelineProgress(
  progress: number,
  frameCount: number,
  timelineDuration: number,
): number {
  const time = progress * timelineDuration;
  return Math.min(frameCount - 1, Math.max(0, Math.round(time - 0.5)));
}
