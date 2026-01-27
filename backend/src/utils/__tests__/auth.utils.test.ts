import { parseDeviceInfo, hashIP } from "../auth.utils";

describe("Auth Utilities", () => {
  describe("hashIP", () => {
    it("should return a consistent SHA-256 hash for an IP", () => {
      const ip = "192.168.1.1";
      const hash = hashIP(ip);
      expect(hash).toHaveLength(64);
      expect(hashIP(ip)).toBe(hash);
    });

    it("should return 'unknown' for invalid/unknown IP", () => {
      expect(hashIP("")).toBe("unknown");
      expect(hashIP("unknown")).toBe("unknown");
    });
  });

  describe("parseDeviceInfo", () => {
    it("should parse a Chrome Windows User-Agent", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
      const info = parseDeviceInfo(ua, "1.1.1.1");

      expect(info.os).toBe("Windows");
      expect(info.browser).toBe("Chrome");
      expect(info.type).toBe("desktop");
      expect(info.ip_address).toBe("1.1.1.1");
      expect(info.ip_hash).toBeDefined();
    });

    it("should parse an iPhone Safari User-Agent", () => {
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
      const info = parseDeviceInfo(ua);

      expect(info.os).toBe("iOS");
      expect(info.browser).toBe("Mobile Safari");
      expect(info.type).toBe("mobile");
    });

    it("should parse an iPad Safari User-Agent", () => {
      const ua = "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
      const info = parseDeviceInfo(ua);

      expect(info.os).toBe("iOS");
      expect(info.browser).toBe("Mobile Safari");
      expect(info.type).toBe("tablet");
    });
  });
});
