# Career Platform API

The server is the Node.js/Express API for the Career Platform job portal. It
provides account authentication, role-protected job and application
workflows, resume handling, and endpoints that proxy resume analysis and job
matching to the separate `../ai-service`.

## Technology and requirements

- Node.js 22 or later and npm
- MongoDB (local or remote)
- The AI service for resume analysis and recommendations
- AWS-compatible object storage for resume files in production
- ClamAV configured for resume scanning in production

The server uses Express 5, Mongoose, cookie-based JWT authentication, Zod
validation, Multer for multipart uploads, Helmet, CORS, and express-rate-limit.

## Local setup

From this directory, install dependencies and create your local environment
file:

```powershell
npm ci
Copy-Item .env.example .env
```

Edit `.env` before starting the API:

1. Set `MONGODB_URI` to a running MongoDB database.
2. Replace all sample secret values with distinct, randomly generated secrets.
3. Set `AI_SERVICE_URL` and `AI_INTERNAL_TOKEN` to match the AI service.
4. For local resume storage, set `RESUME_STORAGE=local` (or leave it unset).
   The sample `.env.example` selects S3 storage.
5. If resume scanning is enabled locally, provide a reachable ClamAV server
   using `CLAMAV_HOST` and `CLAMAV_PORT`.

Start the API:

```powershell
npm run dev
```

The default address is `http://localhost:5000`. The API root returns service
metadata, and `GET /api/health` returns a health response.

## Configuration parameters

Values below reflect `.env.example` or the code defaults. Replace all example
secrets and environment-specific values; never commit a real `.env` file.

| Parameter | Example / default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime mode; production enables secure cookies, requires the malware scanner, and uses object storage for resumes. |
| `PORT` | `5000` | HTTP listen port. |
| `CLIENT_URL` | `http://localhost:5173` | Comma-separated allowed frontend origins. `http://localhost:5173` and `http://localhost:8080` are allowed locally by default. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/career-platform` | MongoDB connection string. |
| `TEST_MONGODB_URI` | `mongodb://127.0.0.1:27017/career-platform-test` | Separate database used by integration tests. |
| `JWT_SECRET` | Replace sample | Secret fallback for CSRF signing; use a long random value. |
| `ACCESS_TOKEN_SECRET` | Replace sample | Secret for signing access tokens; use a distinct random value. |
| `REFRESH_TOKEN_SECRET` | Replace sample | Secret for signing refresh tokens; use a distinct random value. |
| `CSRF_SECRET` | Replace sample | CSRF signing secret; if unset, the server falls back to `JWT_SECRET`. |
| `ACCESS_TOKEN_TTL` | `15m` | Access-token lifetime. |
| `REFRESH_TOKEN_TTL` | `7d` | Refresh-token lifetime. |
| `JWT_EXPIRES_IN` | `1d` in sample | Present in the sample environment; the current token utility uses `ACCESS_TOKEN_TTL` and `REFRESH_TOKEN_TTL`. |
| `AI_SERVICE_URL` | `http://127.0.0.1:8000` | Base URL of the AI service. |
| `AI_INTERNAL_TOKEN` | Replace sample | Shared secret sent to the AI service for internal endpoints. |
| `RECRUITER_VERIFICATION_TOKEN` | Replace sample | Secret supplied in `X-Recruiter-Verification-Token` to verify recruiter accounts. |
| `RESUME_STORAGE` | `s3` in sample; `local` for local development | Select local filesystem storage or S3-compatible object storage. Production always uses object storage. |
| `RESUME_STORAGE_DIR` | `private-resumes` | Optional local resume storage directory; ignored by Git. |
| `RESUME_S3_BUCKET` | `private-career-platform-resumes` | Required bucket when object storage is used. |
| `AWS_REGION` | `us-east-1` | S3 region; defaults to `us-east-1` in code. |
| `RESUME_S3_ENDPOINT` | Unset | Optional S3-compatible endpoint. |
| `CLAMAV_HOST` | `127.0.0.1` | ClamAV host. Required in production. |
| `CLAMAV_PORT` | `3310` | ClamAV port; defaults to `3310`. |

The S3 client uses the AWS SDK's standard credential chain. Supply credentials
through the deployment's secure identity/secret mechanism, not source files.
Configure the AI service's own variables (including `AI_INTERNAL_TOKEN`) in
that service's environment; the token must match on both services.

## API surface

All API paths are under `/api`. Authentication and role authorization are
required where noted.

| Method and path | Purpose |
| --- | --- |
| `GET /api/health` | Health check |
| `GET /api/auth/csrf` | Issue a CSRF token |
| `POST /api/auth/register` | Register an account |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/refresh` | Refresh an authenticated session |
| `POST /api/auth/logout` | Sign out |
| `GET /api/auth/me` | Get the current user (authenticated) |
| `GET /api/jobs` | List published jobs |
| `GET /api/jobs/:id` | Get job details |
| `POST /api/jobs` | Create a job (recruiter) |
| `GET /api/jobs/mine` | List the recruiter's jobs (recruiter) |
| `PATCH /api/jobs/:id` | Update a job (recruiter) |
| `PATCH /api/jobs/:id/status` | Change job status (recruiter) |
| `DELETE /api/jobs/:id` | Delete a job (recruiter) |
| `GET /api/jobs/:jobId/applications` | List applicants for a recruiter's job |
| `POST /api/jobs/:jobId/applications` | Apply to a job with a PDF resume (candidate) |
| `GET /api/applications/mine` | List the candidate's applications |
| `GET /api/applications/:id` | Get an application (authenticated) |
| `GET /api/applications/:id/resume` | Download an application resume (authorized candidate or job owner) |
| `PATCH /api/applications/:id/status` | Update an application status (recruiter) |
| `DELETE /api/applications/:id` | Withdraw an application (candidate) |
| `GET /api/recommendations/me` | Get candidate job recommendations |
| `GET /api/candidate/dashboard` | Candidate dashboard data |
| `GET /api/recruiter/dashboard` | Recruiter dashboard data |
| `POST /api/admin/recruiters/:userId/verify` | Verify a recruiter with the admin token |

Mutating requests use the CSRF token returned by the auth CSRF endpoint. The
API enables credentialed CORS and checks request origins for trusted
mutations.

## Data and validation parameters

- Account roles: `candidate`, `recruiter`.
- Job work modes: `onsite`, `remote`, `hybrid`.
- Employment types: `full-time`, `part-time`, `internship`, `contract`.
- Experience levels: `internship`, `entry`, `junior`, `mid`, `senior`.
- Job status: `draft`, `published`, `closed`.
- Application status values are defined in the application model and validated
  by the application update route.
- Job titles and company names are limited to 120 characters; job descriptions
  to 20,000 characters; locations to 150 characters.
- A job must have 1–30 skills, with each skill at most 50 characters.
  Responsibilities and requirements allow up to 30 entries of 500 characters
  each.
- Salary values are nonnegative; currency defaults to `INR`; salary period is
  `year`, `month`, or `hour`.
- A resume must be a valid PDF no larger than 5 MiB. Application cover letters
  are limited to 5,000 characters.
- JSON request bodies are limited to 1 MiB.
- General API rate limit: 300 requests per 15 minutes; authentication:
  20 requests per 15 minutes; recommendations: 30 requests per 15 minutes.

## Commands and tests

| Command | Description |
| --- | --- |
| `npm run dev` | Start with Nodemon |
| `npm start` | Start the API |
| `npm test` | Run Node's built-in test runner |

Integration tests that use MongoDB require `TEST_MONGODB_URI` to point to a
separate test database. Do not point tests at a database containing data you
need to preserve.

## Docker Compose

From the repository root, Docker Compose starts MongoDB, the API, AI service,
and client. The root `.env` supplies `CLIENT_URL`, `JWT_SECRET`,
`AI_INTERNAL_TOKEN`, `GROQ_API_KEY`, `GROQ_MODEL`, and `VITE_API_URL`.
Compose configures the API with `PORT=5000`, `NODE_ENV=production`,
`JWT_EXPIRES_IN=1d`, MongoDB at
`mongodb://mongodb:27017/career_platform`, and the AI service at
`http://ai-service:8000`. The API is published on host port `5000`; MongoDB
data is persisted in the `mongodb_data` volume. Production deployments must
also configure the token secrets, private object-storage bucket/credentials,
and ClamAV service required by the API.

## Project structure

- `src/app.js` — Express middleware, rate limits, and route mounting
- `src/server.js` — database connection and HTTP startup
- `src/routes/` — API route definitions
- `src/controllers/` — authentication, job, and application logic
- `src/models/` — Mongoose user, job, and application schemas
- `src/middleware/` — authentication, authorization, CSRF, and uploads
- `src/services/` — AI integration, resume scanning, and resume storage
- `src/tests/` — automated tests

Resume files and environment files are private runtime data; the server
`.gitignore` excludes local secrets, uploaded resumes, and generated
artifacts.
