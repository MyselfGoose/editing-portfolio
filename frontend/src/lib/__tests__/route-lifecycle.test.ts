import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearScrollLockArtifacts,
  focusMainLandmark,
} from "@/lib/route-lifecycle";

describe("route-lifecycle", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
    delete document.documentElement.dataset.scrollLocked;
    vi.restoreAllMocks();
  });

  it("clearScrollLockArtifacts clears body overflow and dataset flag", () => {
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.scrollLocked = "true";

    clearScrollLockArtifacts();

    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.dataset.scrollLocked).toBeUndefined();
  });

  it("focusMainLandmark focuses #main and ensures it is focusable", () => {
    document.body.innerHTML = `<main id="main">Content</main>`;
    const main = document.getElementById("main");
    expect(main).not.toBeNull();
    const focusSpy = vi.spyOn(main!, "focus");

    focusMainLandmark();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(main!.getAttribute("tabindex")).toBe("-1");
  });

  it("focusMainLandmark skips when an aria-modal dialog is open", () => {
    document.body.innerHTML = `
      <main id="main">Content</main>
      <div role="dialog" aria-modal="true">Menu</div>
    `;
    const main = document.getElementById("main");
    const focusSpy = vi.spyOn(main!, "focus");

    focusMainLandmark();

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
