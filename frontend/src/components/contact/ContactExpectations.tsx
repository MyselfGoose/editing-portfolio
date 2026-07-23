export function ContactExpectations(): React.ReactElement {
  return (
    <aside
      aria-labelledby="contact-expectations-heading"
      className="flex max-w-2xl flex-col gap-4 border-t border-[color:var(--color-divider)] pt-8"
    >
      <h2
        id="contact-expectations-heading"
        className="text-eyebrow text-[color:var(--color-muted)]"
      >
        What helps us reply well
      </h2>
      <p className="text-body-lg text-[color:var(--color-muted)]">
        Share footage access or a transfer link, the event date, a runtime
        target, your deadline, and any reference films that feel close to the
        tone you want.
      </p>
      <p className="font-mono text-xs text-[color:var(--color-dim)]">
        We read every inquiry and reply within a few business days.
      </p>
    </aside>
  );
}
