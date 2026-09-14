# PGTSC Quiz Arena — সহজ Join Flow

- শিক্ষার্থীরা `/join` এ যাবে।
- ৬ ডিজিটের Game PIN **অথবা** Host দেখানো Keyword দিলেই হবে।
- Nickname ঐচ্ছিক। ফাঁকা রাখলে server স্বয়ংক্রিয় মজার নাম তৈরি করবে।
- Join করার পর `/play/<code-or-keyword>` এ নিয়ে যাবে এবং live session-এর সাথে যুক্ত থাকবে।
- Home-এর উপরের Join bar ও Leaderboard link থেকে দ্রুত প্রবেশ করা যায়।
- Host lobby-তে PIN ও Keyword দুটোই দেখা যাবে।

## MySQL/XAMPP

```bash
npm install
npm run db:push
npm run dev
```
