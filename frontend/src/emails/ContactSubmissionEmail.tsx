import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { ContactSubmissionMetadata } from "@/lib/contact/request-metadata";
import {
  formatCoordinates,
  formatLocation,
} from "@/lib/contact/request-metadata";
import { BRAND } from "@/lib/constants";

export interface ContactSubmissionEmailProps {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly projectType?: string;
  readonly metadata: ContactSubmissionMetadata;
}

function MetadataRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null | undefined;
}): React.ReactElement | null {
  if (!value) {
    return null;
  }

  return (
    <Text style={metadataRow}>
      <span style={metadataLabel}>{label}: </span>
      {value}
    </Text>
  );
}

export function ContactSubmissionEmail({
  name,
  email,
  message,
  projectType,
  metadata,
}: ContactSubmissionEmailProps): React.ReactElement {
  const location = formatLocation(metadata.server);
  const coordinates = formatCoordinates(metadata.server);
  const previewText = `New inquiry from ${name}${projectType ? ` — ${projectType}` : ""}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={eyebrow}>New contact form submission</Text>
            <Heading style={heading}>{BRAND.name}</Heading>
            <Text style={timestamp}>
              Received {formatTimestamp(metadata.server.submittedAt)}
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Contact details
            </Heading>
            <MetadataRow label="Name" value={name} />
            <Text style={metadataRow}>
              <span style={metadataLabel}>Email: </span>
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>
            </Text>
            <MetadataRow label="Project type" value={projectType} />
          </Section>

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Message
            </Heading>
            <Text style={messageBlock}>{message}</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Server-detected context
            </Heading>
            <MetadataRow label="IP address" value={metadata.server.ip} />
            <MetadataRow label="Location" value={location} />
            <MetadataRow label="Coordinates" value={coordinates} />
            <MetadataRow label="Timezone" value={metadata.server.timezone} />
            <MetadataRow label="Browser" value={metadata.server.browser} />
            <MetadataRow label="Operating system" value={metadata.server.os} />
            <MetadataRow label="Device" value={metadata.server.device} />
            <MetadataRow label="Referrer" value={metadata.server.referrer} />
            <MetadataRow label="Request ID" value={metadata.server.requestId} />
            <MetadataRow label="User agent" value={metadata.server.userAgent} />
          </Section>

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Client-reported context
            </Heading>
            <MetadataRow label="Page URL" value={metadata.client?.pageUrl} />
            <MetadataRow label="Timezone" value={metadata.client?.timezone} />
            <MetadataRow label="Screen size" value={metadata.client?.screenSize} />
            <MetadataRow label="Viewport" value={metadata.client?.viewport} />
            <MetadataRow label="Language" value={metadata.client?.language} />
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Reply to this email to respond directly to {name}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const body = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "640px",
  padding: "32px",
};

const header = {
  marginBottom: "8px",
};

const eyebrow = {
  color: "#71717a",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#09090b",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 8px",
};

const timestamp = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const divider = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
};

const section = {
  marginBottom: "8px",
};

const sectionHeading = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.4",
  margin: "0 0 12px",
};

const metadataRow = {
  color: "#3f3f46",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 6px",
};

const metadataLabel = {
  color: "#71717a",
  fontWeight: "600",
};

const messageBlock = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderRadius: "6px",
  color: "#18181b",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0",
  padding: "16px",
  whiteSpace: "pre-wrap" as const,
};

const link = {
  color: "#18181b",
  textDecoration: "underline",
};

const footer = {
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

export function buildContactSubmissionPlainText({
  name,
  email,
  message,
  projectType,
  metadata,
}: ContactSubmissionEmailProps): string {
  const lines = [
    `${BRAND.name} — New contact form submission`,
    `Received: ${metadata.server.submittedAt}`,
    "",
    "CONTACT DETAILS",
    `Name: ${name}`,
    `Email: ${email}`,
    projectType ? `Project type: ${projectType}` : null,
    "",
    "MESSAGE",
    message,
    "",
    "SERVER-DETECTED CONTEXT",
    `IP address: ${metadata.server.ip}`,
    formatLocation(metadata.server)
      ? `Location: ${formatLocation(metadata.server)}`
      : null,
    formatCoordinates(metadata.server)
      ? `Coordinates: ${formatCoordinates(metadata.server)}`
      : null,
    metadata.server.timezone ? `Timezone: ${metadata.server.timezone}` : null,
    metadata.server.browser ? `Browser: ${metadata.server.browser}` : null,
    metadata.server.os ? `Operating system: ${metadata.server.os}` : null,
    metadata.server.device ? `Device: ${metadata.server.device}` : null,
    metadata.server.referrer ? `Referrer: ${metadata.server.referrer}` : null,
    metadata.server.requestId
      ? `Request ID: ${metadata.server.requestId}`
      : null,
    metadata.server.userAgent
      ? `User agent: ${metadata.server.userAgent}`
      : null,
    "",
    "CLIENT-REPORTED CONTEXT",
    metadata.client?.pageUrl ? `Page URL: ${metadata.client.pageUrl}` : null,
    metadata.client?.timezone
      ? `Timezone: ${metadata.client.timezone}`
      : null,
    metadata.client?.screenSize
      ? `Screen size: ${metadata.client.screenSize}`
      : null,
    metadata.client?.viewport
      ? `Viewport: ${metadata.client.viewport}`
      : null,
    metadata.client?.language ? `Language: ${metadata.client.language}` : null,
    "",
    `Reply to this email to respond directly to ${name}.`,
  ];

  return lines.filter((line): line is string => line !== null).join("\n");
}
