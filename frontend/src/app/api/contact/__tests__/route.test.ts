import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendContactEmailMock, checkContactRateLimitMock } = vi.hoisted(() => ({
  sendContactEmailMock: vi.fn(),
  checkContactRateLimitMock: vi.fn(),
}));

vi.mock("@/lib/contact/send-contact-email", () => ({
  ContactEmailError: class ContactEmailError extends Error {},
  sendContactEmail: sendContactEmailMock,
}));

vi.mock("@/lib/contact/rate-limit", () => ({
  checkContactRateLimit: checkContactRateLimitMock,
}));

vi.mock("@/lib/contact/env", () => ({
  isContactEmailConfigured: () => true,
}));

import { POST } from "@/app/api/contact/route";

function createRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Goose Client",
  email: "client@example.com",
  message: "Need a cinematic wedding film for September.",
  projectType: "Wedding film",
  company: "",
  client: {
    pageUrl: "/contact",
    timezone: "America/Chicago",
    screenSize: "1440x900",
    viewport: "1280x720",
    language: "en-US",
  },
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkContactRateLimitMock.mockResolvedValue({ success: true });
    sendContactEmailMock.mockResolvedValue({ id: "email_123" });
  });

  it("returns 200 for valid submissions", async () => {
    const response = await POST(
      createRequest(validBody, { "x-real-ip": "203.0.113.10" }) as never,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(sendContactEmailMock).toHaveBeenCalledOnce();
  });

  it("returns 400 for invalid payloads", async () => {
    const response = await POST(
      createRequest({
        ...validBody,
        email: "invalid",
      }) as never,
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeTruthy();
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("returns silent success for honeypot submissions", async () => {
    const response = await POST(
      createRequest({
        ...validBody,
        company: "Acme Corp",
      }) as never,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    checkContactRateLimitMock.mockResolvedValueOnce({ success: false });

    const response = await POST(createRequest(validBody) as never);
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toContain("Too many requests");
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });
});
