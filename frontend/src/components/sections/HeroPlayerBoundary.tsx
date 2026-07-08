"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { posterUrl } from "@/lib/mux";

interface HeroPlayerBoundaryProps {
  playbackId: string;
  posterTime?: number;
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
        width: 1920,
      });
      return (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      );
    }
    return this.props.children;
  }
}
