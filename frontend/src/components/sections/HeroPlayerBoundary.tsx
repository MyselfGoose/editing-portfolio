"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { posterUrl } from "@/lib/mux";

interface HeroPlayerBoundaryProps {
  playbackId: string;
  posterTime?: number;
  posterWidth?: number;
  children: ReactNode;
}

interface HeroPlayerBoundaryState {
  hasError: boolean;
}

export class HeroPlayerBoundary extends Component<
  HeroPlayerBoundaryProps,
  HeroPlayerBoundaryState
> {
  state: HeroPlayerBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HeroPlayerBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Hero video failed to mount:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const poster = posterUrl(this.props.playbackId, {
        time: this.props.posterTime ?? 0,
        width: this.props.posterWidth ?? 1920,
      });
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
      );
    }
    return this.props.children;
  }
}
