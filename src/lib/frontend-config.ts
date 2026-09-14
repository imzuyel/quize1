export type HeroSettings = {
  titleLine1: string;
  titleGradientText: string;
  color1: string;
  color2: string;
  color3: string;
  subtitle: string;
  subText: string;
  badge1: string;
  badge2: string;
  badge3: string;
  tickerText: string;
  joinTitle: string;
  joinSubtitle: string;
  showTicker: boolean;
  showHero: boolean;
  showGuide: boolean;
  showGameFeatures: boolean;
  showLivePreview: boolean;
  showBentoGrid: boolean;
  showRoles: boolean;
  showCredits: boolean;
};

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  titleLine1: "লাইভ ক্লাসরুমে বন্ধুদের সাথে",
  titleGradientText: "রোমাঞ্চকর কুইজ ও গেমিং লড়াই ⚡",
  color1: "#2dd4bf", // Vibrant Cyan
  color2: "#ec4899", // Electric Pink
  color3: "#f59e0b", // Gold/Amber
  subtitle: "প্রজেক্টরে বড় পর্দায় প্রশ্ন আর মোবাইলের রঙিন বাটনে দ্রুততম উত্তরের মেধার প্রতিযোগিতা!",
  subText: "কোনো অ্যাপ বা পাসওয়ার্ডের ঝামেলা নেই · যেকোনো ডিভাইসে ৬ সংখ্যার পিন দিয়ে তাৎক্ষণিক অংশগ্রহণ",
  badge1: "লাইভ ক্লাসরুম কুইজ ও মেধার লড়াই",
  badge2: "⚡ ৫০ms আল্ট্রা-ফাস্ট সিঙ্ক",
  badge3: "🏆 লাইভ পোডিয়াম ও রয়্যাল ট্রফি",
  tickerText: "⚡ ক্লাসে লাইভ কুইজ চলছে? PIN দিয়ে সরাসরি Join করুন · কোনো অ্যাপ বা পাসওয়ার্ডের প্রয়োজন নেই!",
  joinTitle: "গেম পিন দিয়ে সরাসরি খেলুন",
  joinSubtitle: "বোর্ডে বা প্রজেক্টরে প্রদর্শিত ৬ সংখ্যার গেম পিন লিখে সাথে সাথে ক্লাসের লাইভ গেমিং ব্যাটেলে প্রবেশ করুন!",
  showTicker: true,
  showHero: true,
  showGuide: true,
  showGameFeatures: true,
  showLivePreview: true,
  showBentoGrid: true,
  showRoles: true,
  showCredits: true,
};

export function mergeHeroSettings(raw?: unknown): HeroSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_HERO_SETTINGS;
  const obj = raw as Record<string, unknown>;
  return {
    titleLine1: typeof obj.titleLine1 === "string" && obj.titleLine1.trim() ? obj.titleLine1 : DEFAULT_HERO_SETTINGS.titleLine1,
    titleGradientText: typeof obj.titleGradientText === "string" && obj.titleGradientText.trim() ? obj.titleGradientText : DEFAULT_HERO_SETTINGS.titleGradientText,
    color1: typeof obj.color1 === "string" && obj.color1.trim() ? obj.color1 : DEFAULT_HERO_SETTINGS.color1,
    color2: typeof obj.color2 === "string" && obj.color2.trim() ? obj.color2 : DEFAULT_HERO_SETTINGS.color2,
    color3: typeof obj.color3 === "string" && obj.color3.trim() ? obj.color3 : DEFAULT_HERO_SETTINGS.color3,
    subtitle: typeof obj.subtitle === "string" && obj.subtitle.trim() ? obj.subtitle : DEFAULT_HERO_SETTINGS.subtitle,
    subText: typeof obj.subText === "string" && obj.subText.trim() ? obj.subText : DEFAULT_HERO_SETTINGS.subText,
    badge1: typeof obj.badge1 === "string" && obj.badge1.trim() ? obj.badge1 : DEFAULT_HERO_SETTINGS.badge1,
    badge2: typeof obj.badge2 === "string" && obj.badge2.trim() ? obj.badge2 : DEFAULT_HERO_SETTINGS.badge2,
    badge3: typeof obj.badge3 === "string" && obj.badge3.trim() ? obj.badge3 : DEFAULT_HERO_SETTINGS.badge3,
    tickerText: typeof obj.tickerText === "string" && obj.tickerText.trim() ? obj.tickerText : DEFAULT_HERO_SETTINGS.tickerText,
    joinTitle: typeof obj.joinTitle === "string" && obj.joinTitle.trim() ? obj.joinTitle : DEFAULT_HERO_SETTINGS.joinTitle,
    joinSubtitle: typeof obj.joinSubtitle === "string" && obj.joinSubtitle.trim() ? obj.joinSubtitle : DEFAULT_HERO_SETTINGS.joinSubtitle,
    showTicker: typeof obj.showTicker === "boolean" ? obj.showTicker : DEFAULT_HERO_SETTINGS.showTicker,
    showHero: typeof obj.showHero === "boolean" ? obj.showHero : DEFAULT_HERO_SETTINGS.showHero,
    showGuide: typeof obj.showGuide === "boolean" ? obj.showGuide : DEFAULT_HERO_SETTINGS.showGuide,
    showGameFeatures: typeof obj.showGameFeatures === "boolean" ? obj.showGameFeatures : DEFAULT_HERO_SETTINGS.showGameFeatures,
    showLivePreview: typeof obj.showLivePreview === "boolean" ? obj.showLivePreview : DEFAULT_HERO_SETTINGS.showLivePreview,
    showBentoGrid: typeof obj.showBentoGrid === "boolean" ? obj.showBentoGrid : DEFAULT_HERO_SETTINGS.showBentoGrid,
    showRoles: typeof obj.showRoles === "boolean" ? obj.showRoles : DEFAULT_HERO_SETTINGS.showRoles,
    showCredits: typeof obj.showCredits === "boolean" ? obj.showCredits : DEFAULT_HERO_SETTINGS.showCredits,
  };
}
