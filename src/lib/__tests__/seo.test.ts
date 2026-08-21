import { describe, it, expect } from "vitest";
import { buildPageMetadata, SITE_URL } from "../seo";
import { SITE_URL_FALLBACK, SITE_NAME } from "@/constants/site";

const INPUT = {
  title: "Privacy Policy",
  description: "How OFFER-HUB collects, uses, and protects your data.",
  keywords: ["privacy policy", "GDPR"],
  path: "/privacy",
  ogImageAlt: "OFFER-HUB Privacy Policy",
};

describe("SITE_URL", () => {
  it("re-exports the shared site constant", () => {
    expect(SITE_URL).toBe(SITE_URL_FALLBACK);
  });

  it("is an absolute origin with no trailing slash, so path concatenation is safe", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});

describe("buildPageMetadata", () => {
  it("passes title, description and keywords straight through", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.title).toBe("Privacy Policy");
    expect(meta.description).toBe(INPUT.description);
    expect(meta.keywords).toEqual(["privacy policy", "GDPR"]);
  });

  it("builds an absolute canonical from SITE_URL and the route path", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.alternates?.canonical).toBe(SITE_URL + "/privacy");
  });

  it("points og:url at the same absolute URL as the canonical", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.openGraph?.url).toBe(meta.alternates?.canonical);
  });

  it("defaults the social title to 'title | SITE_NAME' since the layout template does not apply", () => {
    const meta = buildPageMetadata(INPUT);

    const expected = "Privacy Policy | " + SITE_NAME;
    expect(meta.openGraph?.title).toBe(expected);
    expect(meta.twitter?.title).toBe(expected);
  });

  it("uses socialTitle verbatim when given, without appending the site name", () => {
    const meta = buildPageMetadata({
      ...INPUT,
      socialTitle: "Privacy at OFFER-HUB",
    });

    expect(meta.openGraph?.title).toBe("Privacy at OFFER-HUB");
    expect(meta.twitter?.title).toBe("Privacy at OFFER-HUB");
  });

  it("derives the default OG image from the path", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.openGraph?.images).toEqual([
      {
        url: "/og/privacy.png",
        width: 1200,
        height: 630,
        alt: "OFFER-HUB Privacy Policy",
      },
    ]);
  });

  it("honours an explicit ogImage in both the OG and Twitter blocks", () => {
    const meta = buildPageMetadata({ ...INPUT, ogImage: "/og-custom.png" });

    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/og-custom.png" }),
    ]);
    expect(meta.twitter?.images).toEqual(["/og-custom.png"]);
  });

  it("emits a summary_large_image Twitter card mirroring the OG image", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      description: INPUT.description,
      images: ["/og/privacy.png"],
    });
  });

  it("sets the OG site name, locale and type", () => {
    const meta = buildPageMetadata(INPUT);

    expect(meta.openGraph).toMatchObject({
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    });
  });

  it("handles a nested route path in both the canonical and the image", () => {
    const meta = buildPageMetadata({ ...INPUT, path: "/docs/api-reference" });

    expect(meta.alternates?.canonical).toBe(SITE_URL + "/docs/api-reference");
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/og/docs/api-reference.png" }),
    ]);
  });

  it("keeps the OG image at the 1200x630 social card size", () => {
    const images = buildPageMetadata(INPUT).openGraph?.images as Array<{
      width: number;
      height: number;
    }>;

    expect(images[0]).toMatchObject({ width: 1200, height: 630 });
  });
});
