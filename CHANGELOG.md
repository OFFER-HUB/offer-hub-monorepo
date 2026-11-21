# Changelog

## [Unreleased]

### Changed

- Consolidate theme surfaces onto six neumorphic shadow tokens and the
  12 / 16 / 24 / pill radius scale across pages, dialogs, and documentation.

### Security

- Update DOMPurify and body-parser to patched releases and move frontend and
  MCP validation to Zod 4.6.7 to resolve high-severity production dependency
  advisories without weakening the production audit gate.
