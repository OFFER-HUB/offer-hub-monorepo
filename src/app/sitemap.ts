import { MetadataRoute } from 'next';
import docsIndex from '@/data/docs-index.json';
import { SITE_URL_FALLBACK } from '@/constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL_FALLBACK;

  const staticRoutes = [
    '',
    '/use-cases',
    '/blueprint',
    '/pricing',
    '/changelog',
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
