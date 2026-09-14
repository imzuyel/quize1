# PGTSC Quiz Arena v28 — Full MySQL/Frontend Stability Audit

## Fixed in v28
- Replaced remaining PostgreSQL-style Drizzle `onConflict*` calls with MySQL `onDuplicateKeyUpdate` equivalents.
- Fixed admin structure update duplicate-name validation so editing the same record does not falsely fail.
- Fixed the application logout caller to use the implemented `/api/auth` action endpoint.
- Added a shared public navigation/footer for About, Gallery, Reviews, Contact, FAQ, Privacy and Terms.
- Fixed Gallery/Reviews frontend response-shape mismatches (`events`/`reviews` are top-level API fields).
- Rebuilt public Reviews page with safe effect cleanup, loading/error states and correct API handling.
- Preserved previous v25/v26/v27 hydration, JSON-options and MySQL datetime fixes.
- Static audit confirms no `.returning()` or `useEffect(async ...)` remains in `src`.

## Public pages
- `/about`
- `/gallery`
- `/reviews`
- `/contact`
- `/faq`
- `/rules`
- `/privacy`
- `/terms`
- `/developer`

## Verification
- TypeScript/TSX syntax transpilation check: PASS.
- Static MySQL compatibility audit: PASS for the previously identified `.returning()` / `onConflict*` issues.
- Full `npm install` and production build could not be completed in the packaging environment because package installation timed out. Run `npm install` and `npm run build` on the target PC/server before production deployment.
