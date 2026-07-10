import { Resend } from "resend";

import {
  buildContactSubmissionPlainText,
  ContactSubmissionEmail,
} from "@/emails/ContactSubmissionEmail";
import {
  getContactFormFrom,
  getContactFormTo,
  getResendApiKey,
} from "@/lib/contact/env";
import type { ContactSubmissionMetadata } from "@/lib/contact/request-metadata";

export interface SendContactEmailInput {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly projectType?: string;
  readonly metadata: ContactSubmissionMetadata;
}

export interface SendContactEmailResult {
  readonly id: string;
}

export class ContactEmailError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ContactEmailError";
  }
}

function buildSubject(name: string, projectType?: string): string {
  if (projectType && projectType.trim().length > 0) {
    return `New inquiry from ${name} — ${projectType.trim()}`;
  }
  return `New inquiry from ${name}`;
}

export async function sendContactEmail(
  input: SendContactEmailInput,
): Promise<SendContactEmailResult> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new ContactEmailError("Contact email is not configured.");
  }

  const resend = new Resend(apiKey);
  const emailProps = {
    name: input.name,
    email: input.email,
    message: input.message,
    projectType: input.projectType,
    metadata: input.metadata,
  };

  const response = await resend.emails.send({
    from: getContactFormFrom(),
    to: getContactFormTo(),
    replyTo: input.email,
    subject: buildSubject(input.name, input.projectType),
    react: ContactSubmissionEmail(emailProps),
    text: buildContactSubmissionPlainText(emailProps),
  });

  if (response.error) {
    throw new ContactEmailError(
      "Failed to send contact email.",
      response.error,
    );
  }

  if (!response.data?.id) {
    throw new ContactEmailError("Failed to send contact email.");
  }

  return { id: response.data.id };
}
