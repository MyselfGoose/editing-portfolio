import { describe, expect, it } from "vitest";

import {
  contactFormSchema,
  formatValidationErrors,
  isHoneypotTriggered,
} from "@/lib/contact/schema";

const validPayload = {
  name: "Goose Client",
  email: "client@example.com",
  message: "Need a cinematic wedding film for September.",
  projectType: "Wedding film",
  company: "",
};

describe("contactFormSchema", () => {
  it("accepts valid payloads", () => {
    const result = contactFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects short names", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short messages", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
      message: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional project type and client metadata", () => {
    const result = contactFormSchema.safeParse({
      name: validPayload.name,
      email: validPayload.email,
      message: validPayload.message,
      client: {
        pageUrl: "/contact",
        timezone: "America/Chicago",
        screenSize: "1440x900",
        viewport: "1280x720",
        language: "en-US",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("isHoneypotTriggered", () => {
  it("returns false for empty honeypot values", () => {
    expect(isHoneypotTriggered("")).toBe(false);
    expect(isHoneypotTriggered(undefined)).toBe(false);
    expect(isHoneypotTriggered("   ")).toBe(false);
  });

  it("returns true when honeypot has content", () => {
    expect(isHoneypotTriggered("Acme Corp")).toBe(true);
  });
});

describe("formatValidationErrors", () => {
  it("maps zod issues to field errors", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
      email: "invalid",
    });

    if (result.success) {
      throw new Error("Expected validation to fail.");
    }

    expect(formatValidationErrors(result.error)).toEqual({
      email: "Please enter a valid email.",
    });
  });
});
