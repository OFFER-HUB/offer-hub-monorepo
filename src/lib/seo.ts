import type { Metadata } from "next";

export const SITE_URL = "https://offer-hub.tech";
export const SITE_NAME = "OFFER-HUB";

type PageSeoInput = {
  /** Feeds `metadata.title`, so the root layout's "%s | OFFER-HUB" template applies */
  title: string;
  description: string;
  keywords: string[];
  /** Route path, e.g. "/privacy". Drives canonical, og:url, and the default OG image */
  path: string;
  /** Social title. The title template does NOT apply to openGraph/twitter titles */
  socialTitle?: string;
  /** Defaults to `/og{path}.png` — see public/og/README.md */
  ogImage?: string;
  ogImageAlt: string;
};

/**
 * Builds the per-page metadata block: canonical, Open Graph, and Twitter card.
 * Without this, pages fall back to the root layout's generic /og-image.png and
 * its canonical of "/", which points every sub-route at the homepage.
 */
export function buildPageMetadata({
  title,
  description,
  keywords,
  path,
  socialTitle,
  ogImage = `/og${path}.png`,
  ogImageAlt,
}: PageSeoInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const social = socialTitle ?? `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: social,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description,
      images: [ogImage],
    },
  };
}
