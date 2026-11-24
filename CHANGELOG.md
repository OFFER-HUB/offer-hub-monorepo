# Changelog

## [Unreleased]

### Added

- Unified `/product` page merging `/architecture` and `/blueprint` with four keyboard-accessible tabs: Architecture, Orchestrator, Template, and Roadmap (`#architecture`, `#orchestrator`, `#template`, `#roadmap`).
- Desktop and mobile "Product" navigation link in Navbar with exact active state detection.
- Permanent 308 redirects from `/architecture` to `/product#architecture` and `/blueprint` to `/product#orchestrator`.
- Unified Roadmap section combining traction metrics, SCF tranche deliverables, and evolution milestones with shared status badges.

### Changed

- Updated XML sitemap replacing `/blueprint` with `/product`.
- Replaced arbitrary borders, radiuses, and hardcoded palette colors across architecture and blueprint components with theme tokens.
- Replaced external links to `docs.offerhub.io` and `app.offerhub.io` with canonical internal routes and `offer-hub.tech`.

### Security

- Update DOMPurify and body-parser to patched releases and move frontend and
  MCP validation to Zod 4.6.7 to resolve high-severity production dependency
  advisories without weakening the production audit gate.
