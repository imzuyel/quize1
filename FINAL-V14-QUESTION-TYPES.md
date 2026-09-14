# PGTSC Quiz Arena — Final v14 Question Types

This release implements the full classroom question-type set in the Manual Quiz Builder and live student player.

## Supported types
- Multiple Choice (`mcq`)
- Multiple Select (`multi_select`)
- True / False (`true_false`)
- Short Answer (`short_answer`)
- Numeric Answer (`numeric_answer`) with optional ± tolerance
- Word Answer (`word_answer`)
- Puzzle (`puzzle`) with letter/tile interaction
- Matching (`matching`) using `Left → Right` pairs
- Ordering (`ordering`)
- Poll (`poll`) with no correct answer and no score
- Word Cloud (`word_cloud`)
- Open-ended (`open_ended`) for teacher-reviewed responses

## Creation paths
Manual, AI, PDF/document workflow, copy-paste parser, question bank, and import paths remain available.

## Mobile
The student answer components are responsive and use the existing mobile-first live quiz shell. Numeric, text, puzzle, matching and ordering controls are touch-friendly.

## MySQL/XAMPP
No schema migration is required for the new types because the question `type`, `options`, `correct`, and per-question `settings` are stored in the existing columns/JSON fields.

Run:

```bash
npm install
npm run db:push
npm run dev -- --hostname 0.0.0.0
```
