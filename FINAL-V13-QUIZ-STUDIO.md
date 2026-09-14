# PGTSC Quiz Arena — Final v13 Quiz Studio

## Creation methods
- Manual question builder
- AI generator
- PDF/document workflow via AI Studio
- Copy-paste parser (numbered blocks, A/B/C/D, Answer:, CSV/TSV/pipe)
- Question bank
- JSON export/import
- Duplicate existing quiz

## Manual question types
MCQ, Multiple Select, True/False, Short Answer, Puzzle, Ordering.

## Per-question presentation
Timer, marks, difficulty, animation (fade/slide/zoom/flip/pop/none), and layout (classic/split/focus/minimal).

## Responsive design
Teacher screens are responsive and the Student experience is designed mobile-first. Test the local network flow with a phone connected to the same Wi-Fi/hotspot as the host PC.

## MySQL/XAMPP
```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/quiz_arena"
```
Then:
```bash
npm install
npm run db:push
npm run dev -- --hostname 0.0.0.0
```
