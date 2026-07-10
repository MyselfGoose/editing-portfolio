import { CONTACT } from "@/lib/constants";

const DEFAULT_FROM = "Goose Productions <contact@goose-productions.com>";

export function getContactFormFrom(): string {
  return process.env.CONTACT_FORM_FROM?.trim() || DEFAULT_FROM;
}

export function getContactFormTo(): string {
  return CONTACT.email;
}

export function getResendApiKey(): string | undefined {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey && apiKey.length > 0 ? apiKey : undefined;
}

export function isContactEmailConfigured(): boolean {
  return getResendApiKey() !== undefined;
}
