# Architecture Overview

## 🎯 Architecture Goals

- **Scalability**: Support growth from 100 to 10,000+ users
- **Performance**: Sub-200ms API response times, <2s page loads
- **Reliability**: 99.9% uptime target
- **Security**: Enterprise-grade data protection and privacy
- **Maintainability**: Clean, documented, testable code
- **Developer Experience**: Fast development cycles, easy onboarding

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────────┐            ┌──────────────┐          │
│  │   Browser    │            │  Mobile App  │          │
│  │  (Desktop)   │            │  (Future)    │          │
│  └──────┬───────┘            └──────┬───────┘          │
└─────────┼────────────────────────────┼──────────────────┘
          │                            │
          │         HTTPS/REST         │
          │                            │
┌─────────┴────────────────────────────┴──────────────────┐
│                    CDN / Edge                            │
│              (Vercel Edge Network)                       │
└─────────┬────────────────────────────┬──────────────────┘
          │                            │
┌─────────┴────────────────┐  ┌────────┴──────────────────┐
│   Frontend Application   │  │    Backend API            │
│                          │  │                           │
│  Next.js 15             │  │   Express 5               │
│  React 19               │  │   TypeScript              │
│  TypeScript             │  │   CORS enabled            │
│  Tailwind CSS           │  │                           │
│  Server Components      │  │   Port: 4000              │
│  Port: 3000             │  │                           │
└─────────┬────────────────┘  └────────┬──────────────────┘
          │                            │
          │                            │
          │                            ├─────┐
          │                            │     │
          │                   ┌────────┴─────┴────┐
          │                   │   Database        │
          │                   │   PostgreSQL      │
          │                   │   (Planned)       │
          │                   └───────────────────┘
          │
          │                   ┌───────────────────┐
          └───────────────────│   Static Assets   │
                              │   Images, Fonts   │
                              └───────────────────┘
```

## 📦 Technology Stack

### Frontend

**Core Framework:**
- **Next.js 15.1+**: React framework with App Router
  - Why: Server Components, automatic code splitting, excellent DX
- **React 19.0+**: UI library
  - Why: Modern, component-based, large ecosystem
- **TypeScript 5.7+**: Type-safe JavaScript
  - Why: Catch errors at compile time, better IDE support

**Styling:**
- **Tailwind CSS 3.4+**: Utility-first CSS framework
  - Why: Rapid development, consistent design, small bundle size

**Development Tools:**
- **ESLint 9+**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

**Planned Additions:**
- **TanStack Query**: Data fetching and caching
- **Zustand**: State management
- **Zod**: Runtime type validation
- **React Hook Form**: Form handling

### Backend

**Core Framework:**
- **Node.js 22+**: JavaScript runtime
  - Why: JavaScript everywhere, large ecosystem, excellent performance
- **Express 5.0+**: Web framework
  - Why: Mature, flexible, well-documented
- **TypeScript 5.7+**: Type-safe JavaScript
  - Why: Consistent with frontend, better refactoring

**Middleware:**
- **CORS**: Cross-Origin Resource Sharing
  - Why: Secure frontend-backend communication

**Development Tools:**
- **tsx**: TypeScript execution
  - Why: Fast development without build step
- **TSC**: TypeScript compiler
  - Why: Production builds

**Planned Additions:**
- **PostgreSQL**: Relational database
  - Why: ACID compliance, JSON support, mature
- **Prisma**: ORM and database toolkit
  - Why: Type-safe queries, excellent migrations
- **Zod**: Request validation
  - Why: Type-safe runtime validation
- **JWT**: Authentication tokens
  - Why: Stateless authentication
- **Bcrypt**: Password hashing
  - Why: Secure password storage

### Infrastructure

**Hosting:**
- **Frontend**: Vercel (planned)
  - Why: Optimized for Next.js, edge network, easy deployment
- **Backend**: Railway or Render (planned)
  - Why: Easy deployment, PostgreSQL hosting, reasonable pricing
- **Database**: Vercel Postgres or Railway (planned)
  - Why: Integrated with hosting, automatic backups

**Development:**
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Sentry (planned)

## 🔄 Data Flow

### Client → Server (Typical Request)

```
1. User Action
   ↓
2. React Component Event Handler
   ↓
3. Client-Side Validation
   ↓
4. HTTP Request (fetch/axios)
   ↓
5. Next.js API Route or Direct Backend Call
   ↓
6. Backend Express Route Handler
   ↓
7. Request Validation (Zod)
   ↓
8. Business Logic (Controller)
   ↓
9. Database Query (Prisma ORM)
   ↓
10. PostgreSQL Database
   ↓
11. Response Formatting
   ↓
12. HTTP Response (JSON)
   ↓
13. Client State Update
   ↓
14. React Component Re-render
```

### Example: Creating an Offer

```typescript
// Frontend (Client Component)
"use client";

async function handleCreateOffer(data: OfferFormData) {
  // 1. Client-side validation
  const validated = offerSchema.parse(data);

  // 2. API call
  const response = await fetch('http://localhost:4000/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated)
  });

  // 3. Handle response
  const offer = await response.json();
  // 4. Update UI
  setOffers([...offers, offer]);
}

// Backend (Express)
app.post('/api/offers', async (req, res) => {
  // 5. Validate request
  const validated = offerSchema.parse(req.body);

  // 6. Business logic
  const offer = await createOffer(validated);

  // 7. Return response
  res.status(201).json(offer);
});
```

## 🗂️ Code Organization

### Frontend Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard group
│   │   ├── offers/
│   │   ├── compare/
│   │   └── settings/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── offers/                   # Offer-specific components
│   │   ├── OfferCard.tsx
│   │   └── OfferForm.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       └── Sidebar.tsx
│
├── lib/                          # Utilities and helpers
│   ├── api.ts                    # API client
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas
│
├── hooks/                        # Custom React hooks
│   ├── use-offers.ts
│   └── use-auth.ts
│
├── stores/                       # State management
│   └── auth-store.ts             # Zustand stores
│
└── types/                        # TypeScript types
    ├── offer.types.ts
    └── user.types.ts
```

### Backend Structure

```
backend/
├── src/
│   ├── index.ts                  # Express server entry
│   ├── routes/                   # Route definitions
│   │   ├── offers.routes.ts
│   │   ├── users.routes.ts
│   │   └── auth.routes.ts
│   ├── controllers/              # Business logic
│   │   ├── offers.controller.ts
│   │   ├── users.controller.ts
│   │   └── auth.controller.ts
│   ├── models/                   # Data models (Prisma)
│   │   └── schema.prisma
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/                 # Business services
│   │   ├── offer.service.ts
│   │   └── auth.service.ts
│   ├── utils/                    # Utility functions
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── types/                    # TypeScript types
│       ├── offer.types.ts
│       └── user.types.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── package.json
└── tsconfig.json
```

## 🔐 Security Architecture

### Authentication Strategy

**Planned Implementation:**
- **JWT Tokens**: Stateless authentication
- **HTTP-only Cookies**: Secure token storage
- **Refresh Tokens**: Long-lived sessions
- **Password Hashing**: Bcrypt with salt rounds

### Authorization

- **Role-Based Access Control (RBAC)**: User roles and permissions
- **Resource Ownership**: Users can only access their own data
- **API Route Protection**: Middleware validates auth tokens

### Data Security

- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Input Validation**: Zod schemas on all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: React auto-escaping, CSP headers
- **CSRF Protection**: CSRF tokens (when needed)

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/offerhub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Performance Strategy

### Frontend Optimization

- **Server Components**: Default to Server Components
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Font Optimization**: next/font
- **Static Generation**: Pre-render when possible
- **Edge Rendering**: Vercel Edge Functions (when deployed)

### Backend Optimization

- **Connection Pooling**: Prisma connection pool
- **Query Optimization**: Indexed database queries
- **Caching**: Redis (future feature)
- **Pagination**: Limit query results
- **Compression**: gzip/brotli responses

### Database Optimization

- **Indexes**: Strategic indexing on frequently queried fields
- **Query Optimization**: Use EXPLAIN ANALYZE
- **Connection Pooling**: Reuse database connections
- **Read Replicas**: For scaling (future)

## 📊 Scalability Considerations

### Horizontal Scaling

- **Stateless API**: All backend servers identical
- **Load Balancing**: Distribute traffic (when needed)
- **Session Management**: JWT tokens (no server sessions)

### Vertical Scaling

- **Database**: Upgrade instance size as needed
- **Backend**: Increase server resources
- **Caching**: Add Redis layer

### Database Scaling

- **Read Replicas**: Distribute read load (future)
- **Sharding**: Partition data by user (future)
- **Archiving**: Move old data to cold storage (future)

## 🧪 Testing Architecture

### Planned Testing Strategy

**Frontend:**
- **Unit Tests**: Jest/Vitest for components and utils
- **Integration Tests**: React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Visual Regression**: Chromatic or Percy

**Backend:**
- **Unit Tests**: Jest for business logic
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: In-memory SQLite or test database

**Coverage Target:** 80%+ for critical paths

## 📈 Monitoring & Observability

### Planned Implementation

**Error Tracking:**
- **Sentry**: Frontend and backend error tracking
- **Source maps**: For production debugging

**Performance Monitoring:**
- **Vercel Analytics**: Frontend performance
- **Lighthouse CI**: Regular performance audits
- **Web Vitals**: Core Web Vitals tracking

**Logging:**
- **Backend**: Winston or Pino for structured logging
- **Frontend**: Console for development, Sentry for production

**APM (Application Performance Monitoring):**
- Future consideration based on scale

## 🔄 Deployment Architecture

### Environments

1. **Development**: Local (localhost:3000, localhost:4000)
2. **Staging**: Preview deployments (Vercel preview URLs)
3. **Production**: Live application

### Deployment Strategy

**Frontend (Vercel):**
- **Main Branch**: Auto-deploy to production
- **PR Previews**: Auto-deploy preview URLs
- **Rollback**: Instant rollback via Vercel UI

**Backend (Railway/Render):**
- **Main Branch**: Auto-deploy to production
- **Health Checks**: Endpoint monitoring
- **Rollback**: Previous deployment restoration

### CI/CD Pipeline (Planned)

```yaml
# GitHub Actions workflow
on: [push, pull_request]

jobs:
  test:
    - Install dependencies
    - Run linters
    - Run type checks
    - Run tests
    - Build project

  deploy:
    - Deploy to Vercel (frontend)
    - Deploy to Railway (backend)
    - Run smoke tests
    - Notify team
```

## 🗺️ Architecture Evolution

### Current State (MVP - v0.1.0)

- Monorepo structure
- Basic frontend and backend
- No database yet (using JSON files or in-memory)
- No authentication
- Local development only

### Planned Improvements (v0.2.0)

- [ ] PostgreSQL database integration
- [ ] User authentication (JWT)
- [ ] Deployment to production
- [ ] Basic CI/CD pipeline
- [ ] Error tracking (Sentry)

### Future Enhancements (v1.0+)

- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] Microservices architecture (if needed)
- [ ] GraphQL API (alternative to REST)
- [ ] Event-driven architecture
- [ ] Mobile app (React Native)

## 📚 Related Documentation

- [Folder Structure](./folder-structure.md) - Detailed code organization
- [Data Flow](./data-flow.md) - Detailed data flow diagrams
- [Tech Stack](./tech-stack.md) - Technology justifications
- [Infrastructure](./infrastructure.md) - Deployment and DevOps

---

**Last Updated**: February 2026
**Architecture Version**: 1.0 (MVP)
