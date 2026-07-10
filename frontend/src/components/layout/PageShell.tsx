import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared layout for route pages (contact, privacy, etc.).
 * Clears the fixed nav, applies section gutters, and caps content width.
 */
export function PageShell({
  children,
  className,
}: PageShellProps): React.ReactElement {
  return (
    <main
      id="main"
      className={cn(
        "relative min-h-[100svh] w-full",
        "px-[var(--section-px)]",
        "pb-[max(2.5rem,env(safe-area-inset-bottom))]",
        "pt-[max(5rem,calc(var(--nav-offset)+1rem))]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[var(--container-max)] flex-col">
        {children}
      </div>
    </main>
  );
}
