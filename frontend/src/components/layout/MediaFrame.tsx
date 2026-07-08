import { cn } from "@/lib/utils";

interface MediaFrameProps {
  children: React.ReactNode;
  aspectRatio?: string;
  className?: string;
}

export function MediaFrame({
  children,
  aspectRatio = "16/9",
  className,
}: MediaFrameProps): React.ReactElement {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[color:var(--color-elevated)]",
        className,
      )}
      style={{ aspectRatio }}
    >
      {children}
    </div>
  );
}
