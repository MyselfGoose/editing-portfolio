/**
 * Clears stuck scroll-lock side effects left by overlays (showreel, modal, nav).
 * Safe to call on every pathname change; overlays that remain open re-apply locks.
 */
export function clearScrollLockArtifacts(): void {
  if (typeof document === "undefined") return;

  document.body.style.overflow = "";
  delete document.documentElement.dataset.scrollLocked;
}

/**
 * Moves focus to the main landmark after a soft navigation.
 * Avoids trapping focus on detached triggers (e.g. closed modal openers).
 */
export function focusMainLandmark(): void {
  if (typeof document === "undefined") return;

  // Don't steal focus while a modal/dialog (showreel, menu, project) is open.
  if (document.querySelector('[aria-modal="true"]')) {
    return;
  }

  const main = document.getElementById("main");
  if (!main) return;

  if (!main.hasAttribute("tabindex")) {
    main.setAttribute("tabindex", "-1");
  }

  main.focus({ preventScroll: true });
}
