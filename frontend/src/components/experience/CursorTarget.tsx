"use client";

import { useCallback } from "react";

import { useCursor } from "@/components/experience/CursorContext";
import { cn } from "@/lib/utils";

type CursorKind = "play" | "open";

interface CursorTargetProps {
  children: React.ReactNode;
  kind: CursorKind;
  label?: string;
  className?: string;
  as?: "div" | "span" | "a";
  href?: string;
  onClick?: () => void;
  "aria-label"?: string;
}

export function CursorTarget({
  children,
  kind,
  label,
  className,
  as: Tag = "div",
  href,
  onClick,
  "aria-label": ariaLabel,
}: CursorTargetProps): React.ReactElement {
  const { setState, reset } = useCursor();

  const handleEnter = useCallback((): void => {
    setState({ kind, label });
  }, [kind, label, setState]);

  const handleLeave = useCallback((): void => {
    reset();
  }, [reset]);

  const shared = {
    className: cn(className),
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    onFocus: handleEnter,
    onBlur: handleLeave,
    "data-cursor": kind,
    "aria-label": ariaLabel,
    onClick,
  };

  if (Tag === "a" && href) {
    return (
      <a href={href} {...shared}>
        {children}
      </a>
    );
  }

  return <span {...shared}>{children}</span>;
}
