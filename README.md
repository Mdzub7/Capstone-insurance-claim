# Cloud-Native Insurance Claim Filing System

## Setup
- Prerequisites: Python 3.9+, AWS credentials, Node-capable browser.
- Backend:
  - `cd backend`
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`
  - Ensure AWS Secrets Manager has a secret named as `JWT_SECRET_NAME` in `backend/app/core/config.py`.
  - Run: `uvicorn app.main:app --reload --port 8001`
- Frontend:
  - Open `frontend/index.html` in a browser.

## Auth
- Registration: `frontend/register.html` → `POST /api/v1/auth/register`.
- Login: `frontend/login.html` → `POST /api/v1/auth/login`; JWT stored in session/local storage.
- Role-based routing: redirects to patient or admin pages.

## Patient Portal
- Profile: `frontend/patient/profile.html` → `GET /api/v1/users/me`.
- Claims History: `frontend/patient/claims.html` → `GET /api/v1/claims/my`.
- Submit Claim: `frontend/patient/submit.html` → `POST /api/v1/claims/` then S3 PUT via presigned URL.

## Admin
- Dashboard: `frontend/admin/dashboard.html` → users list and pending claims; approve/reject routes under `/api/v1/admin/claims/...`.

## Testing
- `pytest` from `backend` to run unit/integration tests in `backend/tests/`.

## Deployment Checklist
- Enable S3 bucket and notifications in Terraform; reconcile IAM policies.
- Configure Secrets Manager and grant backend IAM to read.
- Verify CORS origins.

## Next Steps
- Add pagination and filtering to claims lists.
- Expand audit logging and observability.
- Prepare Lambda Bedrock integration.
