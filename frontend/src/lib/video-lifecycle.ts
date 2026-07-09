/** Safely pause an HTML video element. */
export function pauseVideo(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  video.pause();
}

/** Safely play an HTML video element; ignores autoplay policy rejections. */
export function playVideo(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  try {
    const result = video.play();
    if (result !== undefined && typeof result.catch === "function") {
      void result.catch(() => {
        /* autoplay policy */
      });
    }
  } catch {
    /* autoplay policy */
  }
}

interface PausableMedia {
  pause: () => void;
  play: () => Promise<void>;
}

function asPausableMedia(
  element: HTMLElement | null | undefined,
): PausableMedia | null {
  if (!element) return null;
  const candidate = element as unknown as PausableMedia;
  if (
    typeof candidate.pause === "function" &&
    typeof candidate.play === "function"
  ) {
    return candidate;
  }
  return null;
}

/** Pause a Mux Player custom element. */
export function pauseMuxPlayer(
  player: HTMLElement | null | undefined,
): void {
  asPausableMedia(player)?.pause();
}

/** Resume a Mux Player custom element. */
export function playMuxPlayer(
  player: HTMLElement | null | undefined,
): void {
  const media = asPausableMedia(player);
  if (!media) return;
  void media.play().catch(() => {
    /* autoplay policy */
  });
}
