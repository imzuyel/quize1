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
