import { z } from "zod";

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
  projectType: z.string().trim().max(100).optional(),
  company: z.string().optional(),
  client: clientMetadataSchema,
});

export type ContactFormPayload = z.infer<typeof contactFormSchema>;
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
