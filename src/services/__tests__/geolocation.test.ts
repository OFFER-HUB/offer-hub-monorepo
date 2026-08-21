import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGeolocation, type GeoData } from "../geolocation";
import { GEO_CACHE_KEY } from "@/constants/storage";

/** The key `geolocation.ts` hardcodes. Kept literal so a drift shows up below. */
const CACHE_KEY = "geo_cache";

const EMPTY_GEO: GeoData = {
  ip: undefined,
  country: undefined,
  country_code: undefined,
  city: undefined,
  region: undefined,
  timezone: undefined,
};

const IPAPI_PAYLOAD = {
  ip: "203.0.113.7",
  country_name: "Costa Rica",
  country_code: "CR",
  city: "San José",
  region: "San José",
  timezone: "America/Costa_Rica",
  // ipapi.co returns far more than the service keeps — none of it should leak.
  org: "Example ISP",
  latitude: 9.93,
};

const MAPPED_GEO: GeoData = {
  ip: "203.0.113.7",
  country: "Costa Rica",
  country_code: "CR",
  city: "San José",
  region: "San José",
  timezone: "America/Costa_Rica",
};

describe("getGeolocation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("uses the same cache key the storage constants declare", () => {
    expect(CACHE_KEY).toBe(GEO_CACHE_KEY);
  });

  it("returns the cached value without hitting the network", async () => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(MAPPED_GEO));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getGeolocation()).resolves.toEqual(MAPPED_GEO);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches ipapi.co, keeps only the six mapped fields, and caches them", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => IPAPI_PAYLOAD,
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getGeolocation()).resolves.toEqual(MAPPED_GEO);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ipapi.co/json/",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(JSON.parse(sessionStorage.getItem(CACHE_KEY)!)).toEqual(MAPPED_GEO);
  });

  it("caches the empty result on a non-ok response so it does not retry every navigation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) })),
    );

    await expect(getGeolocation()).resolves.toEqual(EMPTY_GEO);
    expect(JSON.parse(sessionStorage.getItem(CACHE_KEY)!)).toEqual({});
  });

  it("caches the empty result when the request rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(getGeolocation()).resolves.toEqual(EMPTY_GEO);
    expect(sessionStorage.getItem(CACHE_KEY)).toBe(JSON.stringify(EMPTY_GEO));
  });

  it("recovers from a corrupted cache entry instead of throwing", async () => {
    sessionStorage.setItem(CACHE_KEY, "{not-json");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getGeolocation()).resolves.toEqual(EMPTY_GEO);
    // The JSON.parse throw short-circuits before the request is ever made.
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(sessionStorage.getItem(CACHE_KEY)!)).toEqual({});
  });

  it("aborts the request after the 3s timeout and falls back to the empty result", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );

    const pending = getGeolocation();
    await vi.advanceTimersByTimeAsync(3000);

    await expect(pending).resolves.toEqual(EMPTY_GEO);
  });

  it("does not abort a request that resolves before the timeout", async () => {
    vi.useFakeTimers();
    let capturedSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: { signal: AbortSignal }) => {
        capturedSignal = init.signal;
        return { ok: true, json: async () => IPAPI_PAYLOAD };
      }),
    );

    await expect(getGeolocation()).resolves.toEqual(MAPPED_GEO);

    // The timeout is cleared in the `finally`, so advancing past it is a no-op.
    await vi.advanceTimersByTimeAsync(5000);
    expect(capturedSignal!.aborted).toBe(false);
  });
});
