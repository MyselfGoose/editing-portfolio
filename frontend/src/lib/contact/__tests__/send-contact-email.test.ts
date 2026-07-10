import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class ResendMock {
    emails = {
      send: sendMock,
    };
  },
}));

import { CONTACT } from "@/lib/constants";
import {
  ContactEmailError,
  sendContactEmail,
} from "@/lib/contact/send-contact-email";

const metadata = {
  server: {
    ip: "203.0.113.10",
    city: "Austin",
    region: "TX",
    country: "US",
    latitude: "30.2672",
    longitude: "-97.7431",
    timezone: "America/Chicago",
    browser: "Chrome 120",
    os: "macOS 10.15",
    device: null,
    userAgent: "Mozilla/5.0",
    referrer: "https://goose-productions.com/contact",
    submittedAt: "2026-07-10T12:00:00.000Z",
    requestId: "sfo1::abc123",
  },
  client: {
    pageUrl: "/contact",
    timezone: "America/Chicago",
    screenSize: "1440x900",
    viewport: "1280x720",
    language: "en-US",
  },
};

describe("sendContactEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_FORM_FROM =
      "Goose Productions <contact@goose-productions.com>";
  });

  it("sends email with reply-to, recipient, and subject", async () => {
    sendMock.mockResolvedValueOnce({ data: { id: "email_123" }, error: null });

    const result = await sendContactEmail({
      name: "Goose Client",
      email: "client@example.com",
      message: "Need a cinematic wedding film for September.",
      projectType: "Wedding film",
      metadata,
    });

    expect(result).toEqual({ id: "email_123" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Goose Productions <contact@goose-productions.com>",
        to: CONTACT.email,
        replyTo: "client@example.com",
        subject: "New inquiry from Goose Client — Wedding film",
        text: expect.stringContaining("Goose Client"),
      }),
    );
  });

  it("throws when resend api key is missing", async () => {
    delete process.env.RESEND_API_KEY;

    await expect(
      sendContactEmail({
        name: "Goose Client",
        email: "client@example.com",
        message: "Need a cinematic wedding film for September.",
        metadata,
      }),
    ).rejects.toBeInstanceOf(ContactEmailError);
  });

  it("throws when resend returns an error", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid API key" },
    });

    await expect(
      sendContactEmail({
        name: "Goose Client",
        email: "client@example.com",
        message: "Need a cinematic wedding film for September.",
        metadata,
      }),
    ).rejects.toBeInstanceOf(ContactEmailError);
  });
});
