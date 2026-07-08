import { cn } from "@/lib/utils";

interface StackProps {
  children: React.ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg" | "section";
}

const GAP: Record<NonNullable<StackProps["gap"]>, string> = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-10",
  section: "gap-[var(--gap-section)]",
};

export function Stack({
  children,
  className,
  gap = "md",
}: StackProps): React.ReactElement {
  return (
    <div className={cn("flex flex-col", GAP[gap], className)}>{children}</div>
  );
}
