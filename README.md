# CareerLaunch: AI-Powered Career & Recruitment Ecosystem

🌐 **Live Application:** [CareerLaunch — Next-Gen Job & Internship Portal](https://career-client-vqpy.onrender.com/)

An enterprise-grade, full-stack recruitment platform powered by **Node.js (Express 5)**, **FastAPI**, **Sentence Transformers**, **Groq LLM orchestration**, and **React 19 (Vite + Tailwind CSS)**. CareerLaunch transforms conventional job boards into an intelligent ecosystem featuring semantic candidate-job matching, automated resume parsing, AI mock interviews, recruiter anti-fraud risk scoring, and interactive career knowledge graphs.

---

## 1. System Architecture & Topology

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                        |
|  React 19 | Redux Toolkit | Tailwind CSS v4 | Vite 8 (Dev: :5173 / Docker Prod: :8080)|
+-------------------------------------------+-------------------------------------------+
                                            |  HTTP / JSON / Cookies / Bearer
                                            v
+---------------------------------------------------------------------------------------+
|                                 APPLICATION BACKEND                                   |
|  Node.js 22 | Express 5 | Mongoose | Helmet | Rate-Limit (:5000)                      |
|                                                                                       |
|  - Role-Based Access Control (Candidate, Recruiter, Admin)                            |
|  - Cryptographic Double-Submit CSRF Verification (HMAC SHA-256)                       |
|  - Application Lifecycle Timeline Audit & Reminders                                   |
|  - Anti-Fraud Job Risk Analysis & Moderation Pipelines                                |
+---------------------+-------------------------------------+---------------------------+
                      |                                     |  Internal Service Token
                      v                                     v  (Shared Secret Auth)
+---------------------------------+  +--------------------------------------------------+
|          DATABASE TIER          |  |                    AI SERVICE                    |
|  MongoDB 8 / MongoDB Atlas      |  |  Python 3.11 | FastAPI | PyMuPDF (:8000)          |
|  Persistent Volumes (:27017)    |  |                                                  |
|                                 |  |  - SentenceTransformer (all-MiniLM-L6-v2)        |
|  - Relational & Graph Schemas   |  |  - 384-Dimensional Dense Vector Embeddings       |
|  - Indexed Search Catalogs      |  |  - Groq LLM (llama-3.3-70b-versatile)            |
|  - Compound Unique Constraints  |  |  - Deterministic Skill & Experience Fit Scoring  |
+---------------------------------+  +--------------------------------------------------+
```

---

## 2. Parametric Numerics & Engineering Metrics

The platform operates on strict, verified mathematical models, deterministic weights, and performance parameters:

### A. Machine Learning & Semantic Matching Parameters

| Metric / Parameter | Value | Description / Implementation |
| :--- | :--- | :--- |
| **Embedding Architecture** | `sentence-transformers/all-MiniLM-L6-v2` | Dense vector representation model |
| **Embedding Vector Dimensions** | `384` float32 dimensions | Output tensor size per resume/job text |
| **Model Parameters** | `22.7 Million` parameters | Lightweight, high-throughput CPU/GPU inference |
| **Scoring Algorithm Version** | `v2.0` | Deterministic weighted multi-factor scoring |
| **Semantic Similarity Weight** | `0.50` (50%) | Cosine similarity between resume and job vectors |
| **Skill Coverage Weight** | `0.35` (35%) | Direct set-overlap ratio between candidate and required skills |
| **Experience Fit Weight** | `0.15` (15%) | Deterministic regex-extracted seniority alignment |
| **Composite Score Range** | `0.0 – 100.0%` | Weighted normalized aggregate score |
| **Primary LLM Model** | `llama-3.3-70b-versatile` | Groq cloud inference engine |
| **Interview Max Turns** | `5` questions | Number of adaptive interview evaluation rounds |
| **Confidence Metric Range** | `0.00 – 1.00` | Normalized score for co-occurrence & risk assessment |

### B. Security, Rate Limiting & Session Parameters

| Parameter | Quantitative Value | Enforcement Target |
| :--- | :--- | :--- |
| **Global API Rate Limit** | `300 requests / 15 minutes` | Global `/api/*` routes |
| **Authentication Rate Limit** | `30 requests / 15 minutes` | `/api/auth/*` brute-force barrier |
| **AI Matching Rate Limit** | `60 requests / 15 minutes` | `/api/recommendations/*` |
| **AI Internal Rate Limit** | `30 requests / 60 seconds` | FastAPI internal microservice guard |
| **Access Token Lifetime (TTL)** | `15 minutes` (`15m`) | Short-lived signed JWT in HTTP-only cookie |
| **Refresh Token Lifetime (TTL)** | `7 days` (`7d`) | Long-lived rotation token in HTTP-only cookie |
| **Minimum Secret Entropy** | `32 bytes` (64 hex chars) | Cryptographically secure random seeds |
| **CSRF Signature Algorithm** | `HMAC-SHA256` | Double-submit cryptographic verification |
| **Max Resume File Size** | `5 MB` (`5,242,880 bytes`) | Enforced by Multer and FastAPI upload handlers |
| **Allowed Upload MIME Types** | `application/pdf` | Magic byte and MIME verification |

### C. Network Ports & Connection Topology

| Component | Default Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Dev Server** | `5173` | HTTP | Vite React development server |
| **Frontend Production Container** | `8080` | HTTP | Nginx Alpine multi-stage production container |
| **Backend Express API** | `5000` | HTTP | Node.js core REST API |
| **FastAPI AI Service** | `8000` | HTTP | Python internal intelligence microservice |
| **MongoDB Database** | `27017` | TCP / Mongo Wire | Local container or MongoDB Atlas replica set |
| **ClamAV Daemon** | `3310` | TCP / ClamD | Antivirus scanning service (production) |

### D. Knowledge Graph & Database Metrics

| Catalog / Feature | Value | Detail |
| :--- | :--- | :--- |
| **Seeded Canonical Skills** | `86 skills` | Curated across 7 standard technology taxonomies |
| **Pre-computed Graph Edges** | `600+ edges` | High-confidence pairwise relationships |
| **Taxonomy Categories** | `7 domains` | Languages, Frameworks, Databases, DevOps, AI, Tools, Design |
| **Risk Assessment Levels** | `4 tiers` | `low`, `medium`, `high`, `critical` |
| **Automated Test Suite** | **`89 tests (100% passing)`** | 50 Server tests, 23 AI Pytests, 16 Client Vitests |

---

## 3. Core Feature Modules

### 1. Semantic Job Matching & Recommendations
- Converts resumes and job descriptions into **384-dimensional dense vectors**.
- Computes cosine similarity alongside direct skill intersection sets.
- Delivers reproducible composite fit ratings with automated gap analysis.

### 2. Candidate Dashboard & Interactive Application Tracker
- Comprehensive Kanban and list tracker for job submissions.
- **Application Event Audit Timeline**: Real-time event log tracking status shifts (`submitted`, `reviewing`, `shortlisted`, `rejected`, `hired`).
- Integrated reminder scheduling with automated notifications.

### 3. Career Knowledge Graph & Learning Paths
- Visualizes technological ecosystems and prerequisite pathways.
- Dynamic co-occurrence harvesting from live published job listings.
- Role-based learning path generation (*Frontend, Backend, AI Engineer, Full Stack, DevOps*).

### 4. Recruiter Intelligence & Anti-Fraud Protection
- Algorithmic fraud screening analyzing job descriptions for phishing markers, upfront fees, unrealistic salary ranges, and suspicious URLs.
- Generates 0.0–1.0 risk scores with actionable indicator breakdowns.
- Candidate shortlist ranking and automated interview kit generation.

### 5. Interactive AI Mock Interview
- Context-aware technical and behavioral interviews customized to target roles and experience tiers.
- Real-time scoring and comprehensive feedback reports covering technical clarity, depth, and communication skills.

---

## 4. API Surface Reference

All backend endpoints are prefixed with `/api`. Protected routes require active JWT cookies and matching roles.

### Authentication & User Profiles
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/csrf` | Public | Issue signed CSRF double-submit token |
| `POST` | `/api/auth/register` | Public | Register candidate or recruiter account |
| `POST` | `/api/auth/login` | Public | Authenticate and issue HTTP-only JWT cookies |
| `POST` | `/api/auth/refresh` | Public | Rotate access token using valid refresh token |
| `POST` | `/api/auth/logout` | Public | Invalidate authenticated cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role |
| `GET` | `/api/profile/me` | Candidate | Retrieve full candidate profile with skills |
| `PUT` | `/api/profile/me` | Candidate | Update candidate profile attributes |
| `POST` | `/api/profile/parse-resume` | Candidate | Multipart PDF upload, parsing, and skill extraction |

### Job Management & Applications
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | List and search published job postings |
| `GET` | `/api/jobs/:id` | Public | Retrieve detailed job listing |
| `POST` | `/api/jobs` | Recruiter | Create a new job listing (triggers auto risk assessment) |
| `GET` | `/api/jobs/mine` | Recruiter | List all jobs owned by authenticated recruiter |
| `POST` | `/api/jobs/:id/apply` | Candidate | Submit job application with PDF resume |
| `GET` | `/api/applications/mine` | Candidate | List applications submitted by current user |
| `GET` | `/api/applications/:id/timeline` | Candidate / Recruiter | Retrieve chronological event timeline |
| `POST` | `/api/applications/:id/reminders` | Candidate | Schedule milestone follow-up reminder |
| `PATCH`| `/api/applications/:id/status` | Recruiter | Update application status (`reviewing`, `shortlisted`, etc.) |

### AI Recommendations & Career Intelligence
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recommendations/me` | Candidate | Generate ranked semantic job recommendations |
| `POST` | `/api/recommendations/explain` | Candidate | Retrieve semantic breakdown for a specific job match |
| `POST` | `/api/recommendations/feedback`| Candidate | Submit explicit recommendation feedback (upvote/dismiss) |
| `GET` | `/api/career/graph` | Public | Full skill graph (nodes, categories, edges, confidence) |
| `GET` | `/api/career/skills/:id/related` | Public | Connected technology relationships for selected skill |
| `GET` | `/api/career/roles/:role/skill-path` | Public | Learning curriculum derived from job postings |
| `POST` | `/api/career/gap-analysis` | Candidate | Compare profile skills against target role requirements |

### Health & Monitoring
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Centralized health check probe |
| `GET` | `/api/health/live` | Public | Liveness probe (Kubernetes / Docker) |
| `GET` | `/api/health/ready` | Public | Readiness probe verifying MongoDB connectivity |

---

## 5. Local Development Setup

### Prerequisites
- **Node.js**: `v22.0.0` or higher
- **Python**: `3.11` or higher
- **MongoDB**: Local community server (`localhost:27017`) or free MongoDB Atlas cluster

---

### Step 1: Clone Repository & Configure Environment Files

```bash
git clone https://github.com/your-username/career-platform.git
cd career-platform
```

#### Configure Server (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/career-platform
JWT_SECRET=4265f38508308ad5f3156a51d9eab42448d04f0826a41d675dd93d3243cc47e9
ACCESS_TOKEN_SECRET=aba66a8adbbd6c520dbf27e0160de86b5db5ad56a15b8773b8b29bcb5642701e
REFRESH_TOKEN_SECRET=68f242f01de6ad2867af30e3bb5bd19868b9280302f616dfb5a834beb19d400f
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
AI_SERVICE_URL=http://127.0.0.1:8000
AI_INTERNAL_TOKEN=8f1c9d02938b7d74cf8604b7c8b2ac1ef9e0892425010e5ae0b5d614efebf44f
RESUME_STORAGE=local
```

#### Configure AI Service (`ai-service/.env`):
```env
AI_INTERNAL_TOKEN=8f1c9d02938b7d74cf8604b7c8b2ac1ef9e0892425010e5ae0b5d614efebf44f
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
AI_RATE_LIMIT_REQUESTS=30
AI_RATE_LIMIT_WINDOW_SECONDS=60
```

#### Configure Client (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

---

### Step 2: Start the AI Service (Python FastAPI)

```powershell
# In a new terminal:
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Health verification:* Visit `http://localhost:8000/health` (returns `{"status":"ok"}`).

---

### Step 3: Start the Backend API (Node.js Express)

```powershell
# In a second terminal:
cd server
npm install
npm run dev
```
*Health verification:* Visit `http://localhost:5000/api/health` (returns status `UP`).

---

### Step 4: Start the Frontend Application (React Vite)

```powershell
# In a third terminal:
cd client
npm install
npm run dev
```
*Web client running at:* `http://localhost:5173`

---

## 6. Docker Container Orchestration

Run the complete multi-service stack with persistent volume storage and automated health check barriers:

```bash
docker compose up --build -d
```

### Container Status Verification
```bash
docker compose ps
```

| Service | Container Image | Host Port | Internal Port | Healthcheck |
| :--- | :--- | :--- | :--- | :--- |
| **`client`** | `career-client` (Nginx Alpine) | `8080` | `80` | `wget -qO- http://localhost:80/` |
| **`server`** | `career-server` (Node.js 22 Alpine) | `5000` | `5000` | `wget -qO- http://localhost:5000/api/health/live` |
| **`ai-service`** | `career-ai-service` (Python 3.11 Slim) | *internal* | `8000` | `urllib.request.urlopen(:8000/health)` |
| **`mongodb`** | `mongo:8` | *internal* | `27017` | `mongosh --eval "db.adminCommand('ping').ok"` |

---

## 7. Automated Testing Suite

The repository maintains an automated end-to-end test matrix covering unit, integration, authentication, and machine learning components:

```bash
# 1. Backend Integration & Security Tests (Supertest)
cd server
npm test
# Result: 50 tests passing (auth, CSRF, timelines, moderation, risk scoring)

# 2. AI Service Inference & Parser Tests (Pytest)
cd ai-service
pytest
# Result: 23 tests passing (embeddings, skill extraction, similarity, copilot)

# 3. Frontend Component & Integration Tests (Vitest)
cd client
npm test
# Result: 16 tests passing (routing, auth guards, dashboard, applications)
```

---

## 8. Production Hardening & Security Controls

1. **Helmet HTTP Headers**: Enforces strict Content Security Policy (CSP), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and HSTS with a 1-year preload header (`max-age=31536000`).
2. **Double-Submit CSRF Guard**: Cryptographically validates CSRF tokens against cookie hashes on all non-idempotent (`POST`, `PUT`, `PATCH`, `DELETE`) requests.
3. **CORS Isolation**: Restricts API calls to vetted origin domains specified in `CLIENT_URL`.
4. **Least-Privilege Containers**: Both server and AI microservices execute as non-privileged system users (`node` UID 1000 and `appuser` UID 1000).
5. **Request Tracing**: Injects a unified `X-Request-Id` across all request lifecycles and error responses for end-to-end observability.

---

## 9. License

This project is licensed under the **ISC License**. Developed for modern engineering and talent recruitment workflows.
