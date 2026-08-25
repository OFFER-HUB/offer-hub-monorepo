import { GEO_CACHE_KEY } from '@/constants/storage';

export interface GeoData {
  ip?: string;
  country?: string;
  country_code?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

// Get geolocation data from IP (cached per session)
const emptyGeo: GeoData = {
  ip: undefined,
  country: undefined,
  country_code: undefined,
  city: undefined,
  region: undefined,
  timezone: undefined,
};

export async function getGeolocation(): Promise<GeoData> {
  const CACHE_KEY = GEO_CACHE_KEY;

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch geolocation');

      const data = await response.json();
      const geo = {
        ip: data.ip,
        country: data.country_name,
        country_code: data.country_code,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
      };

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(geo));
      return geo;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    // Cache the empty result so we don't retry on every navigation
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(emptyGeo));
    return emptyGeo;
  }
}
