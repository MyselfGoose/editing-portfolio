import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
}

export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps): React.ReactElement {
  return (
    <Tag className={cn("mx-auto w-full max-w-[var(--container-max)]", className)}>
      {children}
    </Tag>
  );
}
