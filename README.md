# Cloud-Native Insurance Claim Filing System

## Overview
Modern claims portal with patient and admin experiences. Frontend is static (HTML/CSS/JS) and themed to match Cigna styling; backend is FastAPI with AWS integrations (DynamoDB, S3, Secrets Manager).

## Quick Start
- Frontend:
  - `cd frontend`
  - `python3 -m http.server 8080`
  - Open `http://localhost:8080/index.html`
- Backend:
  - `cd backend`
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - Configure AWS credentials and set Secrets Manager JWT secret per `backend/app/core/config.py`.
  - Run: `uvicorn app.main:app --reload --port 8001`

## Documentation
- Frontend: [README.frontend.md](./README.frontend.md) — layouts, pages, auth guards, charts.
- Backend: [README.backend.md](./README.backend.md) — endpoints, data model, AWS setup.

## Pages and Flows
- Home + Member Guide (demo access).
- Patient portal: Profile, Dashboard (KPIs/charts), Claims History (filters + timeline), Submit Claim (INR, dropzone), Claim Lifecycle.
- Admin portal: Profile, Dashboard (pending KPIs/charts with polling), Claims (pending table + approve/reject + patient search), Analytics (year/user filters, monthly amounts, status donut, top users).

## Endpoints Used
- Auth: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/users/me`
- Claims: `/api/v1/claims/` (POST), `/api/v1/claims/my` (GET), `/api/v1/claims/{id}/document/confirm` (POST)
- Admin: `/api/v1/admin/users`, `/api/v1/admin/claims/pending`, `/api/v1/admin/claims` (status filter), approve/reject under `/api/v1/admin/claims/{id}/...`

## Testing
- Backend tests in `backend/tests/` — run `pytest` or `python run_tests.py`.
- Optional UI checks with Playwright from `frontend`: `npx playwright test`.

## Deployment Checklist
- Ensure S3 bucket exists and write permissions granted.
- DynamoDB table created with a primary key `claim_id`.
- Secrets Manager configured with JWT secret and API has access.
- CORS origin configured for deployed frontend.
- Containerize: NGINX for frontend, uvicorn for backend; set `BACKEND_BASE` in frontend container.
- Monitoring: ship stdout logs to your log aggregator; review client logs in DynamoDB.

## Notes
- Optional AWS services like Lambda/Bedrock can be integrated later.
- Admin analytics uses `/api/v1/admin/claims` for full status coverage and polls for updates.

## Architecture
- Frontend (`frontend/`): static HTML/CSS/JS, Chart.js for analytics, NGINX Dockerfile provided.
- Backend (`backend/`): FastAPI, uvicorn; routers under `app/routers/*`, services under `app/services/*`.
- Data: DynamoDB single-table, items keyed by `claim_id` including `USER#{user_id}` entries.
- Storage: S3 bucket at `settings.S3_BUCKET` for claim documents.
- Security: JWT with secret loaded from AWS Secrets Manager; CORS open in dev.

## Configuration
- `backend/app/core/config.py` holds:
  - `AWS_REGION`, `DYNAMODB_TABLE`, `S3_BUCKET`, `JWT_SECRET_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- AWS credentials must permit DynamoDB and S3 in `AWS_REGION`.

## Claim Document Flow
- User submits claim via `POST /api/v1/claims/` and receives `s3_upload_url`.
- Frontend uploads the PDF directly to S3 using the presigned URL.
- Frontend confirms upload via `POST /api/v1/claims/{claim_id}/document/confirm`.
- Backend stores `document_key` and exposes short-lived `document_url` on claim listings.
- Admin views documents via `document_url` in Pending Claims and Search.

## Logging
- Server logs: Structured INFO logs to stdout via `app.core.logging.setup_logging()`.
- Client logs: Frontend posts events to `/api/v1/logs`; stored in DynamoDB items `LOG#<uuid>` with `level`, `event`, `context`, `user_id`.
- Key events logged: claim submissions, approvals/rejections, analytics refreshes, patient submit attempts.
