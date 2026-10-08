# Seeded issues (constructed demo — not real client code)

This `before/` app intentionally mirrors common problems in AI-generated SaaS prototypes.

| # | Issue | Location |
|---|--------|----------|
| 1 | OpenAI API key exposed in client bundle via `VITE_OPENAI_API_KEY` | `src/lib/ai.ts`, `.env.example` |
| 2 | No authentication; all notes are global | `server/index.js`, `src/App.tsx` |
| 3 | API routes accept any body with no validation | `server/index.js` |
| 4 | No authorization checks on CRUD or AI endpoints | `server/index.js` |
| 5 | Unhandled errors crash API responses; no client error boundary | `server/index.js`, `src/main.tsx` |
| 6 | AI endpoint has no rate limiting | `server/index.js` |
| 7 | XSS-friendly note rendering (`dangerouslySetInnerHTML`) | `src/components/NoteList.tsx` |
| 8 | Missing loading and empty states | `src/App.tsx` |
| 9 | Mobile layout breaks (fixed 900px container) | `src/index.css` |
| 10 | Accessibility: no labels, icon-only buttons | `src/components/*.tsx` |
| 11 | No automated tests or CI | entire repo |
| 12 | Secrets committed pattern in `.env.example` (teaches bad habit) | `.env.example` |
| 13 | Verbose error messages leak stack traces to clients | `server/index.js` |
| 14 | No security headers / permissive CORS | `server/index.js` |
