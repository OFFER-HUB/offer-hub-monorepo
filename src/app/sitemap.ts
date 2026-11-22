import { MetadataRoute } from 'next';
import docsIndex from '@/data/docs-index.json';
import { SITE_URL_FALLBACK } from '@/constants/site';
import { GITHUB_RELEASES_API_URL } from '@/constants/github';

async function hasPublishedReleases(): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_RELEASES_API_URL}?per_page=1`, {
      next: { revalidate: 3600 },
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const releases: unknown = await response.json();
    return Array.isArray(releases) && releases.length > 0;
  } catch {
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL_FALLBACK;
  const includeChangelog = await hasPublishedReleases();

  const staticRoutes = [
    '',
    '/use-cases',
    '/product',
    '/pricing',
    ...(includeChangelog ? ['/changelog'] : []),
    '/community',
    '/docs',
    '/terms',
    '/privacy',
    '/contact',
    '/accessibility',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const docPaths = new Set<string>();

  if (Array.isArray(docsIndex)) {
    docsIndex.forEach((entry) => {
      if (entry.link) {
        // Strip out the hash fragment from the link to get the page URL
        const basePath = entry.link.split('#')[0];
        if (basePath && basePath.startsWith('/docs/')) {
          docPaths.add(basePath);
        }
      }
    });
  }

  docPaths.forEach((docPath) => {
    sitemapEntries.push({
      url: `${baseUrl}${docPath}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return sitemapEntries;
}
