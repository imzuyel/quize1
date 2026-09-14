# PGTSC Quiz Arena — Settings Upgrade v17

Admin Settings now includes global configuration sections for:

- Branding: school name, English name, logo URL/upload, contact, colors, footer, developer credit, copyright
- Institution: institution code, EIIN, address, phone, email, website, principal
- Social: Facebook, YouTube, Instagram, LinkedIn, GitHub, X/Twitter, website
- Appearance: system/light/dark defaults, colors, fonts, radius and animation level
- Quiz Defaults: timer, points, leaderboard, sound/music, randomization, late join, max participants, auto-next
- Student Defaults: nickname policy, auto nickname, avatar, rejoin, leaderboard name visibility
- SEO: metadata, site URL, logo, OG image, theme color, verification, robots/no-index
- Features, registration policy, achievements and announcements

All global settings use the existing MySQL `settings` table and the existing admin API (`saveSettings`), so no additional migration is required beyond the normal Drizzle schema push.

Logo upload accepts small PNG/JPG/WebP/SVG files and stores the selected image as a data URL in the settings record. Keep uploaded logos small (under 700 KB).
