import { createHash } from "crypto";
import { UAParser } from "ua-parser-js";
import { DeviceInfo } from "@/types/auth.types";

/**
 * Hash an IP address using SHA-256 for privacy
 * @param ip - Raw IP address
 * @returns Hashed IP address (hex)
 */
export function hashIP(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Parse a User-Agent string to extract device information
 * @param ua - User-Agent string
 * @returns Device info object
 */
export function parseDeviceInfo(ua: string, ip?: string): DeviceInfo {
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const type = (result.device.type as "desktop" | "mobile" | "tablet") || "desktop";
  const os = result.os.name || "Unknown";
  const browser = result.browser.name || "Unknown";
  const browserVersion = result.browser.version;

  return {
    type,
    os,
    browser,
    version: browserVersion,
    user_agent: ua,
    ip_address: ip || "unknown",
    ip_hash: ip ? hashIP(ip) : undefined,
    last_used_at: new Date(),
  };
}
