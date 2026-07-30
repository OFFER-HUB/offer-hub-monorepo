import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getBrowserName, getDeviceType, getOSName } from '@/utils/device';
import { getGeolocation } from './geolocation';
import { logger } from '@/utils/logger';

// Generate a unique visitor ID
export function generateVisitorId(): string {
  if (localStorage.getItem('cookie_consent') !== 'accepted') return '';
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;

  const visitorId = `visitor_${crypto.randomUUID()}`;
  localStorage.setItem('visitor_id', visitorId);
  return visitorId;
}

// Get session ID
export function getSessionId(): string {
  const stored = sessionStorage.getItem('session_id');
  if (stored) return stored;

  const sessionId = `session_${crypto.randomUUID()}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
}

// Get UTM parameters from URL
export function getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

// Track page view
export async function trackPageView(pagePath: string, pageTitle?: string): Promise<void> {
  if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') !== 'accepted') {
    return;
  }
  // Skip tracking if Supabase is not properly configured
  if (!isSupabaseConfigured) {
    return;
  }
  if (!supabase) {
    return;
  }
  const sb = supabase;

  try {
    const visitorId = generateVisitorId();
    const sessionId = getSessionId();
    const utm = getUTMParams();

    // Send page view immediately without waiting for geolocation
    const pageViewData = {
      visitor_id: visitorId,
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || undefined,
      session_id: sessionId,
      user_agent: navigator.userAgent,
      browser: getBrowserName(),
      device: getDeviceType(),
      os: getOSName(),
      screen_width: screen.width,
      screen_height: screen.height,
      ...utm,
    };

    sb
      .from('page_views')
      .insert([pageViewData])
      .then(({ error }) => {
        if (error) {
          const msg = (error as { message?: string })?.message ?? JSON.stringify(error);
          logger.warn('[Analytics] Page view:', msg);
        }
      });

    // Fetch geolocation in background and update visitor separately
    getGeolocation().then(geo => {
      sb
        .from('visitors')
        .upsert([{
          visitor_id: visitorId,
          last_seen: new Date().toISOString(),
          ip_address: geo.ip,
          country: geo.country,
          country_code: geo.country_code,
          city: geo.city,
          region: geo.region,
          timezone: geo.timezone,
          user_agent: navigator.userAgent,
          browser: getBrowserName(),
          device: getDeviceType(),
          os: getOSName(),
        }], { onConflict: 'visitor_id' })
        .then(({ error }) => {
          if (error) {
            const msg = (error as { message?: string })?.message ?? JSON.stringify(error);
            logger.warn('[Analytics] Visitor upsert:', msg);
          }
        });
    });
  } catch (error) {
    logger.error('Error in trackPageView:', error);
  }
}