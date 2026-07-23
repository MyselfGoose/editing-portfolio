"use client";

import { useId, useMemo, useState } from "react";

import { ContactSuccess } from "@/components/contact/ContactSuccess";
import { CONTACT, FORM } from "@/lib/constants";
import {
  contactClientFieldsSchema,
  formatValidationErrors,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  type ProjectType,
} from "@/lib/contact/schema";
import { cn } from "@/lib/utils";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  projectType: ProjectType | "";
  company: string;
}

interface ClientMetadataPayload {
  pageUrl: string;
  timezone: string;
  screenSize: string;
  viewport: string;
  language: string;
}

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

type ValidationErrors = Partial<Record<keyof ContactFormData, string>>;

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  message: "",
  projectType: "",
  company: "",
};

const FIELD_CLASS =
  "min-h-12 w-full border border-[color:var(--color-divider)] bg-[color:var(--color-elevated)] px-4 py-3 text-base text-[color:var(--color-foreground)] transition-colors placeholder:text-[color:var(--color-dim)] focus:border-[color:var(--color-foreground)]";

const FIELD_INVALID_CLASS =
  "border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)]";

function fieldClassName(hasError: boolean, extra?: string): string {
  return cn(FIELD_CLASS, hasError && FIELD_INVALID_CLASS, extra);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasErrorMessage(value: unknown): value is { error: string } {
  return isRecord(value) && typeof value.error === "string";
}

function collectClientMetadata(): ClientMetadataPayload {
  return {
    pageUrl: `${window.location.pathname}${window.location.search}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
  };
}

export function ContactForm(): React.ReactElement {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const statusId = useId();

  const submitLabel = useMemo(() => {
    if (submitState.status === "submitting") return "Sending...";
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
    if (submitState.status === "error") {
      setSubmitState({ status: "idle" });
    }
  };

  const resetForm = (): void => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitState({ status: "idle" });
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const parsed = contactClientFieldsSchema.safeParse({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      projectType: formData.projectType,
    });

    if (!parsed.success) {
      setErrors(formatValidationErrors(parsed.error));
      setSubmitState({
        status: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    setErrors({});
    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch(FORM.apiPath, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.message,
          projectType: parsed.data.projectType,
          [FORM.honeypotFieldName]: formData.company.trim(),
          client: collectClientMetadata(),
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

      setSubmitState({ status: "success" });
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error. Please try again or email us directly.",
      });
    }
  };

  if (submitState.status === "success") {
    return (
      <section aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className="sr-only">
          Contact form
        </h2>
        <ContactSuccess onReset={resetForm} />
      </section>
    );
  }

  return (
    <section aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading" className="sr-only">
        Contact form
      </h2>

      <form
        className="grid max-w-2xl grid-cols-1 gap-6 md:gap-7"
        onSubmit={onSubmit}
        noValidate
        aria-describedby={statusId}
      >
        <label className="flex flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Name
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            className={fieldClassName(Boolean(errors.name))}
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name ? (
            <span className="font-mono text-xs text-[color:var(--color-danger)]">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Email
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            className={fieldClassName(Boolean(errors.email))}
            autoComplete="email"
            inputMode="email"
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email ? (
            <span className="font-mono text-xs text-[color:var(--color-danger)]">
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Project type
          </span>
          <select
            name="projectType"
            value={formData.projectType}
            onChange={(event) =>
              onFieldChange("projectType", event.target.value)
            }
            className={fieldClassName(Boolean(errors.projectType), "appearance-none")}
            aria-invalid={errors.projectType ? "true" : "false"}
            required
          >
            <option value="" disabled>
              Select a project type
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROJECT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.projectType ? (
            <span className="font-mono text-xs text-[color:var(--color-danger)]">
              {errors.projectType}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-3">
          <span className="text-eyebrow text-[color:var(--color-muted)]">
            Message
          </span>
          <textarea
            name="message"
            value={formData.message}
            onChange={(event) => onFieldChange("message", event.target.value)}
            className={fieldClassName(
              Boolean(errors.message),
              "min-h-[10rem] resize-y leading-relaxed sm:min-h-44",
            )}
            aria-invalid={errors.message ? "true" : "false"}
          />
          {errors.message ? (
            <span className="font-mono text-xs text-[color:var(--color-danger)]">
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

        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-4 bg-[color:var(--color-background)]/95 px-1 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            disabled={submitState.status === "submitting"}
            className={cn(
              "inline-flex min-h-12 w-full items-center justify-center",
              "border border-[color:var(--color-foreground)] px-6 py-3",
              "text-eyebrow transition-colors",
              "hover:bg-[color:var(--color-foreground)] hover:text-[color:var(--color-background)]",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "sm:w-auto",
            )}
          >
            {submitLabel}
          </button>
          <a
            href={`mailto:${CONTACT.email}`}
            className="hidden min-h-11 items-center text-eyebrow text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-foreground)] sm:inline-flex"
          >
            or email {CONTACT.email}
          </a>
        </div>

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className="min-h-[1.25rem] font-mono text-xs text-[color:var(--color-muted)]"
        >
          {submitState.status === "error" ? submitState.message : ""}
        </p>
      </form>
    </section>
  );
}
