export function SectionSkeleton(): React.ReactElement {
  return (
    <div
      className="w-full border-t border-[color:var(--color-divider)] bg-[color:var(--color-background)]"
      aria-hidden="true"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--section-px)] py-[var(--section-py)]">
        <div className="h-3 w-32 animate-pulse bg-[color:var(--color-divider)]" />
        <div className="mt-12 h-16 max-w-xl animate-pulse bg-[color:var(--color-divider)]" />
        <div className="mt-8 h-48 w-full animate-pulse bg-[color:var(--color-elevated)]" />
      </div>
    </div>
  );
}
