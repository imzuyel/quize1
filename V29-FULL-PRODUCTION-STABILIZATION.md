# PGTSC Quiz Arena v29 — Full Production Stabilization

This release keeps the v28 public frontend and MySQL fixes and hardens the two highest-risk CRUD boundaries:

- Question create/update now whitelists only real `questions` columns.
- Question JSON fields accept either native arrays/objects or JSON strings.
- Question editor payloads cannot accidentally send UI-only fields such as `id`, `settings`, or timestamps into the questions table.
- Quiz update now whitelists real `quizzes` columns and parses stringified settings safely.
- Numeric quiz fields are normalized before reaching Drizzle/MySQL.
- Existing public pages: About, Gallery, Reviews, Contact, FAQ, Rules, Privacy, Terms, Developer remain included.

Validation performed in the packaging environment:
- Static scan: no `.returning()` calls.
- Static scan: no `useEffect(async ...)` pattern.
- ZIP integrity check: pass.

A full `npm install` / `next build` could not be completed in the packaging environment because registry installation timed out. Run `npm install` and `npm run build` on the target PC before production deployment.
