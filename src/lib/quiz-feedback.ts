/**
 * Funny Bangladeshi student-friendly quotes, roasts, and praise
 * tailored to quiz score, rank, and accuracy.
 */

export type FunnyRemark = {
  tier: "champion" | "podium" | "good" | "average" | "needs_work" | "zero";
  badge: string;
  emoji: string;
  title: string;
  quote: string;
  advice: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

const CHAMPION_QUOTES = [
  "ভাইরে ভাই! আপনি তো পুরো আগুন! 🔥 Google ও আপনার সামনে এসে লজ্জা পাবে! 🧠👑",
  "১ম স্থান! আপনার মেধার কাছে ক্যালকুলেটরও হার মেনে গেছে! 🚀😎",
  "আজকে কি পরীক্ষার প্রশ্ন আপনি নিজেই ফাঁস করেছিলেন নাকি?! চরম লেভেলের খেলা! 🏆✨",
  "টপার অ্যালার্ট! বাকি বন্ধুদের একটু শান্তিতে বাঁচতে দিন গুরু! 🫡🔥",
  "আপনার মস্তিষ্ক তো 5G স্পিডে চলছে! মা-বাবাকে গিয়ে অবিলম্বে রেজাল্ট দেখান! 🥇🎉",
];

const PODIUM_QUOTES = [
  "অল্পের জন্য ফার্স্ট মিস! কিন্তু পারফরম্যান্স ছিল এককথায় মাখন! 🥈👏",
  "পোডিয়ামে জায়গা পাকা! আরেকটু স্পিড বাড়ালে ১ নম্বর ট্রফিটা আপনারই হতো! 🏎️💨",
  "চরম হয়েছে! টপার কিন্তু আপনাকে দেখে এখন ভয়ে ভয়ে পেছনের দিকে তাকাচ্ছে! 🥉🔥",
  "টপ ৩ তে থাকা চাট্টিখানি কথা না! পরের বার চ্যাম্পিয়ন আপনিই হবেন ইনশাআল্লাহ! 🎖️💪",
];

const GOOD_QUOTES = [
  "ভালো খেলেছেন! তবে আরেকটু মনোযোগ দিলে বোর্ড কাঁপানো রেজাল্ট হতো! 📚💪",
  "খেলার মধ্যে ছিলেন একদম! ভুলগুলো শুধরে নিলে পরের বার ট্রফি আপনার হাতেই! 🎯😎",
  "পড়ালেখা ঠিক পথেই চলছে! আরেকটু প্র্যাকটিস করলেই আপনিও টপ লিস্টে! ✨👌",
  "সাবাশ! তবে আত্মতুষ্টিতে ভোগা যাবে না, সামনে কিন্তু আরও কঠিন পরীক্ষা! 🦁📖",
];

const AVERAGE_QUOTES = [
  "না ভালো, না খারাপ—একদম ব্যালেন্সড খিচুড়ি পারফরম্যান্স! 🍲😅 আরেকটু পড়লে তো বোর্ড ফাটাতেন!",
  "৫০-৫০ চান্সে খেললেন তো! আন্দাজে দাগানো কমিয়ে বইয়ের দিকে একটু নজর দিন! 📖🤔",
  "মাঝপথে আটকে গেলেন কেন? পরের বার এক কাপ চা খেয়ে রিভিশন দিয়ে আসবেন! ☕💡",
  "পাস করেছেন ঠিকই, কিন্তু এমন রেজাল্ট দেখে আম্মু কিন্তু উড়ন্ত ঝাড়ু খুঁজতে পারে! 🧹😂",
];

const NEEDS_WORK_QUOTES = [
  "পড়ালেখা বাদ দিয়ে কি সারাদিন ফেসবুক আর টিকটক রিলস দেখছিলেন? 📱🤣 বইয়ের সাথে একটু ভাব জমান ভাই!",
  "বইয়ের সাথে কি আপনার পূর্বজন্মের কোনো শত্রুতা আছে ভাই? 😭💀 একটু পড়ালেখা শুরু করেন!",
  "উত্তরগুলো কি চোখ বন্ধ করে লটারির মতো দাগিয়েছেন? 🎲🤦‍♂️ পরের বার একটু পড়ে আসবেন প্লিজ!",
  "আপনার রেজাল্ট দেখে বই নিজেই কান্না শুরু করে দিয়েছে! 📚🥲 আজ থেকেই পড়তে বসা ফরজ!",
  "এমন রেজাল্ট দেখে শিক্ষক তো অজ্ঞান হওয়ার অবস্থা! 🚑😂 প্লিজ একটু সিরিয়াস হন!",
  "মাথা ঠান্ডা করে বলুন তো, শেষ কবে বই খুলেছিলেন? 🕵️‍♂️📖 রিভিশন ছাড়া জীবনে কোনো উন্নতি নেই!",
];

const ZERO_QUOTES = [
  "ডাবল আন্ডা! 🥚🦆 একটাও মিলল না রে ভাই?! আজকে রাতে ভাত না খেয়ে শুধু বই চিবিয়ে খান! 🏃‍♂️💨",
  "শূন্যের আবিষ্কার ভারতে হলেও এর পূর্ণ সদ্ব্যবহার আজ আপনিই করলেন! 🥲🫡 অবিলম্বে পড়তে বসুন!",
  "ভাইরে ভাই! একটা উত্তরও সঠিক হলো না?! পরীক্ষার হলে কি ঘুমাচ্ছিলেন? 😴💤",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getFunnyRemark(opts: {
  rank: number;
  totalPlayers?: number;
  accuracy: number;
  score: number;
}): FunnyRemark {
  const { rank, totalPlayers = 1, accuracy, score } = opts;

  // Zero score / no correct answers
  if (score <= 0 || accuracy === 0) {
    return {
      tier: "zero",
      badge: "🦆 ডাবল আন্ডা!",
      emoji: "🥚",
      title: "একটিও সঠিক হয়নি!",
      quote: pickRandom(ZERO_QUOTES),
      advice: "ফেসবুক ও গেম বন্ধ করে আজ থেকেই অন্তত ৩০ মিনিট বই পড়ুন।",
      colorClass: "text-rose-900",
      bgClass: "bg-rose-50",
      borderClass: "border-rose-300",
    };
  }

  // Champion (1st Place)
  if (rank === 1) {
    return {
      tier: "champion",
      badge: "👑 চ্যাম্পিয়ন / ১ম স্থান",
      emoji: "🏆",
      title: "অবিশ্বাস্য পারফরম্যান্স!",
      quote: pickRandom(CHAMPION_QUOTES),
      advice: "এই ধারাবাহিকতা বজায় রাখুন, আপনি প্রকৃত অর্থেই মেধার পরিচয় দিয়েছেন!",
      colorClass: "text-amber-950",
      bgClass: "bg-gradient-to-r from-amber-50 to-yellow-50",
      borderClass: "border-amber-300",
    };
  }

  // Podium (2nd or 3rd)
  if (rank === 2 || rank === 3) {
    return {
      tier: "podium",
      badge: rank === 2 ? "🥈 ২য় স্থান" : "🥉 ৩য় স্থান",
      emoji: rank === 2 ? "🥈" : "🥉",
      title: "অসাধারণ লড়াই!",
      quote: pickRandom(PODIUM_QUOTES),
      advice: "আরেকটু দ্রুত উত্তর দিলে এবং সূক্ষ্ম ভুলগুলো এড়ালে পরবর্তী কুইজে ১ম স্থান নিশ্চিত!",
      colorClass: "text-indigo-950",
      bgClass: "bg-gradient-to-r from-indigo-50 to-sky-50",
      borderClass: "border-indigo-200",
    };
  }

  // High accuracy (>= 75%) or upper third of rank
  const isUpperHalf = totalPlayers > 1 && rank <= Math.ceil(totalPlayers / 2);
  if (accuracy >= 75 || (isUpperHalf && accuracy >= 65)) {
    return {
      tier: "good",
      badge: `🏅 #${rank} স্থান`,
      emoji: "🎯",
      title: "বেশ ভালো করেছেন!",
      quote: pickRandom(GOOD_QUOTES),
      advice: "আপনার প্রস্তুতি ভালো। দুর্বল অধ্যায়গুলোতে আরেকটু জোর দিন।",
      colorClass: "text-emerald-950",
      bgClass: "bg-gradient-to-r from-emerald-50 to-teal-50",
      borderClass: "border-emerald-200",
    };
  }

  // Mid accuracy (45% - 74%)
  if (accuracy >= 45) {
    return {
      tier: "average",
      badge: `⚖️ #${rank} স্থান`,
      emoji: "🤔",
      title: "মোটামুটি চলেছে!",
      quote: pickRandom(AVERAGE_QUOTES),
      advice: "কনসেপ্ট আরও পরিষ্কার করতে হবে এবং আন্দাজে অনুমান করা কমাতে হবে।",
      colorClass: "text-amber-900",
      bgClass: "bg-gradient-to-r from-amber-50 to-orange-50",
      borderClass: "border-amber-200",
    };
  }

  // Poor / Struggling (< 45%)
  return {
    tier: "needs_work",
    badge: `🚨 #${rank} স্থান`,
    emoji: "💀",
    title: "আরও অনেক পড়তে হবে!",
    quote: pickRandom(NEEDS_WORK_QUOTES),
    advice: "অবহেলা না করে বিষয়টির মূল বই মনোযোগ দিয়ে রিভিশন দিন।",
    colorClass: "text-rose-950",
    bgClass: "bg-gradient-to-r from-rose-50 to-red-50",
    borderClass: "border-rose-300",
  };
}

/* -------------------------------------------------------------------------- */
/*             Live In-Game Performance Remarks (Good / Cold Streaks)         */
/* -------------------------------------------------------------------------- */

export type LivePerformanceRemark = {
  type: "hot_streak" | "cold_streak" | "lightning" | "normal";
  tone: "success" | "danger" | "warning" | "info";
  title: string;
  emoji: string;
  badge: string;
  message: string;
  advice?: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
};

const HOT_STREAK_MESSAGES_2 = [
  "ডাবল ট্রিক! 🔥 আপনি তো দারুন ছন্দে আছেন!",
  "পরপর ২টি সঠিক! 🚀 গেম এখন আপনার নিয়ন্ত্রণে!",
  "সাবাশ! মোমেন্টাম কিন্তু আপনার দিকে ঘুরছে! ⚡",
];

const HOT_STREAK_MESSAGES_3 = [
  "হ্যাটট্রিক! 🔥🔥🔥 পুরো ক্লাসে আগুন ধরিয়ে দিয়েছেন!",
  "পরপর ৩টি সঠিক উত্তর! 🧠 টপার হওয়ার রাস্তা একদম পরিষ্কার!",
  "ভাইরে ভাই! মস্তিষ্ক তো 5G স্পিডে চলছে! 🚀😎",
  "অবিশ্বাস্য ফোকাস! বাকিদের তো পেছনে ফেলে দিচ্ছেন! 🏎️💨",
];

const HOT_STREAK_MESSAGES_5_PLUS = [
  "অনস্টপাবল গড মোড! 👑 আপনার জ্ঞানের সামনে প্রশ্নপত্রও কাঁপছে!",
  "টানা সঠিক উত্তরের ঝড়! 🌪️ ক্যালকুলেটরও আপনার কাছে হার মেনেছে!",
  "বোর্ডের টপার অ্যালার্ট! 🏆 ট্রফি কি এখনই আপনার ঠিকানায় পাঠিয়ে দেব?!",
  "আজকে কি পরীক্ষা আপনি নিজেই প্রশ্ন করেছিলেন নাকি?! 🌟🔥",
];

const COLD_STREAK_MESSAGES_2 = [
  "পরপর ২টি ভুল?! 🤦‍♂️ একটু ঠান্ডা মাথায় ভাবুন, আন্দাজে দাগানো বন্ধ করুন ভাই!",
  "উত্তরগুলো কি চোখ বন্ধ করে লটারির মতো দাগাচ্ছেন? 🎲 পরেরটা একটু পড়ে দাগান!",
  "মাথা কাজ করছে না? ☕ এক ঢোক পানি খেয়ে পরের প্রশ্নে বাউন্স ব্যাক করুন!",
  "একটু ফোকাস! 🎯 তাড়াহুড়ো না করে প্রশ্নটা শেষ পর্যন্ত পড়ুন।",
  "ভাই একটু ধীরে! তাড়াহুড়ো করে উল্টাপাল্টা অপশন চাপ দিচ্ছ কেন? 😅",
];

const COLD_STREAK_MESSAGES_3 = [
  "বইয়ের সাথে কি আপনার পূর্বজন্মের কোনো শত্রুতা আছে ভাই? 😭💀 একটু পড়ালেখা শুরু করেন!",
  "পরপর ৩টা গেল! 💀 এমন দাগানো দেখে প্রশ্নকর্তা নিজেই অজ্ঞান হওয়ার অবস্থা! 🚑😂",
  "পড়ালেখা বাদ দিয়ে কাল রাতেও কি ফেসবুকে রিলস দেখছিলেন?! 📱 বইয়ের সাথে একটু ভাব জমান!",
  "হ্যাটট্রিক ভুল! 🤦‍♂️ এবার অন্তত চোখ-কান খোলা রেখে অপশনগুলো দেখুন!",
  "ভাই একটু ভেবেচিন্তে দাগাও! আন্দাজে গুলি চালাচ্ছ নাকি? 😅",
];

const COLD_STREAK_MESSAGES_4_PLUS = [
  "ডাবল আন্ডা হ্যাট্রিক! 🦆🥚 ভাইরে ভাই, এবার তো অন্তত একটা সঠিক দাগাতেই হবে! 🏃‍♂️💨",
  "ইমার্জেন্সি রেড অ্যালার্ট! 🚨 এমন অবস্থা চললে আম্মু কিন্তু উড়ন্ত ঝাড়ু খুঁজবে! 🧹😂",
  "মাথা ঠান্ডা করে বলুন তো, শেষ কবে বই খুলেছিলেন? 🕵️‍♂️ পরের প্রশ্নে পুরো শক্তি দিন!",
  "লম্বা শ্বাস নিন! 🧘‍♂️ পিছনের ভুল ভুলে যান, পরের প্রশ্নটাতে সেরাটা দিন! কামব্যাক সম্ভব!",
  "এক কাপ চা খেয়ে আসো, মাথাটা মনে হয় অতিরিক্ত গরম হয়ে গেছে! ☕💀 পরেরটাতে ঘুরে দাঁড়াও!",
];

export function getLivePerformanceRemark(opts: {
  correct: boolean;
  streak: number;
  consecutiveWrong: number;
  responseMs?: number;
  questionNumber?: number;
}): LivePerformanceRemark | null {
  const { correct, streak, consecutiveWrong, responseMs } = opts;

  // 1. If player got it CORRECT
  if (correct) {
    // Lightning fast answer (< 3.2s)
    if (responseMs && responseMs <= 3200 && streak <= 2) {
      return {
        type: "lightning",
        tone: "success",
        title: "বিদ্যুৎ গতির সঠিক উত্তর! ⚡",
        emoji: "⚡",
        badge: "লাইটনিং স্পিড",
        message: "চোখের পলকে সঠিক উত্তর দাগিয়ে দিলেন! অসাধারণ টাইমিং!",
        bgClass: "bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent",
        borderClass: "border-amber-400/50 ring-1 ring-amber-400/30",
        textClass: "text-amber-300",
      };
    }

    if (streak >= 5) {
      return {
        type: "hot_streak",
        tone: "success",
        title: `টানা ${streak}টি সঠিক উত্তর! 🔥`,
        emoji: "👑",
        badge: `${streak}x সুপার স্ট্রিক`,
        message: pickRandom(HOT_STREAK_MESSAGES_5_PLUS),
        bgClass: "bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-transparent",
        borderClass: "border-emerald-400/60 ring-1 ring-emerald-400/40",
        textClass: "text-emerald-300",
      };
    }

    if (streak >= 3) {
      return {
        type: "hot_streak",
        tone: "success",
        title: "হ্যাটট্রিক সঠিক উত্তর! 🚀",
        emoji: "🔥",
        badge: `${streak}x স্ট্রিক`,
        message: pickRandom(HOT_STREAK_MESSAGES_3),
        bgClass: "bg-gradient-to-r from-orange-500/25 via-amber-500/15 to-transparent",
        borderClass: "border-orange-400/60 ring-1 ring-orange-400/40",
        textClass: "text-orange-300",
      };
    }

    if (streak === 2) {
      return {
        type: "hot_streak",
        tone: "success",
        title: "দারুণ ফর্ম! ২ টানা সঠিক! 🎯",
        emoji: "🎯",
        badge: "২x স্ট্রিক",
        message: pickRandom(HOT_STREAK_MESSAGES_2),
        bgClass: "bg-gradient-to-r from-emerald-500/20 to-transparent",
        borderClass: "border-emerald-400/40",
        textClass: "text-emerald-300",
      };
    }

    return null; // 1st correct with normal speed doesn't need to overwhelm screen
  }

  // 2. If player got it WRONG (Cold Streaks / Funny roasts & motivation)
  if (consecutiveWrong >= 4) {
    return {
      type: "cold_streak",
      tone: "danger",
      title: `টানা ${consecutiveWrong}টি ভুল! রেড অ্যালার্ট! 🚨`,
      emoji: "💀",
      badge: "ইমার্জেন্সি কোল্ড স্ট্রিক",
      message: pickRandom(COLD_STREAK_MESSAGES_4_PLUS),
      advice: "হতাশ হবেন না, পরের প্রশ্নটাতে অপশনগুলো ধীরে ধীরে পড়ে দাগান!",
      bgClass: "bg-gradient-to-r from-rose-500/30 via-red-500/15 to-transparent",
      borderClass: "border-rose-500/70 ring-1 ring-rose-400/50",
      textClass: "text-rose-300",
    };
  }

  if (consecutiveWrong === 3) {
    return {
      type: "cold_streak",
      tone: "danger",
      title: "পরপর ৩টি ভুল! 😭",
      emoji: "🤦‍♂️",
      badge: "কোল্ড স্ট্রিক",
      message: pickRandom(COLD_STREAK_MESSAGES_3),
      advice: "আন্দাজে দাগানো বন্ধ করুন, প্রশ্ন মনোযোগ দিয়ে পড়ুন!",
      bgClass: "bg-gradient-to-r from-rose-500/20 via-orange-500/10 to-transparent",
      borderClass: "border-rose-400/50",
      textClass: "text-rose-300",
    };
  }

  if (consecutiveWrong === 2) {
    return {
      type: "cold_streak",
      tone: "warning",
      title: "পরপর ২টি ভুল হলো! ⚠️",
      emoji: "🤔",
      badge: "সতর্কতা",
      message: pickRandom(COLD_STREAK_MESSAGES_2),
      advice: "একটু সময় নিয়ে অপশনগুলো ভালো করে ভেবে দাগান।",
      bgClass: "bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent",
      borderClass: "border-amber-400/40",
      textClass: "text-amber-300",
    };
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*               5-Question Milestone Review (Every 5 Questions)              */
/* -------------------------------------------------------------------------- */

export type MilestoneReview = {
  milestoneNumber: number;
  title: string;
  badge: string;
  emoji: string;
  score: number;
  rank?: number;
  correctInBatch: number;
  totalInBatch: number;
  overallCorrect: number;
  overallTotal: number;
  accuracy: number;
  verdict: string;
  advice: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

const MILESTONE_PERFECT_5 = [
  "৫-এ ৫ পারফেক্ট! 🔥 আপনি তো পুরো আগুন! এই রাউন্ডে আপনাকে কেউ ছুঁতেও পারেনি!",
  "তুখোড় পারফর্মেন্স! 🚀 আপনার মেধার সামনে প্রশ্নপত্রও কুপোকাত! পুরো ক্লাসে আপনার রাজত্ব!",
  "জিনিয়াস মোড অন! 🧠 ৫টার ৫টাই সঠিক! Google ও আপনার কাছে লজ্জা পাবে!",
  "চরম লেভেলের খেলা! 🏆 মা-বাবাকে এখনই ফোন করে মিষ্টি আনতে বলুন!",
];

const MILESTONE_GREAT_4 = [
  "দারুণ ফর্ম! 🌟 গত ৫টির ৪টিই সঠিক! টপার হওয়ার লড়াইয়ে আপনি একদম এগিয়ে!",
  "চমৎকার পারফরম্যান্স! 🎯 মাত্র ১টা ফস্কেছে, কিন্তু মোমেন্টাম একদম আপনার দিকে!",
  "স্পিড আর ফোকাস দুটোই দারুণ! ⚡ এভাবেই শেষ পর্যন্ত টিকে থাকুন!",
];

const MILESTONE_BALANCED_3 = [
  "ব্যালেন্সড খিচুড়ি পারফরম্যান্স! 🍲 কিছু ঠিক, কিছু ভুল—তবে আশা এখনো বাকি!",
  "৫০-৫০ চলছে! আরেকটু ফোকাস করলে আপনিও টপ লিডারবোর্ডে উঠে আসবেন! ⚖️",
  "মাঝারি গতি! পরের ৫টিতে একটু জোর দিলে পোডিয়ামে ওঠা সম্ভব! 💪",
];

const MILESTONE_POOR_1_2 = [
  "সতর্কতা! ⚠️ ৫টির মধ্যে মাত্র কয়েকটি সঠিক! এমন চললে আম্মু কিন্তু উড়ন্ত ঝাড়ু খুঁজবে! 🧹😂",
  "ভাই একটু ভেবেচিন্তে দাগাও! আন্দাজে গুলি চালাচ্ছ নাকি?! 😅 পরের ৫টিতে কামব্যাক চাই!",
  "বইয়ের সাথে কি শত্রুতা আছে নাকি ভাই?! 😭 একটু চোখ-কান খোলা রেখে অপশনগুলো পড়ো!",
  "এক কাপ চা খেয়ে আসো, মাথাটা মনে হয় অতিরিক্ত গরম হয়ে গেছে! ☕🧠 পরের রাউন্ডে ঝড় তোলো!",
];

const MILESTONE_ZERO_0 = [
  "ডাবল আন্ডা রাউন্ড! 🥚🦆 গত ৫টির একটাও মিলল না রে ভাই?! ভাইরে ভাই, ক্লাসে ঘুমাচ্ছিলেন নাকি?! 😂",
  "হ্যাটট্রিক ভুল পার হয়ে ডাবল আন্ডা! 🤦‍♂️ বইয়ের পাতাগুলো কি উল্টেও দেখোনি কোনোদিন?!",
  "ডিপ ব্রেথ নাও... চোখ বন্ধ করো... 🧘‍♂️ মাথা ঠান্ডা করো, এখনও খেলা শেষ হয়নি! পরের ৫টিতে বাউন্স ব্যাক করো! 💪",
  "চশমার পাওয়ার ঠিক আছে তো? 🔍 প্রশ্ন না পড়েই দাগাচ্ছ নাকি ভাই?! পরের রাউন্ডে ঘুরে দাঁড়াও!",
];

export function getMilestoneReview(opts: {
  questionIndex: number;
  score: number;
  rank?: number;
  totalPlayers?: number;
  correctCount: number;
  answeredCount: number;
  recent5Answers?: boolean[];
}): MilestoneReview {
  const {
    questionIndex,
    score,
    rank,
    totalPlayers = 1,
    correctCount,
    answeredCount,
    recent5Answers = [],
  } = opts;

  const milestoneNumber = questionIndex + 1; // e.g. 5, 10, 15
  const totalInBatch = recent5Answers.length > 0 ? recent5Answers.length : 5;
  const correctInBatch =
    recent5Answers.length > 0
      ? recent5Answers.filter(Boolean).length
      : Math.min(correctCount, 5);

  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const batchRatio = correctInBatch / totalInBatch;

  let emoji = "🎯";
  let verdict = "";
  let advice = "";
  let colorClass = "text-amber-300";
  let bgClass = "bg-slate-900/95";
  let borderClass = "border-amber-400/40";

  if (batchRatio >= 0.8) {
    emoji = "🏆";
    verdict = correctInBatch === 5 ? pickRandom(MILESTONE_PERFECT_5) : pickRandom(MILESTONE_GREAT_4);
    advice = "এই গতির ধারাবাহিকতা বজায় রাখুন, পরের রাউন্ডেও আপনিই সেরা থাকবেন!";
    colorClass = "text-emerald-300";
    bgClass = "bg-gradient-to-b from-emerald-950/90 via-slate-950/95 to-slate-950";
    borderClass = "border-emerald-400/60 ring-1 ring-emerald-400/40";
  } else if (batchRatio >= 0.5) {
    emoji = "⚖️";
    verdict = pickRandom(MILESTONE_BALANCED_3);
    advice = "আর অল্প একটু মনোযোগ আর স্পিড বাড়ালে আপনিও টপ লিডারবোর্ডে উঠে আসবেন!";
    colorClass = "text-amber-300";
    bgClass = "bg-gradient-to-b from-amber-950/80 via-slate-950/95 to-slate-950";
    borderClass = "border-amber-400/40";
  } else if (batchRatio > 0) {
    emoji = "🧹";
    verdict = pickRandom(MILESTONE_POOR_1_2);
    advice = "পরের ৫টি প্রশ্নে আন্দাজে দাগানো বন্ধ করুন, কনসেপ্টে মনোযোগ দিন!";
    colorClass = "text-rose-300";
    bgClass = "bg-gradient-to-b from-rose-950/80 via-slate-950/95 to-slate-950";
    borderClass = "border-rose-400/40";
  } else {
    emoji = "🦆";
    verdict = pickRandom(MILESTONE_ZERO_0);
    advice = "এখনো খেলা শেষ হয়নি! পরের ৫টিতে বুক টান করে শক্ত কামব্যাক চাইই চাই! 💪";
    colorClass = "text-rose-400";
    bgClass = "bg-gradient-to-b from-red-950/90 via-slate-950/95 to-slate-950";
    borderClass = "border-red-500/60 ring-1 ring-red-500/40";
  }

  return {
    milestoneNumber,
    title: `মাইলস্টোন চেকপয়েন্ট: ${milestoneNumber}টি প্রশ্ন সম্পন্ন!`,
    badge: `প্রশ্ন ${milestoneNumber} চেকপয়েন্ট`,
    emoji,
    score,
    rank,
    correctInBatch,
    totalInBatch,
    overallCorrect: correctCount,
    overallTotal: answeredCount || milestoneNumber,
    accuracy,
    verdict,
    advice,
    colorClass,
    bgClass,
    borderClass,
  };
}

