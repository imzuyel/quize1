# PGTSC Quiz Arena — Classroom Pro

This build focuses on the Kahoot/Mentimeter-style classroom experience.

- Large Game PIN and QR join panel on the host lobby
- Player count surfaced prominently
- Mobile student lobby highlights the live PIN
- Added Midnight Game Show and Ocean Classroom visual presets
- Existing AI question generation, PDF workflows, SSE live engine, leaderboard and themes are preserved

Local setup:

```bash
npm install
npx drizzle-kit push
npm run dev
```

Use a PostgreSQL DATABASE_URL in `.env`.
