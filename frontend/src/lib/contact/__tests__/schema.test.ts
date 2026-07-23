import { describe, expect, it } from "vitest";

import {
  contactClientFieldsSchema,
  contactFormSchema,
  formatValidationErrors,
  isHoneypotTriggered,
  PROJECT_TYPES,
} from "@/lib/contact/schema";

const validPayload = {
  name: "Goose Client",
  email: "client@example.com",
  message: "Need a cinematic wedding film for September.",
  projectType: "wedding_film_edit" as const,
  company: "",
};

describe("contactFormSchema", () => {
  it("accepts valid payloads with required project type", () => {
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

  it("rejects missing project type", () => {
    const result = contactFormSchema.safeParse({
      name: validPayload.name,
      email: validPayload.email,
      message: validPayload.message,
    });
    expect(result.success).toBe(false);
  });

  it("rejects free-text project types", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
      projectType: "Wedding film",
    });
    expect(result.success).toBe(false);
  });

  it("accepts every project type enum value", () => {
    for (const projectType of PROJECT_TYPES) {
      const result = contactFormSchema.safeParse({
        ...validPayload,
        projectType,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts client metadata alongside required fields", () => {
    const result = contactFormSchema.safeParse({
      ...validPayload,
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

describe("contactClientFieldsSchema", () => {
  it("shares the same field rules as the API schema", () => {
    const result = contactClientFieldsSchema.safeParse({
      name: validPayload.name,
      email: validPayload.email,
      message: validPayload.message,
      projectType: validPayload.projectType,
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
