/**
 * Quiz Plate Theme Engine & Style Definitions
 * Supports manual teacher selection or automatic per-question plate rotation by the server.
 */

export type QuizPlateId =
  | "auto"
  | "neon_sunset"
  | "royal_starlight"
  | "cyber_synthwave"
  | "clay_morphism"
  | "golden_royale"
  | "emerald_matrix"
  | "cosmic_aurora"
  | "candy_pop";

export interface QuizPlateDefinition {
  id: QuizPlateId;
  name: string;
  nameEn: string;
  icon: string;
  tag: string;
  description: string;
  previewBg: string;
  borderClass: string;
  glowColor: string;
}

export const QUIZ_PLATES: QuizPlateDefinition[] = [
  {
    id: "auto",
    name: "অটোমেটিক (প্রতি প্রশ্নে আলাদা প্লেট)",
    nameEn: "Dynamic Auto Rotation",
    icon: "🎲",
    tag: "স্মার্ট মোড",
    description: "প্রতিটি প্রশ্নের জন্য সার্ভার স্বয়ংক্রিয়ভাবে বিভিন্ন আকর্ষণীয় প্লেট রোটেশন করবে",
    previewBg: "from-teal-500 via-rose-500 to-amber-500",
    borderClass: "border-teal-400/50",
    glowColor: "rgba(45, 212, 191, 0.4)",
  },
  {
    id: "neon_sunset",
    name: "নিয়ন সানসেট ও প্রশ্নচিহ্ন",
    nameEn: "Neon Sunset & Question Mark",
    icon: "🌅",
    tag: "নিয়ন ভাইব",
    description: "অরেঞ্জ-ম্যাজেন্টা গ্রেডিয়েন্ট হেডার, গ্রিন-সায়ান নিয়ন পিল অপশন এবং স্টাইলাইজড প্রশ্নচিহ্ন",
    previewBg: "from-amber-500 via-orange-500 to-rose-600",
    borderClass: "border-rose-500/60",
    glowColor: "rgba(244, 63, 94, 0.45)",
  },
  {
    id: "royal_starlight",
    name: "রয়্যাল পার্পল ও গোল্ডেন স্টার",
    nameEn: "Royal Purple & Gold Stars",
    icon: "⭐",
    tag: "৩ডি স্টার",
    description: "ডিপ ভায়োলেট ব্যাকড্রপ, মসৃণ ৩ডি হোয়াইট ক্যাপসুল এবং চকচকে সোনালী স্টার",
    previewBg: "from-purple-600 via-violet-700 to-indigo-900",
    borderClass: "border-purple-400/60",
    glowColor: "rgba(168, 85, 247, 0.45)",
  },
  {
    id: "cyber_synthwave",
    name: "সাইবার সিন্থওয়েভ ডুয়াল নিয়ন",
    nameEn: "Cyber Synthwave Dual Glow",
    icon: "⚡",
    tag: "সিন্থওয়েভ",
    description: "ডার্ক টেক গ্রিড, ইলেকট্রিক সায়ান ও পিঙ্ক ডুয়াল নিয়ন বর্ডার এবং হাই-টেক লুক",
    previewBg: "from-cyan-400 via-blue-600 to-fuchsia-500",
    borderClass: "border-cyan-400/60",
    glowColor: "rgba(34, 211, 238, 0.45)",
  },
  {
    id: "clay_morphism",
    name: "থ্রি-ডি ক্লেমরফিজম সফট ট্রে",
    nameEn: "3D Claymorphism Soft Plate",
    icon: "🧊",
    tag: "ক্লেমরফিজম",
    description: "সফট কনসেন্ট্রিক রিং ব্যাকগ্রাউন্ড, ম্যাজেন্টা ট্যাব এবং ৩ডি এক্সট্রুডেড ক্লে পিল",
    previewBg: "from-slate-100 via-rose-50 to-amber-50",
    borderClass: "border-slate-300",
    glowColor: "rgba(244, 63, 94, 0.35)",
  },
  {
    id: "golden_royale",
    name: "গোল্ডেন রয়্যাল চ্যাম্পিয়ন",
    nameEn: "Golden Royal Champion",
    icon: "👑",
    tag: "গোল্ড ট্রফি",
    description: "অক্সিডিয়ান ব্ল্যাক, ২৪কে গোল্ড মেটালিক রিম এবং রয়্যাল ক্রাউন শিমার",
    previewBg: "from-amber-400 via-yellow-500 to-amber-700",
    borderClass: "border-amber-400/70",
    glowColor: "rgba(251, 191, 36, 0.5)",
  },
  {
    id: "emerald_matrix",
    name: "এমারেল্ড সাইবার ম্যাট্রিক্স",
    nameEn: "Emerald Cyber Matrix",
    icon: "🟢",
    tag: "গেমার HUD",
    description: "ট্যাকটিক্যাল ব্ল্যাক ও লুমিনাস এমারেল্ড সাইবার সার্কিট ও গেমার HUD",
    previewBg: "from-emerald-400 via-teal-600 to-slate-900",
    borderClass: "border-emerald-400/60",
    glowColor: "rgba(16, 185, 129, 0.45)",
  },
  {
    id: "cosmic_aurora",
    name: "কসমিক অরোরা গ্যালাক্সি",
    nameEn: "Cosmic Aurora Borealis",
    icon: "🌌",
    tag: "অরোরা",
    description: "ডিপ স্পেস নেবুলা গ্লো, ফ্রস্টেড গ্লাস পিল এবং অরোরা বোরেয়ালিস হ্যালো",
    previewBg: "from-teal-400 via-indigo-600 to-violet-900",
    borderClass: "border-teal-400/60",
    glowColor: "rgba(45, 212, 191, 0.45)",
  },
  {
    id: "candy_pop",
    name: "ক্যান্ডি পপ ভাইব্রেন্ট থ্রি-ডি",
    nameEn: "Candy Pop 3D Vibrant",
    icon: "🍬",
    tag: "ফান পপ",
    description: "প্রাণবন্ত বাবলগাম প্যালেট, বাউন্সি থ্রি-ডি বর্ডার এবং হাই-কনট্রাস্ট ফান ডিজাইন",
    previewBg: "from-pink-400 via-purple-400 to-amber-300",
    borderClass: "border-pink-400/60",
    glowColor: "rgba(244, 114, 182, 0.45)",
  },
];

export const CONCRETE_PLATES: QuizPlateId[] = [
  "neon_sunset",
  "royal_starlight",
  "cyber_synthwave",
  "clay_morphism",
  "golden_royale",
  "emerald_matrix",
  "cosmic_aurora",
  "candy_pop",
];

/**
 * Resolves the plate style to use for a question.
 * If the teacher explicitly chose a plate (not 'auto'), that plate is used.
 * If 'auto' or undefined, the plate rotates per question index!
 */
export function resolveQuizPlate(plateStyle?: string | null, questionIndex = 0): QuizPlateId {
  if (plateStyle && plateStyle !== "auto" && CONCRETE_PLATES.includes(plateStyle as QuizPlateId)) {
    return plateStyle as QuizPlateId;
  }
  const idx = Math.abs(questionIndex) % CONCRETE_PLATES.length;
  return CONCRETE_PLATES[idx];
}
