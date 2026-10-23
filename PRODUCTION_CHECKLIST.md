# CareerPlatform — Production Deployment Readiness & Checklist

This document details the hardening, security controls, container orchestration, and verification steps required to deploy the CareerPlatform into production.

---

## 1. Security & Hardening Controls

### A. HTTP Security Headers (Helmet)
- **Content Security Policy (CSP)**: Restricts scripts and styles to self and vetted CDNs.
- **Strict-Transport-Security (HSTS)**: `max-age=31536000; includeSubDomains; preload` enforces HTTPS everywhere.
- **X-Content-Type-Options**: `nosniff` prevents MIME type sniffing.
- **X-Frame-Options**: `SAMEORIGIN` prevents clickjacking attacks.
- **CrossOriginResourcePolicy**: `cross-origin` controls resource access.

### B. CORS Allow-List
- Preflight `OPTIONS` and standard requests are restricted to validated origins defined in `CLIENT_URL`.
- Multi-origin support via comma-separated list (`https://careerlaunch.com,https://app.careerlaunch.com`).
- Credentials enabled with restricted headers (`Content-Type`, `X-CSRF-Token`, `X-Request-Id`).

### C. Rate Limiting
- **Global API**: 300 requests per 15-minute sliding window.
- **Authentication**: 30 requests per 15-minute sliding window on `/api/auth` (protects against brute-force).
- **AI Matching**: 60 requests per 15-minute sliding window on `/api/recommendations`.
- Structured JSON response (`429 Too Many Requests`) with `X-Request-Id` attached.

### D. Request ID Tracing
- `requestId` middleware intercepts all requests.
- Accepts incoming `X-Request-Id` (sanitized alphanumeric/dashes) or generates a secure UUID.
- Exposed in headers (`X-Request-Id`) and included in structured error/health responses.

### E. Centralized Error Handling
- Normalizes Mongoose `ValidationError` (400), `CastError` (400), and duplicate key `E11000` (409).
- Normalizes Multer file size/type errors (413/400).
- Hides internal implementation details and stack traces when `NODE_ENV=production`.

### F. CSRF & Cookie Security
- Double-submit CSRF cookie protection with cryptographic HMAC SHA-256 signature verification.
- HTTP-only cookies for authentication JWTs (`SameSite=Lax` or `Strict`, `Secure=true` in production).

---

## 2. Environment Variables & Secret Management

Ensure all values in production are securely generated and populated (never use default development values):

| Variable | Target Service | Requirement |
| :--- | :--- | :--- |
| `NODE_ENV` | `server` | Set to `production` |
| `PORT` | `server` | Default `5000` |
| `CLIENT_URL` | `server` | Production domain(s) of frontend (e.g., `https://careerlaunch.com`) |
| `MONGODB_URI` | `server` | Production MongoDB connection string with credentials |
| `JWT_SECRET` | `server` | Min. 32-character cryptographically random secret (`openssl rand -hex 32`) |
| `ACCESS_TOKEN_SECRET` | `server` | Distinct random secret for access tokens |
| `REFRESH_TOKEN_SECRET`| `server` | Distinct random secret for refresh tokens |
| `CSRF_SECRET` | `server` | Distinct random secret for CSRF token signatures |
| `AI_SERVICE_URL` | `server` | Internal URL to AI service (`http://ai-service:8000`) |
| `AI_INTERNAL_TOKEN` | `server`, `ai-service` | Shared high-entropy secret (`openssl rand -hex 32`) |
| `GROQ_API_KEY` | `ai-service` | Production Groq API key |
| `GROQ_MODEL` | `ai-service` | Preferred model (e.g., `llama-3.3-70b-versatile`) |
| `VITE_API_URL` | `client` | Backend API base URL for the browser client |

---

## 3. Container Orchestration & Docker Readiness

### Service Topology
- **`mongodb`**: MongoDB 8.0 on isolated bridge network `career-network` with persistent volume `mongodb_data`.
- **`ai-service`**: Python 3.11-slim, running as non-root user `appuser` (UID 1000).
- **`server`**: Node.js 22 alpine, running as non-root user `node`.
- **`client`**: Multi-stage build (Vite build -> Nginx alpine) with SPA routing `try_files $uri /index.html;`, gzip, and security headers.

### Health Check Probes

```bash
# Node.js backend liveness
curl -f http://localhost:5000/api/health/live

# Node.js backend readiness (checks MongoDB connection)
curl -f http://localhost:5000/api/health/ready

# AI service health
curl -f http://localhost:8000/health

# Frontend static asset server
curl -f -I http://localhost:8080/
```

---

## 4. CI/CD Pipeline (`.github/workflows/ci.yml`)

The automated GitHub Actions workflow triggers on push and pull requests to `main`:
1. **Backend Job**: Spins up MongoDB 8 container service, installs dependencies with `npm ci`, and runs `npm test` (Supertest suite).
2. **Frontend Job**: Installs dependencies with `npm ci`, executes Vitest unit/component suite (`npm test`), and builds the static production bundle (`npm run build`).
3. **AI Service Job**: Sets up Python 3.11, caches pip dependencies, and runs `pytest` using `ai-service/pytest.ini`.

---

## 5. Deployment Checklist & Verification Steps

- [ ] **1. Secrets Generated**: All random secrets (`JWT_SECRET`, `AI_INTERNAL_TOKEN`, etc.) generated and set in environment or vault.
- [ ] **2. Database Backups**: Automated backup schedule enabled for MongoDB volume / Atlas replica set.
- [ ] **3. SSL/TLS Certificate**: Reverse proxy (e.g. Cloudflare, AWS ALB, Nginx) configured with valid HTTPS certificates and HTTP->HTTPS redirection.
- [ ] **4. Build Verification**: Run `docker compose build` to ensure all containers build cleanly without devDependencies.
- [ ] **5. Smoke Test**:
  - Test registration and login flow.
  - Test candidate profile update and resume PDF parsing.
  - Test job search and semantic job recommendations (`/recommendations`).
  - Verify `X-Request-Id` is returned in response headers.
  - Verify that untrusted origins receive 403 on state-modifying requests.
