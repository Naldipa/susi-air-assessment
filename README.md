# Susi Air Pilot Operations Dashboard

A mobile-first pilot operations dashboard for the Susi Air full-stack technical assessment. It includes a Nuxt 3 frontend and a NestJS REST API backed by the three original assessment JSON files.

## Features

- Token-protected sign-in using the assessment demo account.
- Pilot profile and total flight-hour summary.
- Server-calculated daily, rolling 7-day, 30-day, and 365-day limit cards.
- Server-calculated rolling flight-hour chart for 1w, 1m, 3m, 6m, and 1y windows.
- Document expiry badges using the supplied warning threshold.
- Monthly schedule calendar for the supplied April, May, and June 2026 records.
- Daily flight-time logbook with 7-, 30-, and 90-day filters using the supplied flight-hour records.
- Pilot profile, sign-out action, and quick links in the More section.
- Duty legend, completion counts, and the required schedule-detail placeholder.
- Responsive layouts for desktop and mobile.

## Technology

- Frontend: Nuxt 3, Vue 3 Composition API, TypeScript, Pinia, SCSS, Chart.js.
- Backend: NestJS 12, Node.js, TypeScript, REST, class-validator.
- Data: read-only JSON files in the data folder; no database is required.

Nuxt 3 is required by the assessment. Nuxt's official documentation states that Nuxt 3 reached end of life on 31 July 2026; this project keeps Nuxt 3 to meet the required assessment stack. See https://nuxt.com/docs/3.x/bridge/configuration.

## Folder structure

    data/                 Original assessment JSON files (unchanged)
    nest/                 NestJS API
      src/auth/           Login, token signing, and global auth guard
      src/flight-hours/   Records, limit cards, and rolling summaries
      src/documents/      Expiry status calculation
      src/schedules/      Month filtering and duty legend
      src/pilot/          Pilot profile
    nuxt/                 Nuxt pages, Pinia store, components, and styles
    api/[...path].ts     Vercel serverless adapter for the NestJS API
    vercel.json           Vercel function build and data-file configuration
    render.yaml           Retained for reference; not used for Vercel deployment
    .node-version         Pinned Node.js version
    .env.example          Environment variable template

## Requirements

- Node.js 22.12 or later for the NestJS 12 API.
- pnpm 10.28 or later.
- Windows, macOS, or Linux.

NestJS 12 runs on Node 20.19+ or Node 22.12+. This development environment uses Node 22.14.0. The Nest CLI generator requires a newer Node release, so the project is configured directly rather than generated with the CLI. See https://docs.nestjs.com/migration-guide.

## Local setup (Windows PowerShell)

From the repository root:

    Copy-Item .env.example .env
    pnpm install
    pnpm dev

The frontend runs at http://localhost:3000 and the API runs at http://localhost:3001.

The assessment login is johndoe / susiairtest. Set DEMO_USERNAME and DEMO_PASSWORD in .env to change it.

## Open the development app on a phone

1. Connect the phone and computer to the same Wi-Fi network.
2. Start the app with pnpm dev and scan the Nuxt development QR code, or open the LAN URL printed in the terminal.
3. Sign in and use the dashboard as usual.

When the browser opens the app on a LAN address, the frontend points its API requests to that same computer address. The development API permits private-network browser origins on port 3000. If Windows Firewall asks, allow Node.js on the private network. The QR feature was verified with tests and an HTTP CORS preflight; it has not been physically tested on a phone.

## Environment variables

| Variable | Purpose | Local default |
| --- | --- | --- |
| NODE_ENV | Runtime mode | development |
| PORT | NestJS port | 3001 |
| ASSESSMENT_TODAY | Fixed date used in calculations | 2026-05-15 |
| DATA_DIR | Directory containing the three JSON files | ../data when API runs from nest/ |
| FRONTEND_ORIGIN | Allowed browser origin(s), comma-separated | http://localhost:3000 |
| DEMO_USERNAME | Assessment login username | johndoe in development |
| DEMO_PASSWORD | Assessment login password | susiairtest in development |
| TOKEN_SECRET | HMAC signing secret; use a unique random value in production | local development fallback |
| NUXT_PUBLIC_API_BASE_URL | API origin used by Nuxt | http://localhost:3001 |
| NUXT_PUBLIC_ASSESSMENT_DATE | Date shown in the interface; defaults to ASSESSMENT_TODAY | 2026-05-15 |

Production startup requires explicit DEMO_USERNAME, DEMO_PASSWORD, and a TOKEN_SECRET of at least 32 characters. Never commit .env.

## Run and verify

Run both apps from the root:

    pnpm dev

Or use separate terminals:

    pnpm dev:api
    pnpm dev:web

Build, type-check, and run tests:

    pnpm build
    pnpm typecheck
    pnpm test

Start the compiled API:

    pnpm --filter @susi/nest start:prod

## API

All endpoints except POST /auth/login require Authorization: Bearer <accessToken>.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /auth/login | Validate assessment credentials and return an 8-hour signed bearer token. |
| GET | /pilot/me | Return pilot name, total flight hours, and avatarUrl: null because the source has no avatar. |
| GET | /flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD | Return a zero-filled daily series and its inclusive sum. |
| GET | /flight-hours/summary?range=1w\|1m\|3m\|6m\|1y | Return rolling totals for dates centered on the configured assessment date. |
| GET | /flight-hours/limits | Return server-calculated daily, 7-day, 30-day, and 365-day cards. |
| GET | /documents | Return expiry dates, days remaining, and safe, soon, or expired status. |
| GET | /schedules?year=YYYY&month=MM | Return records and the legend for the requested month. |

Errors use a consistent JSON shape with statusCode, message, error, and path fields.

## Calculation choices

- Calendar dates use ISO date-only values and UTC arithmetic to avoid timezone shifts.
- Rolling windows include the point date. For example, a 7-day total on 15 May includes 9â€“15 May. Missing source dates count as zero.
- The chart shows seven dates before and after the fixed reference date. Each point's rolling window ends on that point's date. For displayed future dates, available source values through the date are included. Values above a limit are returned unchanged.
- The brief explicitly says to use 15 May 2026 as the assessment date. Both API calculations and the displayed interface date use ASSESSMENT_TODAY (NUXT_PUBLIC_ASSESSMENT_DATE for the client display) so deployments can keep them aligned. mock-schedules.json also specifies 15 May, while mock-documents.json specifies 31 May. The source files remain unchanged; the API uses the brief's explicit ASSESSMENT_TODAY default of 15 May for document status and returns the document source date for traceability.
- The source has no avatar URL, so the API returns null and the frontend uses the pilot's initial as a fallback.
- Schedule status (1 upcoming, 2 completed/verified) is shown separately from logbook completion. A day receives a check only when count_logbooks equals count_schedules; otherwise it shows remaining duties.

## Authentication notes

The assessment demo account is checked on the backend. Login returns a short-lived HMAC-SHA256 signed token. A global guard checks its signature and expiration for every endpoint except login. The token is stored in a same-site client-readable cookie so Nuxt route middleware can restore the session; this is suitable for the assessment demo but exposed to JavaScript. A production deployment should prefer an HttpOnly cookie through a backend-for-frontend or another server-managed session.

## Deployment to Vercel

Deploy the frontend and API as two Vercel projects from the same Git repository. The API uses a Vercel Node.js Function and loads the three original JSON files as read-only bundled data.

### 1. Deploy the API

1. Push the repository to GitHub or another Vercel-supported Git provider.
2. Create a Vercel project from the repository and set its Root Directory to the repository root.
3. Deploy with the repository's vercel.json settings. Vercel routes requests under /api to the NestJS function.
4. In the API project's Environment Variables, set:
   - NODE_ENV = production
   - DATA_DIR = data
   - ASSESSMENT_TODAY = 2026-05-15
   - DEMO_USERNAME and DEMO_PASSWORD = the assessment demo credentials you want to use
   - TOKEN_SECRET = a unique random secret of at least 32 characters
   - FRONTEND_ORIGIN = the exact production frontend origin, such as https://your-dashboard.vercel.app
5. Redeploy after adding environment variables. Note the API deployment URL.

### 2. Deploy the frontend

1. Create a second Vercel project from the same repository.
2. Set its Root Directory to nuxt and use the Nuxt framework preset.
3. Set these production Environment Variables:
   - NUXT_PUBLIC_API_BASE_URL = the API deployment URL followed by /api
   - NUXT_PUBLIC_ASSESSMENT_DATE = 2026-05-15
4. Deploy the frontend and note its production origin.
5. Set FRONTEND_ORIGIN in the API project to that exact origin, then redeploy the API.

### 3. Verify the live deployment

Open the frontend URL, sign in, and check the dashboard, flight logbook, documents, and schedule. The API URL itself may show a 404 at its root; test the endpoints under /api, such as /api/auth/login and /api/pilot/me. Use the browser developer tools to check for failed requests or CORS errors.

Keep TOKEN_SECRET private and do not commit production credentials to the repository. Vercel Hobby is intended for personal projects; review Vercel's current plan limits before relying on it for a production service.

The repository's vercel.json and serverless entry point prepare this project for Vercel, but deployment still requires pushing the repository to a Git provider, importing both Vercel projects, entering environment variables, and checking the resulting URLs. No live deployment URL is claimed until those steps are completed and verified.
## Verification record

Verified locally on 21 October 2026 with Node.js 22.14.0 and pnpm 10.28.1:

- pnpm typecheck â€” passed for NestJS and Nuxt.
- pnpm test â€” passed: 16 API tests and 6 Nuxt tests.
- pnpm build â€” passed for both production applications.
- API production-start smoke test - the Render start command launched locally; demo login and authenticated profile returned data.
- API LAN/CORS smoke test - private-network preflight returned HTTP 204 with the requested origin; a public origin received no Access-Control-Allow-Origin header.
- Earlier API endpoint smoke test - protected profile, limits, documents, and May schedule passed; missing bearer token returned HTTP 401.
- Current production preview smoke test â€” authenticated /logbook and /more returned HTTP 200; the API returned 30 daily records totaling 87.2 hours for 16 Aprilâ€“15 May 2026.
- Frontend smoke test â€” GET /login returned HTTP 200 from the production preview.

No public repository or deployment URL is included because none has been created or verified.


