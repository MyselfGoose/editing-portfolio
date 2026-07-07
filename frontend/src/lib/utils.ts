export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * alpha;
}

export function formatIndex(index: number, pad = 2): string {
  return String(index).padStart(pad, "0");
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
