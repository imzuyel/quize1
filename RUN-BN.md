# চালানোর নিয়ম

এই ZIP-এ TypeScript compile error দুইটি ঠিক করা হয়েছে। চালাতে XAMPP-এর MySQL চালু থাকতে হবে।

## Modern UI update

- নতুন violet–indigo–cyan product palette এবং softer background
- glass-style header/sidebar, responsive spacing, refined cards
- depth ও hover state-সহ modern buttons, input এবং navigation
- light/dark mode-এ একই visual system

## Exam API fix

পুরোনো MySQL exam attempt-এ `order` JSON string/object হিসেবে আসলেও এখন API সেটি নিরাপদে parse করে। ফলে `order.map is not a function` error আর হবে না।

## Role permission update

Student dashboard এখন শুধু quiz দেওয়া, live quiz-এ যোগ দেওয়া, practice ও ফলাফল দেখার জন্য সরল করা হয়েছে। Quiz/AI question generate, review result delete বা duplicate করার অধিকার শুধু teacher, admin ও super admin-এর।

## Live join ও game UI update

- Quiz শুরু হলেও lobby আর স্বয়ংক্রিয়ভাবে lock হবে না; শিক্ষক চাইলে আলাদা **লবি লক** control ব্যবহার করতে পারবেন।
- PIN বা keyword—দুই পথেই join করার পর client আসল session PIN ব্যবহার করে real-time update পাবে।
- Join screen এখন মোবাইল, ট্যাব ও ডেস্কটপে responsive game-style layout; animated background, live indicator এবং Kahoot-inspired visual hierarchy আছে।

1. XAMPP Control Panel থেকে **MySQL Start** করুন।
2. phpMyAdmin-এর SQL tab-এ `MYSQL-XAMPP-FIX.sql` চালান (এটি `quiz_arena` database তৈরি করবে)।
3. `.env.example` কপি করে নাম দিন `.env`। সেখানে রাখুন:

   ```env
   DATABASE_URL="mysql://root:@127.0.0.1:3306/quiz_arena"
   ```

   আপনার MySQL root password থাকলে `root:`-এর পরে সেটি বসান।
4. প্রজেক্ট ফোল্ডারে চালান:

   ```powershell
   npm install
   npx drizzle-kit push
   npm run dev
   ```

তারপর খুলুন: http://localhost:3000

`npm run dev` চালু হওয়ার আগে `.env` ও MySQL database না থাকলে অ্যাপ চলবে না, কারণ home page-সহ API-গুলো সরাসরি MySQL ব্যবহার করে।
