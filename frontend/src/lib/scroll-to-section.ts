type ScrollToSectionFn = (sectionId: string) => void;

let scrollToSectionImpl: ScrollToSectionFn | null = null;

/** Registered by SmoothScroll when Lenis is active. */
export function registerScrollToSection(fn: ScrollToSectionFn | null): void {
  scrollToSectionImpl = fn;
}

export function scrollToSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (scrollToSectionImpl) {
    scrollToSectionImpl(sectionId);
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
