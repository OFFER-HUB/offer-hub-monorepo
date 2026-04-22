import type { MetadataRoute } from "next";

const BASE_URL = "https://offer-hub.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/pricing",
    "/docs",
    "/changelog",
    "/community",
    "/blueprint",
    "/terms",
    "/privacy",
  ];

  return staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
  }));
}
