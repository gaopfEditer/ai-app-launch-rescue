# NoteFlow Health Check Report (Sample Deliverable)

**Project:** NoteFlow — meeting notes mini-SaaS (constructed demo, not a real client codebase)  
**Service:** AI App Launch Rescue — hardening half-finished AI-built apps for production  
**Assessment date:** 2026-10-08  
**Assessor:** Portfolio demo repository (`before/` → `after/`)

---

## Executive summary

The **before** version behaves like a typical AI-generated prototype: shared global data, client-exposed secrets pattern, missing validation, and XSS-friendly rendering. The **after** version adds authentication, per-user data isolation, server-side AI with offline mock fallback, validation, rate limiting, error handling, tests, and CI.

Static scan (`node scripts/health-scan.mjs before`) reported **7 findings**; the same scan on `after/` reported **0 findings**.

---

## Findings (before) and fixes (after)

### 1. OpenAI API key exposed to the browser — **Critical**

| | |
|---|---|
| **Where** | `before/.env.example`, `before/src/lib/ai.js` |
| **Risk** | Any visitor can extract `VITE_*` variables from the JS bundle and spend your API budget or exfiltrate the key. |
| **Fix** | Removed client key usage; `OPENAI_API_KEY` is server-only in `after/.env.example`. AI calls run in `after/server/ai.ts`. |

### 2. OpenAI SDK runs in the browser — **Critical**

| | |
|---|---|
| **Where** | `before/src/lib/ai.js` (`dangerouslyAllowBrowser: true`) |
| **Risk** | Encourages shipping secrets to clients; bypasses server controls (rate limits, logging, auth). |
| **Fix** | Frontend calls `/api/ai/summarize` only (`after/src/api.ts`). |

### 3. No authentication or authorization — **Critical**

| | |
|---|---|
| **Where** | `before/server/index.js` (all routes public) |
| **Risk** | Anyone on the internet can read, create, or delete all notes. |
| **Fix** | JWT cookie auth + `authMiddleware` on protected routes; notes scoped by `user_id` (`after/server/app.ts`, `after/server/db.ts`). |

### 4. Stored XSS via unsanitized HTML — **High**

| | |
|---|---|
| **Where** | `before/src/components/NoteList.jsx` (`dangerouslySetInnerHTML`) |
| **Risk** | Malicious note content can run scripts in other users' browsers. |
| **Fix** | Plain-text rendering in `after/src/components/NoteList.tsx`. |

### 5. No input validation — **High**

| | |
|---|---|
| **Where** | `before/server/index.js` |
| **Risk** | Oversized payloads, empty records, and unexpected types can break UX or storage. |
| **Fix** | Zod schemas in `after/server/validation.ts`. |

### 6. AI endpoint without rate limiting — **Medium**

| | |
|---|---|
| **Where** | `before/server/index.js` |
| **Risk** | Abuse can spike cost or deny service. |
| **Fix** | `express-rate-limit` on `/api/ai/summarize` (10 req/min) in `after/server/app.ts`. |

### 7. Permissive CORS — **Medium**

| | |
|---|---|
| **Where** | `before/server/index.js` (`origin: '*'`) |
| **Risk** | Any origin can call your API from users' browsers (combined with missing auth, this is especially dangerous). |
| **Fix** | Explicit allowed origins with credentials in `after/server/app.ts`. |

### 8. Stack traces leaked to clients — **Medium**

| | |
|---|---|
| **Where** | `before/server/index.js` |
| **Risk** | Reveals internal paths and implementation details to attackers. |
| **Fix** | Generic `{ error: 'Internal server error' }` handler in `after/server/app.ts`. |

### 9. Missing UX states & error boundary — **Low**

| | |
|---|---|
| **Where** | `before/src/App.jsx`, `before/src/main.jsx` |
| **Risk** | Confusing blank screens; uncaught UI errors white-screen the app. |
| **Fix** | Loading/empty states in `after/src/App.tsx`; `ErrorBoundary` in `after/src/components/ErrorBoundary.tsx`. |

### 10. Mobile layout & accessibility gaps — **Low**

| | |
|---|---|
| **Where** | `before/src/index.css` (fixed 900px width), unlabeled inputs |
| **Risk** | Poor mobile usability; screen readers cannot identify fields. |
| **Fix** | Responsive layout and labels in `after/src/index.css` and form components. |

### 11. No automated tests or CI — **Low (process)**

| | |
|---|---|
| **Where** | `before/` |
| **Risk** | Regressions ship silently. |
| **Fix** | Vitest unit tests, Playwright e2e, GitHub Actions workflow in `.github/workflows/ci.yml`. |

---

## Measured comparison (executed in this environment)

| Check | Before (`before/`) | After (`after/`) |
|--------|-------------------|------------------|
| Static health scan findings | 7 (`node scripts/health-scan.mjs before`) | 0 (`node scripts/health-scan.mjs after`) |
| Production build | `npm run build` — **success** (2026-10-08) | `npm run build` — **success** (2026-10-08) |
| Main JS bundle (Vite output) | 145.85 kB (gzip 47.12 kB) | 149.89 kB (gzip 48.27 kB) |
| Unit tests | none | **4/4 passed** (`npm run test`) |
| E2E tests | none | **2/2 passed** (`npm run test:e2e`) |
| Lighthouse (dev URLs, headless Chrome) | perf **0.63**, a11y **0.83**, best-practices **0.93** @ `http://127.0.0.1:5173/` | perf **0.62**, a11y **1.00**, best-practices **0.96** @ `http://127.0.0.1:5174/` |

Lighthouse was run with:

`npx lighthouse <url> --only-categories=performance,accessibility,best-practices --chrome-flags="--headless --no-sandbox"`

Scores are environment-dependent; rerun locally to compare on your machine.

---

## Screenshots

Committed under `docs/screenshots/` (see root `README.md`).

---

## Recommended deployment notes

- **After app:** Vercel project root = `after/`, set `JWT_SECRET`, optional `OPENAI_API_KEY`. Uses in-memory SQLite on Vercel (`:memory:`) — suitable for demo; use persistent storage for production.
- **Before app (optional demo):** Vercel root = `before/` — illustrates the vulnerable baseline only; do not deploy publicly with real keys.

---

## How this maps to client work

1. **Audit** — static scan + manual review + run/build/test baseline.  
2. **Prioritize** — critical security and data-isolation first.  
3. **Harden** — auth, validation, secrets, observability.  
4. **Verify** — automated tests + Lighthouse + deploy preview.  
5. **Handoff** — report like this one, runbook, and CI.
