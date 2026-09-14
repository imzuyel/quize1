# PGTSC Quiz Arena — Classroom Pro v6

## Classroom-focused upgrades
- Presentation mode for projector/TV screens (press F or use the button).
- Fullscreen control.
- Dependency-free optional classroom sound effects using Web Audio; no audio files or external media required.
- Host keyboard controls: `F` presentation mode, `R` reveal, `Space/Right Arrow` advance after reveal.
- Student sound feedback for question changes and submission.
- Existing SSE live engine, server-authoritative scoring, compact student snapshots, AI generator, themes, teams and power-ups remain intact.

## Recommended classroom flow
1. Teacher opens `/teacher/live` and starts a published quiz.
2. Open `/host/<PIN>` on the projector.
3. Display QR/PIN; students open `/join` on their phones.
4. Turn on Presentation mode/fullscreen.
5. Start the quiz. Students answer simultaneously.
6. Reveal → leaderboard → next question.

## Scale note
The application is optimized for a single Node.js process with PostgreSQL. For multiple server instances, replace the in-memory realtime pub/sub with Redis or another shared broker before horizontal scaling.
