import { UAParser } from "ua-parser-js";

import type { ClientMetadata } from "@/lib/contact/schema";

export interface ServerRequestMetadata {
  readonly ip: string;
  readonly city: string | null;
  readonly region: string | null;
  readonly country: string | null;
  readonly latitude: string | null;
  readonly longitude: string | null;
  readonly timezone: string | null;
  readonly browser: string | null;
  readonly os: string | null;
  readonly device: string | null;
  readonly userAgent: string | null;
  readonly referrer: string | null;
  readonly submittedAt: string;
  readonly requestId: string | null;
}

export interface ContactSubmissionMetadata {
  readonly server: ServerRequestMetadata;
  readonly client: ClientMetadata;
}

function headerValue(headers: Headers, name: string): string | null {
  const value = headers.get(name);
  if (!value || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export function getClientIp(headers: Headers): string {
  const forwarded = headerValue(headers, "x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }

  return headerValue(headers, "x-real-ip") ?? "unknown";
}

export function extractServerMetadata(
  headers: Headers,
  submittedAt: string = new Date().toISOString(),
): ServerRequestMetadata {
  const userAgent = headerValue(headers, "user-agent");
  const parser = new UAParser(userAgent ?? undefined);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    ip: getClientIp(headers),
    city: headerValue(headers, "x-vercel-ip-city"),
    region: headerValue(headers, "x-vercel-ip-country-region"),
    country: headerValue(headers, "x-vercel-ip-country"),
    latitude: headerValue(headers, "x-vercel-ip-latitude"),
    longitude: headerValue(headers, "x-vercel-ip-longitude"),
    timezone: headerValue(headers, "x-vercel-ip-timezone"),
    browser: formatNameVersion(browser.name, browser.version),
    os: formatNameVersion(os.name, os.version),
    device: formatDevice(device.type, device.vendor, device.model),
    userAgent,
    referrer: headerValue(headers, "referer"),
    submittedAt,
    requestId: headerValue(headers, "x-vercel-id"),
  };
}

export function buildSubmissionMetadata(
  headers: Headers,
  client: ClientMetadata,
  submittedAt?: string,
): ContactSubmissionMetadata {
  return {
    server: extractServerMetadata(headers, submittedAt),
    client: client ?? {},
  };
}

function formatNameVersion(
  name: string | undefined,
  version: string | undefined,
): string | null {
  if (!name) {
    return null;
  }
  return version ? `${name} ${version}` : name;
}

function formatDevice(
  type: string | undefined,
  vendor: string | undefined,
  model: string | undefined,
): string | null {
  const parts = [type, vendor, model].filter(
    (part): part is string => Boolean(part && part.trim().length > 0),
  );

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" · ");
}

export function formatLocation(server: ServerRequestMetadata): string | null {
  const locationParts = [server.city, server.region, server.country].filter(
    (part): part is string => Boolean(part),
  );

  if (locationParts.length === 0) {
    return null;
  }

  return locationParts.join(", ");
}

export function formatCoordinates(server: ServerRequestMetadata): string | null {
  if (!server.latitude || !server.longitude) {
    return null;
  }

  return `${server.latitude}, ${server.longitude}`;
}
