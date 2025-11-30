# Frontend

## Overview
Static HTML/CSS/JS app served via any static server. Uses Poppins/Inter fonts, Cigna-themed palette, and responsive layouts. Patient and Admin portals share a sidebar shell with collapse toggle.

## Structure
- `frontend/index.html`: Home page with hero, tray, value blocks, notice.
- `frontend/member-guide.html`: Demo access and portal guide.
- `frontend/css/style.css`: Global styles, patient/admin shell, components.
- `frontend/js/auth.js`: Auth helpers, login/register calls.
- Patient pages: `frontend/patient/*`
- Admin pages: `frontend/admin/*`
- Assets: `frontend/assets/*` (logos, icons)

## Auth Flow
- Login via email or patient ID and password using `POST /api/v1/auth/login`.
- Token is stored in session/local storage. Guards block unauthenticated navigation and redirect to `login.html?next=...`.

## Patient Pages
- Sidebar: Profile, Dashboard, Submit, History, Lifecycle, Home.
- Dashboard: KPIs, monthly claims + amount chart, status donut, recent claims.
- Claims History: Filter by status/year + text search; timeline chart.
- Submit Claim: Card form, INR currency, dropzone preview (S3 uploads currently disabled).
- Lifecycle: Stepper showing Submitted → In Review → Decision with color codes.

## Admin Pages
- Sidebar: Home, Profile, Dashboard, Claims, Analytics.
- Dashboard: Real-time “Pending Claims” KPIs and charts via polling `GET /admin/claims/pending`.
- Claims: Pending claims table with approve/reject actions; search by Patient ID shows that user’s pending claims.
- Analytics: Year + user filters; monthly amounts, pending status donut, top users (pending amounts); user search table.

## Development
- Start a static server in `frontend`: `python3 -m http.server 8080`
- Update Playwright tests (optional): `npm i -D @playwright/test && npx playwright test`

## Accessibility
- Semantic landmarks (`header`, `nav`, `aside`, `main`), focus states and high-contrast colors. Charts include readable labels.

## Notes
- All endpoints preserved; no backend changes required for UI.
- S3 uploads are temporarily disabled; file selection is preview-only.
