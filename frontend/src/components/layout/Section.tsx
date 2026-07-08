import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  borderTop?: boolean;
  padding?: "default" | "hero" | "contact" | "none";
}

const PADDING: Record<NonNullable<SectionProps["padding"]>, string> = {
  default: "py-[var(--section-py)]",
  hero: "pt-6 pb-10 sm:pt-8 sm:pb-14",
  contact: "pt-[clamp(5rem,14vw,10rem)] pb-[var(--section-py)]",
  none: "",
};

export function Section({
  id,
  children,
  className,
  labelledBy,
  borderTop = false,
  padding = "default",
}: SectionProps): React.ReactElement {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full px-[var(--section-px)]",
        PADDING[padding],
        borderTop && "border-t border-[color:var(--color-divider)]",
        className,
      )}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
