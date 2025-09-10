# Freelance Matching Service - OfferHub

The **Freelance Matching Service** is a standalone API designed to provide intelligent matching between freelance projects and freelancers, integrated with an existing freelance application. It leverages two AI models—a low-cost model (Hugging Face Sentence Transformers) for initial filtering and a high-quality model (OpenAI GPT-4 with LangChain) for refined matching—to deliver accurate, scalable, and cost-efficient results. The service uses NestJS, PostgreSQL with `pgvector`, Redis, and GraphQL for a modern, performant architecture.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [License](#license)

## Overview

This service provides a robust API for matching freelance projects with suitable freelancers based on project descriptions, skills, and other criteria. It is designed to integrate seamlessly with a freelance application, receiving project and freelancer data via API payloads and returning ranked matches. The service prioritizes performance, scalability, and cost-efficiency while ensuring security and quality through JWT authentication, rate limiting, and comprehensive monitoring.

| **Attribute**   | **Details**                                                           |
| --------------- | --------------------------------------------------------------------- |
| **Language**    | TypeScript with NestJS                                                |
| **Database**    | PostgreSQL with `pgvector` for vector storage                         |
| **Cache/Queue** | Redis with BullMQ for caching and async job processing                |
| **AI Models**   | Low-cost: Hugging Face `all-MiniLM-L6-v2`; High-quality: OpenAI GPT-4 |
| **API**         | GraphQL (Apollo Server) with REST fallback                            |
| **Monitoring**  | Prometheus and Grafana for metrics and dashboards                     |
| **CI/CD**       | GitHub Actions for linting, testing, and Docker builds                |
| **Deployment**  | Dockerized, Kubernetes-compatible                                     |

## Features

- **Intelligent Matching**: Uses a two-tier AI approach (low-cost filtering, high-quality refinement) for accurate recommendations.
- **GraphQL API**: Flexible querying for customized match results.
- **Async Processing**: BullMQ queues for non-blocking embedding generation.
- **Scalable Search**: `pgvector` with HNSW indexes for fast vector similarity searches.
- **Security**: JWT authentication and Redis-based rate limiting.
- **Monitoring**: Real-time metrics with Prometheus and Grafana dashboards.
- **Cost Optimization**: Caches results in Redis and pre-computes embeddings to reduce AI API costs.

## Architecture

The service follows a modular architecture, integrating AI models, a database, and a caching layer. The diagram below illustrates the high-level flow:

```plantuml
@startuml
actor "Freelance App" as App
participant "API Gateway" as API
participant "Match Controller" as Controller
participant "Match Service" as Service
participant "Low-Cost Model" as LowModel
participant "High-Quality Model" as HighModel
participant "PostgreSQL (pgvector)" as DB
participant "Redis (BullMQ)" as Redis
participant "Prometheus/Grafana" as Monitoring

App -> API: POST /match/get-matches (JWT)
API -> Controller: Validate JWT, Rate Limit
Controller -> Service: Process Match Request
Service -> LowModel: Generate Embedding/Pre-Filter
LowModel -> DB: Query Vector Similarity
DB --> LowModel: Top Candidates
LowModel --> Service: Candidates
alt usePremium = true
    Service -> HighModel: Refine Matches (LangChain)
    HighModel --> Service: Ranked Matches
end
Service --> Controller: Matches
Controller --> API: JSON Response
API --> App: Return Matches
Service -> Redis: Queue Embedding Jobs
Redis -> Service: Process Async Jobs
Service -> Monitoring: Expose Metrics
Monitoring --> App: View Dashboards

@enduml
```

**Key Components**:

- **API Gateway**: Handles incoming requests with JWT auth and rate limiting.
- **Match Controller/Service**: Orchestrates matching logic, integrating AI models.
- **Low-Cost Model**: Hugging Face for embedding generation and pre-filtering.
- **High-Quality Model**: OpenAI GPT-4 with LangChain for refined ranking.
- **PostgreSQL (pgvector)**: Stores temporary embeddings for vector searches.
- **Redis (BullMQ)**: Caches results and processes async jobs.
- **Prometheus/Grafana**: Monitors performance metrics.

## Installation

### Prerequisites

| **Tool**   | **Version** | **Purpose**                  |
| ---------- | ----------- | ---------------------------- |
| Node.js    | 18.x        | Runtime for NestJS           |
| PostgreSQL | 15.x        | Database with `pgvector`     |
| Redis      | 7.x         | Caching and queue management |
| Docker     | Latest      | Containerized services       |
| npm        | 8.x         | Package management           |

### Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd services/freelance-matching
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:

   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/freelance?schema=public
   REDIS_HOST=localhost
   REDIS_PORT=6379
   HF_API_KEY=<huggingface-api-key>
   OPENAI_API_KEY=<openai-api-key>
   JWT_SECRET=<jwt-secret>
   PORT=3000
   ```

4. **Set Up PostgreSQL**:
   - Start PostgreSQL (e.g., via Docker):
     ```bash
     docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass pgvector/pgvector:pg16
     ```
   - Enable `pgvector`:
     ```sql
     psql -U user -d freelance -c "CREATE EXTENSION IF NOT EXISTS vector;"
     ```
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev --name init
     ```

5. **Start Redis**:

   ```bash
   docker run -d -p 6379:6379 redis:7
   ```

6. **Run the Service**:

   ```bash
   npm run start:dev
   ```

7. **Verify Setup**:
   - Access `http://localhost:3000` for REST or `http://localhost:3000/graphql` for GraphQL Playground.

## Usage

### Running Locally

Use Docker Compose for a complete local environment (Postgres, Redis, Grafana):

```bash
docker-compose up
```

### Testing

Run unit and integration tests:

```bash
npm run test
```

Generate coverage report:

```bash
npm run test:cov
```

### API Examples

#### REST: Get Matches

```bash
curl -X POST http://localhost:3000/match/get-matches \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj123",
    "projectDesc": "Build an AI-powered web app",
    "freelancers": [{"userId": "freelancer1", "description": "Expert in Python", "skills": ["Python"]}],
    "usePremium": false
  }'
```

**Response**:

```json
{
  "matches": [
    {
      "userId": "freelancer1",
      "score": 0.95,
      "explanation": "High similarity in Python skills"
    }
  ]
}
```

#### GraphQL: Get Matches

```graphql
query {
  getMatches(projectId: "proj123", usePremium: false) {
    userId
    score
    explanation
  }
}
```

### Queuing Embeddings

```bash
curl -X POST http://localhost:3000/match/queue-embeddings \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{"type": "freelancer", "id": "freelancer1", "description": "Expert in Python"}]
  }'
```

**Response**:

```json
{
  "jobId": "job123"
}
```

## API Endpoints

| **Endpoint**              | **Method** | **Auth** | **Description**                       |
| ------------------------- | ---------- | -------- | ------------------------------------- |
| `/match/get-matches`      | POST       | JWT      | Returns ranked matches for a project  |
| `/match/queue-embeddings` | POST       | JWT      | Queues embedding generation jobs      |
| `/graphql`                | POST       | JWT      | GraphQL endpoint for flexible queries |
| `/metrics`                | GET        | None     | Prometheus metrics for monitoring     |

**GraphQL Queries**:

- `getMatches(projectId: String!, usePremium: Boolean): [Match!]!`
- `queueEmbeddings(data: [EmbeddingInput!]!): JobResponse!`

## Deployment

### Local Deployment

Use Docker Compose:

```bash
docker-compose -f docker-compose.yml up
```

### Production Deployment

1. **Build Docker Image**:

   ```bash
   docker build -t freelance-matching-service .
   ```

2. **Push to Registry**:

   ```bash
   docker push <registry>/freelance-matching-service
   ```

3. **Deploy with Kubernetes**:
   - Apply manifests:
     ```bash
     kubectl apply -f k8s/deployment.yaml
     ```
   - Configure scaling and load balancer as needed.

4. **Serverless Option**:
   - Use Vercel or AWS Lambda with NestJS adapters for serverless deployment.

## Monitoring

- **Prometheus**: Access metrics at `http://localhost:3000/metrics`.
- **Grafana**: View dashboards at `http://localhost:3000` (default Grafana port). Key metrics include:
  - HTTP request latency
  - Match success rate
  - AI model token usage
  - Cache hit rate

To set up Grafana:

1. Add Prometheus as a data source.
2. Import or create dashboards for the above metrics.

## Contributing

1. **Fork the Repository** and create a feature branch (`git checkout -b feature/xyz`).
2. **Follow Coding Standards**:
   - Use ESLint and Prettier.
   - Write unit tests with Jest (80% coverage minimum).
   - Document code with JSDoc/TypeDoc.
3. **Submit a Pull Request**:
   - Include a clear description and reference related issues.
   - Ensure CI workflows pass (lint, build, test).
4. **Code Review**: PRs require at least one approval and passing CI checks.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<h2 align="center">OfferHub with nestjs</h2>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
  <img src="https://github.com/user-attachments/assets/7799a3c4-ccec-42fc-80d0-226309b8169b" alt="O-H" width="200">
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
