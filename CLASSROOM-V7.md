# PGTSC Quiz Arena — Classroom Pro v7

## AI Quiz Studio upgrade

- One-click classroom quiz presets
- Topic/notes/PDF → AI generation → review → quiz/live workflow
- Existing provider fallback chain remains server-side
- Existing live SSE engine, themes, presentation mode and student join flow remain intact
- AI keys are never exposed to the browser

## Run

```bash
npm install
npx drizzle-kit push
npm run dev
```

Use `.env` with `DATABASE_URL=postgresql://postgres:1234@localhost:5432/quiz_arena`.
