# Per-page Open Graph images

Each non-home route declares its own OG image via `buildPageMetadata()` in
`src/lib/seo.ts`, which defaults the path to `/og{route}.png`.

**These image files do not exist yet.** Per issue #1452 the paths are declared
first so crawlers receive distinct metadata per URL; the assets land in a
follow-up. Until they do, a shared link resolves to a 404 image rather than the
generic `/og-image.png` — so the follow-up should land before the next deploy
that matters for social sharing.

Expected files (1200×630 PNG each):

| Route           | File                     |
| --------------- | ------------------------ |
| `/architecture` | `og/architecture.png`    |
| `/blueprint`    | `og/blueprint.png`       |
| `/changelog`    | `og/changelog.png`       |
| `/community`    | `og/community.png`       |
| `/contact`      | `og/contact.png`         |
| `/pricing`      | `og/pricing.png`         |
| `/privacy`      | `og/privacy.png`         |
| `/terms`        | `og/terms.png`           |
| `/use-cases`    | `og/use-cases.png`       |
| `/accessibility`| `og/accessibility.png`   |

`/` keeps the existing root-level `/og-image.png`.

The alternative to static files is a per-route `opengraph-image.tsx` using the
Next.js `ImageResponse` API, which generates these at build time from the title
and description instead of hand-designed assets:
https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
