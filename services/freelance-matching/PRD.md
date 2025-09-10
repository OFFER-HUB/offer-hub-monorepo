## Product Requirements Document (PRD) for Freelance Matching Service

### 1. Overview

**Product Name**: Freelance Matching Service  
**Version**: 1.0  
**Date**: August 30, 2025  
**Objective**: Build a standalone API service that provides intelligent matching between freelance projects and freelancers, integrating with an existing freelance application. The service uses two AI models (low-cost for pre-filtering, high-quality for refinement) to deliver accurate, scalable, and cost-efficient matches.

### 2. Goals

- **Primary Goal**: Enable the freelance app to match projects with freelancers based on skills, project requirements, and other criteria, improving user satisfaction and conversion rates.
- **Secondary Goals**:
  - Optimize cost by using a low-cost AI model for initial filtering and a high-quality model for premium users.
  - Ensure low-latency responses (<500ms for low-cost, <2s for high-quality).
  - Provide flexible querying via GraphQL for integration with the freelance app.
  - Achieve scalability for 10k+ daily matches with minimal infrastructure cost.

### 3. Stakeholders

- **Freelance App Team**: Provides project/freelancer data via API payloads and consumes match results.
- **End Users**: Clients (project posters) and freelancers using the app, indirectly benefiting from matches.
- **Development Team**: Builds and maintains the service.
- **xAI (if applicable)**: Provides AI model access (e.g., Grok free-tier for low-cost model).

### 4. Functional Requirements

#### 4.1 Core Features

- **Match Generation**:
  - Endpoint: `POST /match/get-matches` (REST) or GraphQL query `getMatches`.
  - Input: `{ projectId, projectDesc, freelancers: [{ userId, description, skills, rating }], usePremium: boolean }`.
  - Output: JSON with top 5-10 matches, including freelancer details, scores, and explanations.
  - Low-cost model (Hugging Face Sentence Transformers) filters top 50 candidates using cosine similarity on embeddings.
  - High-quality model (OpenAI GPT-4 via LangChain) refines matches for premium requests.
- **Async Embedding Generation**:
  - Endpoint: `POST /match/queue-embeddings`.
  - Queues jobs to generate embeddings for new/updated project/freelancer data.
  - Stores embeddings temporarily in PostgreSQL with pgvector.
- **GraphQL Support**:
  - Query: `getMatches(projectId: String!, usePremium: Boolean)` with customizable fields.
  - Mutation: `queueEmbeddings(data: [EmbeddingInput])` for async processing.

#### 4.2 Non-Functional Requirements

- **Performance**:
  - Low-cost matches: <500ms latency.
  - High-quality matches: <2s latency.
  - Vector searches: <100ms for 10k records.
- **Scalability**:
  - Handle 10k daily requests with horizontal scaling (Kubernetes-ready).
  - Redis caching reduces DB hits by 90%.
- **Security**:
  - JWT authentication for all endpoints.
  - Rate limiting: 100 req/min per IP.
  - No storage of sensitive PII; embeddings expire after 7 days.
- **Reliability**:
  - 99.9% uptime.
  - Graceful error handling with fallback to low-cost model if high-quality fails.
- **Monitoring**:
  - Prometheus metrics for request latency, error rates, and match success.
  - Grafana dashboards for real-time visualization.

### 5. Technical Requirements

- **Stack**:
  - **Backend**: NestJS (TypeScript) for modular API.
  - **Database**: PostgreSQL with pgvector for vector storage and searches.
  - **Cache/Queue**: Redis with BullMQ for async jobs and caching.
  - **ORM**: Prisma for type-safe DB access.
  - **AI Models**:
    - Low-cost: Hugging Face `all-MiniLM-L6-v2` (free if self-hosted, ~$0.0001/query via API).
    - High-quality: OpenAI GPT-4 (~$0.03-0.06/1K tokens) with LangChain for prompt chaining.
  - **API**: GraphQL (Apollo Server) with REST fallback.
  - **Monitoring**: Prometheus + Grafana.
  - **CI/CD**: GitHub Actions for linting, testing, and Docker builds.
  - **Deployment**: Dockerized, Kubernetes-compatible for production.
- **Infrastructure**:
  - Local: Docker Compose (Postgres, Redis, Grafana).
  - Prod: AWS EKS, RDS (Postgres), ElastiCache (Redis).
- **Dependencies**:
  - `@nestjs/*`, `prisma`, `pgvector`, `@nestjs/bullmq`, `ioredis`, `@langchain/core`, `@huggingface/inference`, `@nestjs/graphql`, `@nestjs/jwt`, `@nestjs/throttler`, `@nestjs/prometheus`.

### 6. Integration with Freelance App

- **Data Flow**:
  - Freelance app sends project/freelancer data via API (e.g., `{ projectId, description, freelancers }`).
  - Service processes matches and returns results.
  - Optional webhook for async updates (e.g., notify when embeddings are ready).
- **Authentication**:
  - Freelance app provides JWT tokens, validated by our service.
- **Data Handling**:
  - No permanent storage of user data; temporary embeddings in PostgreSQL/Redis with TTL.
  - App responsible for user profiles, project details, and sensitive data.

### 7. Success Metrics

- **User Metrics**:
  - Match acceptance rate: >70% of matches lead to freelancer engagement.
  - API latency: <500ms (low-cost), <2s (high-quality) for 95% of requests.
- **Business Metrics**:
  - Cost per match: <$0.01 (low-cost), <$0.10 (high-quality).
  - Uptime: 99.9% measured via Grafana.
- **Technical Metrics**:
  - Cache hit rate: >90% for repeated queries.
  - Vector search performance: <100ms for 10k records.

### 8. Risks and Mitigations

- **Risk**: High API costs for high-quality model.
  - **Mitigation**: Limit high-quality to premium users; cache results in Redis.
- **Risk**: Slow vector searches at scale.
  - **Mitigation**: Use HNSW indexes in pgvector; benchmark with large datasets.
- **Risk**: Integration issues with freelance app.
  - **Mitigation**: Provide clear API docs and test with mock payloads early.
- **Risk**: Security breaches (e.g., JWT misuse).
  - **Mitigation**: Enforce rate limiting, validate tokens, and audit logs.

### 9. Timeline

- **Milestone 1 (Setup + Initial Code)**
- **Milestone 2 (High-Quality + GraphQL)**
- **Milestone 3 (CI/CD + Monitoring)**
- **Milestone 4 (Optimization + Prod)**

### 10. Future Enhancements

- Fine-tune low-cost model with app-specific data.
- Add support for multilingual embeddings (e.g., mBERT).
- Implement real-time feedback endpoint for match quality.
- Explore serverless deployment (e.g., AWS Lambda).
