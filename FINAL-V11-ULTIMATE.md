# PGTSC Quiz Arena — Ultimate Classroom Blueprint

This release keeps the product focused on a self-hosted Kahoot/Mentimeter-style classroom response experience, while adding AI and teacher analytics.

## Core classroom flow
1. Teacher selects or generates a quiz.
2. Teacher starts a live session.
3. The host screen exposes Game PIN, keyword, QR and copyable Join Link.
4. Students join from phones using PIN/keyword; nickname is optional and can be auto-generated.
5. Teacher controls countdown, lock, reveal, leaderboard, next/skip, pause/resume and end.
6. Students receive synchronized questions and submit one protected answer per question.
7. Reveal shows distribution, correct/wrong/timeout and leaderboard.
8. Final screen shows podium and results.

## Kahoot-style capabilities
- Game PIN / keyword join
- Optional nickname with automatic nickname fallback
- Live lobby and participant count
- Timed questions
- Speed-aware scoring
- Randomized questions/options where configured
- Answer reveal and instant feedback
- Live leaderboard and final podium
- Team mode and power-ups where enabled
- Reactions, sound effects, celebrations and animated themes
- Presentation/fullscreen host mode

## Mentimeter-style capabilities
- Live response distribution
- Multiple response-oriented question types supported by the existing question engine
- Teacher-facing response statistics
- Presentation-first host view
- Classroom reactions/feedback

## AI workflow
- Topic/text/PDF based question generation
- Review/edit before publishing
- Difficulty/marks controls
- AI quality checks and teacher approval workflow
- Post-quiz performance insight/teaching recommendation

## UX
- Light/dark visual system
- Modern SVG/vector-friendly components
- Hind Siliguri + Noto Sans Bengali + Inter font stack
- Responsive student mobile UI
- Smooth slide/fade/scale transitions
- Countdown, answer, score, leaderboard and celebration animations

## Self-hosted target
- MySQL + mysql2 + Drizzle ORM
- XAMPP-compatible local database
- Next.js application
- No per-student SaaS subscription requirement

## Important boundary
The product is inspired by classroom response patterns used by Kahoot and Mentimeter; it is not intended to copy their proprietary source code, branding, or protected assets.
