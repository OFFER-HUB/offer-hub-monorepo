# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Security

- Rate limit all public API routes and the raw-docs alias using shared Redis
  counters, with stricter form and privacy limits and `429`/`Retry-After`
  responses. Redis credentials and trusted ingress configuration are required
  in production; development and test skip the limiter without contacting Redis.
- Reject filled honeypots on waitlist and contact submissions before persistence.
