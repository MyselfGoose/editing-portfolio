import { NextResponse, type NextRequest } from "next/server";

import { getClientIp } from "@/lib/contact/request-metadata";
import { buildSubmissionMetadata } from "@/lib/contact/request-metadata";
import { checkContactRateLimit } from "@/lib/contact/rate-limit";
import {
  contactFormSchema,
  formatValidationErrors,
  isHoneypotTriggered,
  projectTypeLabel,
} from "@/lib/contact/schema";
import {
  ContactEmailError,
  sendContactEmail,
} from "@/lib/contact/send-contact-email";
import { isContactEmailConfigured } from "@/lib/contact/env";

const MAX_BODY_BYTES = 16_384;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Expected application/json." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields and try again.",
        fields: formatValidationErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  if (isHoneypotTriggered(parsed.data.company)) {
    return NextResponse.json({ ok: true });
  }

  const clientIp = getClientIp(request.headers);
  const rateLimit = await checkContactRateLimit(clientIp);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  if (!isContactEmailConfigured()) {
    return NextResponse.json(
      { error: "Contact form is temporarily unavailable." },
      { status: 503 },
    );
  }

  const submittedAt = new Date().toISOString();
  const metadata = buildSubmissionMetadata(
    request.headers,
    parsed.data.client,
    submittedAt,
  );

  try {
    await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      projectType: projectTypeLabel(parsed.data.projectType),
      metadata,
    });
  } catch (error) {
    if (error instanceof ContactEmailError) {
      console.error("[contact] email delivery failed", error.cause ?? error);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again." },
        { status: 502 },
      );
    }

    console.error("[contact] unexpected error", error);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
