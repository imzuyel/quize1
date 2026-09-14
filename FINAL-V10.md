# PGTSC Quiz Arena — FINAL v10

Focus: classroom live quiz, AI-assisted question generation, fast student join, live leaderboard and teacher insight.

## v10
- PIN + keyword join
- Optional nickname with automatic nickname fallback
- Join link/QR classroom flow
- Live leaderboard and presentation mode
- AI post-quiz classroom coach endpoint and teacher analytics card
- Modern Bengali-first typography
- Light/dark theme toggle with persisted preference
- Existing animated themes, SVG/vector UI, live SSE and MySQL/XAMPP support retained

## Important MySQL note
This build uses Drizzle MySQL and fixes the most important live/structure/question/quiz/auth insert/update paths to avoid PostgreSQL-only `returning()` calls. Other legacy modules may still contain optional PostgreSQL-era patterns and should be tested before production deployment.
