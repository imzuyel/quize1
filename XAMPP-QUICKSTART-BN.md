# PGTSC Quiz Arena — XAMPP Quick Start

## 1. Install
- XAMPP with MySQL
- Node.js 20+ LTS

## 2. Start MySQL
XAMPP Control Panel → MySQL → Start

## 3. Create database
Open `http://localhost/phpmyadmin` and create `quiz_arena`, or run `scripts/setup-xampp.sql`.

## 4. Configure `.env`
```env
DATABASE_URL=mysql://root:@127.0.0.1:3306/quiz_arena
DEMO_MODE=true
```
If your MySQL root account has a password, replace the empty password after `root:`.

## 5. Install and migrate
```bash
npm install
npm run db:push
```

## 6. Run
```bash
npm run dev
```
Open `http://localhost:3000`.

## 7. Production
Set `DEMO_MODE=false`, configure a strong database password/user, then:
```bash
npm run build
npm run start
```

## 📸 Public Group Photo & Reviews (v19)

Quiz শেষ হলে Admin/Teacher → **Gallery & Memories** থেকে একটি event তৈরি করে একাধিক group photo upload করা যাবে। Browser upload-এর আগেই ছবিকে সর্বোচ্চ 1800px এবং WebP quality 0.82-তে compress করে, তাই বড় original photo সরাসরি public visitor-কে পাঠানো হয় না। Gallery lazy-load করে এবং event অনুযায়ী ছবি দেখায়।

Public Gallery: `/gallery`
Public Reviews: `/reviews`
Admin Gallery: `/admin/gallery`
Admin Review Moderation: `/admin/reviews`

Review সরাসরি public হয় না; আগে **pending → admin approve → public**।

নতুন schema apply করতে:

```bash
npx drizzle-kit push
```

> cPanel/hosting-এ `public/uploads/gallery` folder-এর জন্য write permission প্রয়োজন।
