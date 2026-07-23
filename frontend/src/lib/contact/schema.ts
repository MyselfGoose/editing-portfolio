import { z } from "zod";

export const PROJECT_TYPES = [
  "wedding_film_edit",
  "celebration_film",
  "color_grade",
  "not_sure",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  wedding_film_edit: "Wedding film edit",
  celebration_film: "Celebration film",
  color_grade: "Color grade only",
  not_sure: "Not sure / other",
};

export function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as ReadonlyArray<string>).includes(value);
}

export function projectTypeLabel(value: ProjectType): string {
  return PROJECT_TYPE_LABELS[value];
}

export const clientMetadataSchema = z
  .object({
    pageUrl: z.string().max(2048).optional(),
    timezone: z.string().max(100).optional(),
    screenSize: z.string().max(50).optional(),
    viewport: z.string().max(50).optional(),
    language: z.string().max(50).optional(),
  })
  .optional();

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email.")
    .max(254),
  message: z
    .string()
    .trim()
    .min(10, "Please share at least a few sentences.")
    .max(5000),
  projectType: z.enum(PROJECT_TYPES, {
    error: "Please select a project type.",
  }),
  company: z.string().optional(),
  client: clientMetadataSchema,
});

/** Client-side form fields (no honeypot/metadata) — same rules as the API. */
export const contactClientFieldsSchema = contactFormSchema.pick({
  name: true,
  email: true,
  message: true,
  projectType: true,
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;
export type ContactClientFields = z.infer<typeof contactClientFieldsSchema>;
export type ClientMetadata = z.infer<typeof clientMetadataSchema>;

export function isHoneypotTriggered(company: string | undefined): boolean {
  return (company ?? "").trim().length > 0;
}

export function formatValidationErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}
