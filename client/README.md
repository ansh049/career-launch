# Career Platform Client

The client is the React single-page application for the Career Platform job
portal. Candidates can browse and apply to published jobs, upload a PDF resume,
manage applications, and view job recommendations. Recruiters can publish and
manage job listings and review applicants.

The browser app uses the Express API in `../server`. Authentication is
cookie-based; the API client sends credentials, obtains a CSRF token for
mutating requests, and attempts to refresh an expired session.

## Technology

- React 19 and React DOM
- Vite 8
- React Router 7
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS 4
- Vitest, Testing Library, and jsdom

## Requirements

- Node.js 22 or later and npm
- The server and its MongoDB dependency running for API-backed features

## Local development

From this directory:

```powershell
npm ci
```

Set the Vite API base URL in a local `.env` file:

```dotenv
VITE_API_URL=http://localhost:5000
```

This is optional when the API is available at `http://localhost:5000`, which
is the client default. Then start the development server:

```powershell
npm run dev
```

Vite serves the client at `http://localhost:5173` by default. For local
development the API allows that origin; the API's configured `CLIENT_URL`
supports additional comma-separated client origins.

## Configuration

| Parameter | Default / example | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000` | Base URL for the Express API. Set at Vite build time; do not put secrets in `VITE_*` variables because they are exposed to the browser. |

The API URL should be the origin only (for example,
`http://localhost:5000`); client requests append `/api/...` paths.

## Main screens

| Browser path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/jobs` | Browse published jobs |
| `/jobs/:id` | Job details |
| `/login`, `/register` | Account access |
| `/dashboard` | Candidate dashboard |
| `/recommendations` | Candidate job recommendations |
| `/apply/:id` | Apply to a job |
| `/applications` | Candidate's applications |
| `/recruiter` | Recruiter dashboard |
| `/recruiter/jobs` | Recruiter's job listings |
| `/recruiter/jobs/new` | Create a listing |
| `/recruiter/jobs/:id/edit` | Edit a listing |
| `/recruiter/jobs/:jobId/applicants` | Review applicants |

Candidate and recruiter paths require authentication and the corresponding
account role. Unknown paths redirect to `/`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite's development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |

## Production and Docker

`npm run build` creates a static site in `dist/`. The client Dockerfile builds
that bundle and serves it with Nginx on container port `80`. Its
`VITE_API_URL` build argument must point to the reachable API origin. The root
Docker Compose configuration publishes the client at
`http://localhost:8080`; its value comes from the root `.env` variable
`VITE_API_URL`.

## Project structure

- `src/pages/` — page-level job-seeker and recruiter screens
- `src/components/` — shared navigation, route protection, and error boundary
- `src/features/auth/` and `src/context/` — authentication state and context
- `src/app/store.js` — Redux store
- `src/services/api.js` — Axios client, CSRF handling, and refresh behavior
- `src/*.css` — global and application styling
