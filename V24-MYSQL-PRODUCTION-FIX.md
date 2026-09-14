# PGTSC Quiz Arena v24 — MySQL/XAMPP Production Fix

## What changed
- Replaced PostgreSQL-style Drizzle `.returning()` calls in demo seeding with MySQL-compatible `$returningId()` + SELECT helpers.
- Replaced remaining CRUD INSERT/UPDATE `.returning()` usage in AI, presentations, templates, tournaments, exam and admin APIs.
- Added `src/lib/mysql-returning.ts` with `insertReturning()` and `updateReturning()` compatibility helpers.
- Existing direct `$returningId()` paths remain unchanged.
- Production bootstrap in `src/lib/seed.ts` is also MySQL-compatible.

## Fresh demo setup
1. Keep the existing database created by `drizzle-kit push`.
2. Ensure `.env` contains:
   `DATABASE_URL="mysql://root:@127.0.0.1:3306/quiz_arena"`
3. Start:
   `npm run dev`
4. Open `/demo?next=/teacher/ai`.

If a previous demo seed attempt partially inserted data, reset the empty demo database once, run `npx drizzle-kit push`, then open the demo link again.

## Production
For production, use `DEMO_MODE=false` and bootstrap a real administrator with:
`npx tsx scripts/setup-production.ts admin@school.edu.bd "StrongPassword"`

Then build and start with:
`npm run build`
`npm run start`

## Verification note
The source was statically audited for PostgreSQL-style `.returning()` calls. Full `npm install`/production build could not be completed in the packaging environment because dependency installation timed out, so the ZIP does not claim a successful local production build in this environment.
