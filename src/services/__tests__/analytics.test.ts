import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  VISITOR_ID_KEY,
  SESSION_ID_KEY,
} from "@/constants/storage";

const state = vi.hoisted(() => ({
  configured: true,
  supabase: null as unknown,
}));

vi.mock("@/lib/supabase", () => ({
  get supabase() {
    return state.supabase;
  },
  get isSupabaseConfigured() {
    return state.configured;
  },
}));

vi.mock("@/utils/device", () => ({
  getBrowserName: () => "Chrome",
  getDeviceType: () => "desktop",
  getOSName: () => "MacOS",
}));

vi.mock("@/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const getGeolocation = vi.hoisted(() => vi.fn());
vi.mock("../geolocation", () => ({ getGeolocation }));

import {
  generateVisitorId,
  getSessionId,
  getUTMParams,
  trackPageView,
} from "../analytics";
import { logger } from "@/utils/logger";

const insert = vi.fn();
const upsert = vi.fn();
const from = vi.fn(() => ({ insert, upsert }));

const GEO = {
  ip: "203.0.113.7",
  country: "Costa Rica",
  country_code: "CR",
  city: "San Jose",
  region: "San Jose",
  timezone: "America/Costa_Rica",
};

/** Lets the un-awaited then-chains inside trackPageView settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function grantConsent() {
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
}

let uuidCounter = 0;
type Uuid = `${string}-${string}-${string}-${string}-${string}`;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  uuidCounter = 0;

  insert.mockReset().mockResolvedValue({ error: null });
  upsert.mockReset().mockResolvedValue({ error: null });
  from.mockClear();
  getGeolocation.mockReset().mockResolvedValue(GEO);

  state.configured = true;
  state.supabase = { from };

  vi.spyOn(crypto, "randomUUID").mockImplementation(
    () => `uuid-${++uuidCounter}` as Uuid,
  );
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateVisitorId", () => {
  it("returns an empty id and persists nothing without cookie consent", () => {
    expect(generateVisitorId()).toBe("");
    expect(localStorage.getItem(VISITOR_ID_KEY)).toBeNull();
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it.each(["rejected", "pending", ""])(
    "treats consent value %j as not accepted",
    (value) => {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);

      expect(generateVisitorId()).toBe("");
      expect(localStorage.getItem(VISITOR_ID_KEY)).toBeNull();
    },
  );

  it("does not return a previously stored id once consent is withdrawn", () => {
    localStorage.setItem(VISITOR_ID_KEY, "visitor_existing");
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");

    expect(generateVisitorId()).toBe("");
  });

  it("generates and persists a prefixed id when consent is accepted", () => {
    grantConsent();

    expect(generateVisitorId()).toBe("visitor_uuid-1");
    expect(localStorage.getItem(VISITOR_ID_KEY)).toBe("visitor_uuid-1");
  });

  it("reuses the stored id on subsequent calls", () => {
    grantConsent();

    const first = generateVisitorId();
    const second = generateVisitorId();

    expect(second).toBe(first);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });
});

describe("getSessionId", () => {
  it("generates and persists a prefixed session id in sessionStorage", () => {
    expect(getSessionId()).toBe("session_uuid-1");
    expect(sessionStorage.getItem(SESSION_ID_KEY)).toBe("session_uuid-1");
  });

  it("reuses the stored session id", () => {
    sessionStorage.setItem(SESSION_ID_KEY, "session_existing");

    expect(getSessionId()).toBe("session_existing");
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });
});

describe("getUTMParams", () => {
  it("returns all three keys as undefined when no UTM params are present", () => {
    expect(getUTMParams()).toEqual({
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
    });
  });

  it("reads the three UTM params off the current URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=twitter&utm_medium=social&utm_campaign=launch",
    );

    expect(getUTMParams()).toEqual({
      utm_source: "twitter",
      utm_medium: "social",
      utm_campaign: "launch",
    });
  });

  it("normalises an empty param value to undefined rather than an empty string", () => {
    window.history.replaceState({}, "", "/?utm_source=&utm_medium=email");

    expect(getUTMParams()).toEqual({
      utm_source: undefined,
      utm_medium: "email",
      utm_campaign: undefined,
    });
  });

  it("ignores unrelated query params", () => {
    window.history.replaceState({}, "", "/?ref=hn&utm_source=hn");

    expect(getUTMParams()).not.toHaveProperty("ref");
  });
});

describe("trackPageView - cookie consent gate", () => {
  it("writes nothing anywhere when consent has never been given", async () => {
    await trackPageView("/pricing", "Pricing");
    await flush();

    expect(from).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
    expect(getGeolocation).not.toHaveBeenCalled();
    expect(crypto.randomUUID).not.toHaveBeenCalled();
    expect(localStorage.getItem(VISITOR_ID_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_ID_KEY)).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it.each(["rejected", "declined", "", "Accepted", "accepted "])(
    "writes nothing when cookie_consent is %j",
    async (value) => {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);

      await trackPageView("/pricing");
      await flush();

      expect(insert).not.toHaveBeenCalled();
      expect(upsert).not.toHaveBeenCalled();
      expect(localStorage.getItem(VISITOR_ID_KEY)).toBeNull();
      expect(sessionStorage.getItem(SESSION_ID_KEY)).toBeNull();
    },
  );

  it("does not fall back to tracking when Supabase is configured but consent is missing", async () => {
    state.configured = true;

    await trackPageView("/");
    await flush();

    expect(from).not.toHaveBeenCalled();
  });
});

describe("trackPageView - Supabase not configured", () => {
  it("returns early when isSupabaseConfigured is false", async () => {
    grantConsent();
    state.configured = false;

    await trackPageView("/pricing");
    await flush();

    expect(from).not.toHaveBeenCalled();
    expect(getGeolocation).not.toHaveBeenCalled();
  });

  it("returns early when the client is null even if the flag says configured", async () => {
    grantConsent();
    state.supabase = null;

    await trackPageView("/pricing");
    await flush();

    expect(from).not.toHaveBeenCalled();
    expect(getGeolocation).not.toHaveBeenCalled();
  });
});

describe("trackPageView - happy path", () => {
  it("inserts a page_views row with the identifiers, device data and UTM params", async () => {
    grantConsent();
    window.history.replaceState({}, "", "/pricing?utm_source=twitter");

    await trackPageView("/pricing", "Pricing");
    await flush();

    expect(from).toHaveBeenCalledWith("page_views");
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        visitor_id: "visitor_uuid-1",
        session_id: "session_uuid-2",
        page_path: "/pricing",
        page_title: "Pricing",
        browser: "Chrome",
        device: "desktop",
        os: "MacOS",
        user_agent: navigator.userAgent,
        screen_width: screen.width,
        screen_height: screen.height,
        utm_source: "twitter",
        utm_medium: undefined,
        utm_campaign: undefined,
      }),
    ]);
  });

  it("falls back to document.title when no page title is passed", async () => {
    grantConsent();
    document.title = "OFFER-HUB Home";

    await trackPageView("/");
    await flush();

    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({ page_title: "OFFER-HUB Home" }),
    ]);
  });

  it("sends referrer as undefined when document.referrer is empty", async () => {
    grantConsent();

    await trackPageView("/");
    await flush();

    const [[rows]] = insert.mock.calls as [[Record<string, unknown>[]]];
    expect(rows[0].referrer).toBeUndefined();
  });

  it("upserts the visitor row with geolocation data, keyed on visitor_id", async () => {
    grantConsent();

    await trackPageView("/pricing");
    await flush();

    expect(from).toHaveBeenCalledWith("visitors");
    expect(upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          visitor_id: "visitor_uuid-1",
          ip_address: GEO.ip,
          country: GEO.country,
          country_code: GEO.country_code,
          city: GEO.city,
          region: GEO.region,
          timezone: GEO.timezone,
          browser: "Chrome",
          device: "desktop",
          os: "MacOS",
        }),
      ],
      { onConflict: VISITOR_ID_KEY },
    );
  });

  it("stamps last_seen with an ISO timestamp", async () => {
    grantConsent();

    await trackPageView("/");
    await flush();

    const [[rows]] = upsert.mock.calls as [[Record<string, string>[]]];
    expect(rows[0].last_seen).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
  });

  it("reuses the identifiers already in storage instead of minting new ones", async () => {
    grantConsent();
    localStorage.setItem(VISITOR_ID_KEY, "visitor_existing");
    sessionStorage.setItem(SESSION_ID_KEY, "session_existing");

    await trackPageView("/");
    await flush();

    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        visitor_id: "visitor_existing",
        session_id: "session_existing",
      }),
    ]);
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it("still records the page view when geolocation returns nothing", async () => {
    grantConsent();
    getGeolocation.mockResolvedValue({});

    await trackPageView("/");
    await flush();

    expect(insert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith(
      [expect.objectContaining({ ip_address: undefined, country: undefined })],
      { onConflict: VISITOR_ID_KEY },
    );
  });
});

describe("trackPageView - error handling", () => {
  it("warns instead of throwing when the page_views insert returns an error", async () => {
    grantConsent();
    insert.mockResolvedValue({ error: { message: "row-level security" } });

    await expect(trackPageView("/")).resolves.toBeUndefined();
    await flush();

    expect(logger.warn).toHaveBeenCalledWith(
      "[Analytics] Page view:",
      "row-level security",
    );
  });

  it("stringifies an error object that has no message", async () => {
    grantConsent();
    insert.mockResolvedValue({ error: { code: "42501" } });

    await trackPageView("/");
    await flush();

    expect(logger.warn).toHaveBeenCalledWith(
      "[Analytics] Page view:",
      JSON.stringify({ code: "42501" }),
    );
  });

  it("warns when the visitor upsert returns an error", async () => {
    grantConsent();
    upsert.mockResolvedValue({ error: { message: "conflict" } });

    await trackPageView("/");
    await flush();

    expect(logger.warn).toHaveBeenCalledWith(
      "[Analytics] Visitor upsert:",
      "conflict",
    );
  });

  it("logs and swallows a synchronous failure inside the tracking body", async () => {
    grantConsent();
    from.mockImplementationOnce(() => {
      throw new Error("client exploded");
    });

    await expect(trackPageView("/")).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(
      "Error in trackPageView:",
      expect.any(Error),
    );
  });
});
