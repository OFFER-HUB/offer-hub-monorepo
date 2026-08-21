# Contribution Guide

Thank you for your interest in contributing to **OFFER-HUB**! To maintain code quality and consistency, we follow these standards.

## Local Setup

### Cloning the Repository
```bash
git clone <repo-url>
cd offer-hub-monorepo
```

### Installation
Ensure you have **Node.js 20+** and **npm 10+**.
```bash
npm install
```

### Infrastructure (PostgreSQL & Redis)
This project requires PostgreSQL and Redis. We provide a Docker setup for local development:
```bash
docker compose up -d
```

### Configuration
Copy the example file and fill in the variables:
```bash
cp .env.example .env
```

### Database Setup (Prisma)
Once your database is running, apply the migrations and generate the client:
```bash
# 1. Apply migrations to the DB
npm run prisma:migrate

# 2. Generate Prisma Client
npm run prisma:generate
```

## Development Commands

The project uses **npm Workspaces**. You can run the services from the root:

- **Development Mode**: `npm run dev` (Starts Next.js dev server)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

### Backend (Orchestrator)

For the backend Orchestrator, see the [OFFER-HUB-Orchestrator](https://github.com/OFFER-HUB/OFFER-HUB-Orchestrator) repository:

- **API Server**: `npm run dev:api`
- **Both Services (API + Worker)**: `npm run dev`

## Testing

The frontend suite runs on [Vitest](https://vitest.dev/) with
[Testing Library](https://testing-library.com/) and a `jsdom` environment.

### Running the suite

```bash
npm ci               # a fresh install is enough - no .env or credentials needed
npm run test         # run everything once
npm run test:watch   # re-run affected tests as you edit
npm run test:coverage# run everything and enforce the coverage thresholds
```

You can also target a single file or a name pattern:

```bash
npm run test -- src/services/__tests__/waitlist.test.ts
npm run test -- -t "cookie consent"
```

### Where tests live

Tests sit in a `__tests__/` folder next to the code they cover, named
`<module>.test.ts` (or `.test.tsx` for anything that renders):

```
src/services/waitlist.ts        ->  src/services/__tests__/waitlist.test.ts
src/hooks/useDebounce.ts        ->  src/hooks/__tests__/useDebounce.test.ts
src/app/api/privacy/delete/     ->  src/app/api/privacy/__tests__/delete.route.test.ts
```

### Conventions

- **Never hit a real service.** Supabase is mocked at the `@/lib/supabase`
  module boundary and the GitHub API through `fetch`. A test run must work
  offline, with no credentials, and must not spend the unauthenticated GitHub
  rate limit.
- **Cover the unconfigured path.** Anything touching Supabase has to behave
  sanely when `isSupabaseConfigured === false` and `supabase === null` - that
  is what a contributor running the app locally actually hits.
- **Cover consent gating.** `src/services/analytics.ts` must generate and
  persist nothing while `cookie_consent !== 'accepted'`. If you touch
  analytics, keep those assertions passing rather than adjusting them.
- **Server-side modules** (API routes, anything asserting SSR behaviour) opt
  into the Node environment with a `// @vitest-environment node` docblock on
  the first line.
- **Browser APIs jsdom lacks** (`IntersectionObserver`, `ResizeObserver`,
  `matchMedia`, `document.fonts`) are stubbed once in `vitest.setup.ts`.
  Override them locally when a test needs specific behaviour; do not delete
  the shared stubs.
- Prefer asserting **behaviour a user or caller can observe** (rendered text,
  roles, returned values, the payload sent to Supabase) over internal state.

### Coverage

`vitest.config.ts` enforces two tiers of thresholds and CI fails when either
is not met:

| Scope | Bar |
|---|---|
| `src/services/**`, `src/hooks/**`, `src/lib/{supabase,seo,mdx}.ts` | 95% statements |
| `src/app/api/**` | 100% |
| Everything else (global floor) | 40% statements |

The global floor is deliberately set at roughly where the suite is today, not
at an aspirational number. Raise it as component coverage lands rather than
leaving a bar nobody can clear.

### What is expected of a PR

- `npm run lint` passes with no errors.
- `npm run test:coverage` passes, thresholds included.
- New or changed behaviour comes with tests. For a bug fix, that means a test
  that fails without your fix.
- Tests deleted or skipped (`.skip`, `.todo`) are explained in the PR
  description.

## Git Standards

### Branch Naming
We use prefixes to identify the type of change:

- `feat/feature-name`: New features.
- `fix/error-description`: Bug fixes.
- `bug/ticket-reference`: Critical reported bugs.
- `refactor/affected-area`: Changes that don't affect functionality.
- `docs/doc-name`: Documentation improvements.

### Atomic Commits
Commit messages should be clear and in English. We recommend following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user balance check resource
fix: handle provider timeout in topup flow
docs: update api-overview with new response format
```

## Code Standards

Before submitting a change, ensure you:
1. Follow the **Naming Conventions** defined in [`docs/standards/naming-conventions.md`](./standards/naming-conventions.md).
2. Use the correct **ID Prefixes** (`usr_`, `ord_`, etc.) for backend code.
3. Verify that **Amounts** follow the string format with 2 decimal places (`"100.00"`).
4. Do not break the **State Machine** of the resources.
5. Follow the **Design System** rules in [`docs/design/visual-dna.md`](./design/visual-dna.md) for frontend code.

## Manual QA Reports

For manual test reports (screenshots + step-by-step verification of an issue),
use a local `reports/issue-[number]/` folder at the repo root — it's covered
by `.gitignore` and is not tracked in git. Name reports
`Report_[FeatureName]_Issue_[Number].md` and use this template:

```markdown
# Manual Test Report: [Feature Name]

## Issue Information
- **Issue Number**: #[Number]
- **Title**: [Issue Title]
- **Date**: [YYYY-MM-DD]
- **Tester**: [Your Name/Username]

## Test Environment
- **URL**: https://www.offer-hub.org
- **Browser**: [Browser Name and Version]
- **Device**: [Desktop/Mobile/Tablet]

## Test Steps

### Step 1: [Step Description]
- **Action**: [What was done]
- **Expected Result**: [What should happen]
- **Actual Result**: [What actually happened]
- **Status**: ✅ Pass / ❌ Fail
- **Screenshot**: [filename]

## Test Results Summary
- **Total Steps**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Overall Status**: ✅ Pass / ❌ Fail

## Issues Found
- [Description of any issues found during testing]

## Recommendations
- [Any recommendations for improvements]
```

Attach the report content and screenshots directly to your PR description rather than committing them — this keeps the QA evidence next to the change it verifies without growing the repo.

## Pull Request Process

1. Create a branch from `main`.
2. Make your changes and use atomic commits.
3. Ensure the project builds correctly (`npm run build`), that `npm run lint`
   reports no errors, and that `npm run test:coverage` passes - CI runs all
   three and will fail the PR otherwise. See [Testing](#testing) for what is
   expected of the tests themselves.
4. **If your PR introduces a user-facing change** (new feature, bug fix, deprecation, breaking change, or security patch), add an entry to the `[Unreleased]` section of [`CHANGELOG.md`](../CHANGELOG.md) at the repository root. Follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and place the change under the appropriate category: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`.
5. Open a PR using our Pull Request template.
6. Wait for a maintainer's review.

## Roadmap & Tasks

This project follows a strict execution plan. Before picking up a task, check the:
- [**ROADMAP.md**](../ROADMAP.md): Our master development checklist.

---

Questions? Consult the [AI Context Guide](./ai-context.md) or open an issue.
