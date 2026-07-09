"use client";

import { useId, useMemo, useState } from "react";

import { CONTACT, FORM } from "@/lib/constants";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  projectType: string;
  company: string;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type ValidationErrors = Partial<Record<keyof ContactFormData, string>>;

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  message: "",
  projectType: "",
  company: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function validateForm(values: ContactFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }
  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Please share at least a few sentences.";
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasErrorMessage(value: unknown): value is { error: string } {
  return isRecord(value) && typeof value.error === "string";
}

export function ContactForm(): React.ReactElement {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const statusId = useId();

  const endpointConfigured = FORM.endpoint.trim().length > 0;

  const submitLabel = useMemo(() => {
    if (submitState.status === "submitting") return "Sending...";
    if (submitState.status === "success") return "Sent";
    return "Send Message";
  }, [submitState.status]);

  const onFieldChange = (
    key: keyof ContactFormData,
    value: string,
  ): void => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (submitState.status !== "idle") {
      setSubmitState({ status: "idle" });
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitState({
        status: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    if (!endpointConfigured) {
      setSubmitState({
        status: "error",
        message: `Form endpoint not configured. Email us directly at ${CONTACT.email}.`,
      });
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch(FORM.endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          projectType: formData.projectType.trim() || undefined,
          [FORM.honeypotFieldName]: formData.company.trim(),
        }),
      });

      if (!response.ok) {
        let errorMessage = "We couldn't send your message. Please try again.";
        try {
          const payload: unknown = await response.json();
          if (hasErrorMessage(payload)) {
            errorMessage = payload.error;
          }
        } catch {
          // keep generic message
        }
        setSubmitState({ status: "error", message: errorMessage });
        return;
      }

      setSubmitState({
        status: "success",
        message: "Message sent. We will get back to you shortly.",
      });
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please try again or email us directly.",
      });
    }
  };

  return (
    <form
      className="mt-14 grid grid-cols-1 gap-5 md:max-w-2xl"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={statusId}
    >
      <label className="flex flex-col gap-2">
        <span className="text-eyebrow text-[color:var(--color-muted)]">Name</span>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          className="w-full border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)] px-4 py-3 text-[color:var(--color-foreground)]"
          autoComplete="name"
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name ? (
          <span className="font-mono text-xs text-[color:var(--color-muted)]">
            {errors.name}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-eyebrow text-[color:var(--color-muted)]">Email</span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          className="w-full border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)] px-4 py-3 text-[color:var(--color-foreground)]"
          autoComplete="email"
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email ? (
          <span className="font-mono text-xs text-[color:var(--color-muted)]">
            {errors.email}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-eyebrow text-[color:var(--color-muted)]">
          Project Type (optional)
        </span>
        <input
          type="text"
          name="projectType"
          value={formData.projectType}
          onChange={(event) => onFieldChange("projectType", event.target.value)}
          className="w-full border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)] px-4 py-3 text-[color:var(--color-foreground)]"
          autoComplete="off"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-eyebrow text-[color:var(--color-muted)]">Message</span>
        <textarea
          name="message"
          value={formData.message}
          onChange={(event) => onFieldChange("message", event.target.value)}
          className="min-h-40 w-full resize-y border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)] px-4 py-3 text-[color:var(--color-foreground)]"
          aria-invalid={errors.message ? "true" : "false"}
        />
        {errors.message ? (
          <span className="font-mono text-xs text-[color:var(--color-muted)]">
            {errors.message}
          </span>
        ) : null}
      </label>

      <label className="hidden" aria-hidden="true">
        Company
        <input
          tabIndex={-1}
          autoComplete="off"
          type="text"
          name={FORM.honeypotFieldName}
          value={formData.company}
          onChange={(event) => onFieldChange("company", event.target.value)}
        />
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={submitState.status === "submitting"}
          className="text-eyebrow border border-[color:var(--color-divider)] px-6 py-3 transition-colors hover:border-[color:var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
        <a
          href={`mailto:${CONTACT.email}`}
          className="text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)]"
        >
          or email {CONTACT.email}
        </a>
      </div>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="font-mono text-xs text-[color:var(--color-muted)]"
      >
        {submitState.status === "success" || submitState.status === "error"
          ? submitState.message
          : ""}
      </p>
    </form>
  );
}
