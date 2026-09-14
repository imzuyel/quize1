"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FEATURES, FEATURE_LABELS, mergeFeatures, type FeatureFlags } from "@/lib/prefs";
import { DEFAULT_SEO, mergeSeo, type SeoSettings } from "@/lib/seo-config";
import { DEFAULT_HERO_SETTINGS, mergeHeroSettings, type HeroSettings } from "@/lib/frontend-config";
import { DEFAULT_ANIMATION_SETTINGS, mergeAnimationSettings, type AnimationSettings } from "@/lib/animation-config";
import { useAnimationConfig } from "@/components/animation-provider";
import { Progress } from "@/components/ui";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionTitle,
  Select,
  Tabs,
  Textarea,
  Toggle,
  useToast,
} from "@/components/ui";

type Branding = {
  schoolName: string;
  schoolNameEn: string;
  logo: string;
  primary: string;
  accent: string;
  footer: string;
  contact: string;
  email: string;
  developerName: string;
  developerTitle: string;
  developerInstitute: string;
  copyright: string;
  lockBranding: boolean;
};

type Achievement = { id: number; name: string; nameBn: string | null; description: string | null; icon: string; xp: number; active: boolean };
type SocialSettings = { facebook: string; youtube: string; instagram: string; linkedin: string; github: string; twitter: string; website: string };
type InstitutionSettings = { name: string; nameEn: string; code: string; eiin: string; address: string; phone: string; email: string; website: string; principal: string };
type AppearanceSettings = { theme: "system" | "light" | "dark"; primary: string; accent: string; font: string; bnFont: string; radius: "soft" | "round" | "pill"; animation: "low" | "medium" | "high" };
type QuizDefaults = { questionTime: number; points: number; leaderboard: boolean; sound: boolean; music: boolean; randomQuestions: boolean; randomOptions: boolean; lateJoin: boolean; maxParticipants: number; autoNext: boolean };
type StudentDefaults = { nicknameRequired: boolean; autoNickname: boolean; avatar: boolean; allowRejoin: boolean; showNames: boolean };

const DEFAULT_BRANDING: Branding = {
  schoolName: "পঞ্চগড় সরকারি কারিগরি স্কুল ও কলেজ",
  schoolNameEn: "Panchagarh Government Technical School and College",
  logo: "",
  primary: "#0f7b6c",
  accent: "#f0b429",
  footer: "© পঞ্চগড় সরকারি কারিগরি স্কুল ও কলেজ",
  contact: "পঞ্চগড় সদর, পঞ্চগড় — ৫০০০",
  email: "info@pgtsc.edu.bd",
  developerName: "মোঃ জুয়েল রানা",
  developerTitle: "জুনিয়র ইন্সট্রাক্টর (আইটি সাপোর্ট এন্ড আইওটি বেসিকস)",
  developerInstitute: "পঞ্চগড় সরকারি টেকনিক্যাল স্কুল এন্ড কলেজ",
  copyright: "© পিজিটিএসসি কুইজ অ্যারেনা — কারিগরি শিক্ষা অধিদপ্তর",
  lockBranding: true,
};

export default function AdminSettings() {
  const { push } = useToast();
  const [tab, setTab] = useState("branding");
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [draft, setDraft] = useState({ name: "", nameBn: "", description: "", icon: "🏆", xp: 50 });
  const [announcement, setAnnouncement] = useState({ title: "", body: "", audience: "students" });
  const [registration, setRegistration] = useState({ autoApproveStudents: false });
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);
  const [social, setSocial] = useState<SocialSettings>({ facebook: "", youtube: "", instagram: "", linkedin: "", github: "", twitter: "", website: "" });
  const [institution, setInstitution] = useState<InstitutionSettings>({ name: DEFAULT_BRANDING.schoolName, nameEn: DEFAULT_BRANDING.schoolNameEn, code: "", eiin: "", address: DEFAULT_BRANDING.contact, phone: "", email: DEFAULT_BRANDING.email, website: "", principal: "" });
  const [appearance, setAppearance] = useState<AppearanceSettings>({ theme: "system", primary: DEFAULT_BRANDING.primary, accent: DEFAULT_BRANDING.accent, font: "Inter", bnFont: "Noto Sans Bengali", radius: "round", animation: "medium" });
  const [quizDefaults, setQuizDefaults] = useState<QuizDefaults>({ questionTime: 30, points: 1000, leaderboard: true, sound: true, music: true, randomQuestions: false, randomOptions: false, lateJoin: true, maxParticipants: 200, autoNext: false });
  const [studentDefaults, setStudentDefaults] = useState<StudentDefaults>({ nicknameRequired: false, autoNickname: true, avatar: true, allowRejoin: true, showNames: true });
  const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [animations, setAnimations] = useState<AnimationSettings>(DEFAULT_ANIMATION_SETTINGS);
  const { updateSettings: updateLiveAnimationSettings } = useAnimationConfig();

  const load = useCallback(async () => {
    const s = await fetch("/api/admin?scope=settings");
    if (s.ok) {
      const json = await s.json();
      if (json.branding) setBranding({ ...DEFAULT_BRANDING, ...json.branding });
      if (json.social) setSocial({ facebook: "", youtube: "", instagram: "", linkedin: "", github: "", twitter: "", website: "", ...json.social });
      if (json.institution) setInstitution({ name: DEFAULT_BRANDING.schoolName, nameEn: DEFAULT_BRANDING.schoolNameEn, code: "", eiin: "", address: DEFAULT_BRANDING.contact, phone: "", email: DEFAULT_BRANDING.email, website: "", principal: "", ...json.institution });
      if (json.appearance) setAppearance({ theme: "system", primary: DEFAULT_BRANDING.primary, accent: DEFAULT_BRANDING.accent, font: "Inter", bnFont: "Noto Sans Bengali", radius: "round", animation: "medium", ...json.appearance });
      if (json.quizDefaults) setQuizDefaults({ questionTime: 30, points: 1000, leaderboard: true, sound: true, music: true, randomQuestions: false, randomOptions: false, lateJoin: true, maxParticipants: 200, autoNext: false, ...json.quizDefaults });
      if (json.studentDefaults) setStudentDefaults({ nicknameRequired: false, autoNickname: true, avatar: true, allowRejoin: true, showNames: true, ...json.studentDefaults });
      if (json.hero) setHero(mergeHeroSettings(json.hero));
      if (json.animations) setAnimations(mergeAnimationSettings(json.animations));
      setFeatures(mergeFeatures(json.features));
      setSeo(mergeSeo(json.seo, json.branding));
    }
    const a = await fetch("/api/admin?scope=achievements");
    if (a.ok) setAchievements(await a.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      push(data.error ?? "ব্যর্থ", "error");
      return null;
    }
    load();
    return data;
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="🎨 ব্র্যান্ডিং, অর্জন ও ঘোষণা" subtitle="স্কুলের পরিচয় ও গেমিফিকেশন কনফিগার করুন" />
      <Tabs
        tabs={[
          { id: "branding", label: "ব্র্যান্ডিং", icon: "🎨" },
          { id: "hero", label: "হোমপেজ ও হিরো", icon: "🚀" },
          { id: "animation", label: "এনিমেশন", icon: "⚡" },
          { id: "institution", label: "প্রতিষ্ঠান", icon: "🏫" },
          { id: "social", label: "সোশ্যাল", icon: "🌐" },
          { id: "appearance", label: "অ্যাপিয়ারেন্স", icon: "✨" },
          { id: "quiz", label: "কুইজ", icon: "🎮" },
          { id: "student", label: "স্টুডেন্ট", icon: "👨‍🎓" },
          { id: "achievements", label: "অর্জন", icon: "🏅" },
          { id: "seo", label: "SEO", icon: "🔎" },
          { id: "features", label: "ফিচার", icon: "🧩" },
          { id: "access", label: "নিবন্ধন নীতি", icon: "🔐" },
          { id: "announce", label: "ঘোষণা", icon: "📢" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "animation" ? (
        <div className="space-y-4">
          <Card accent="teal">
            <SectionTitle
              title="⚡ প্রিমিয়াম এনিমেশন কন্ট্রোল সিস্টেম (Centralized Animation Settings)"
              subtitle="কার্ড গ্লো বর্ডার, বাটন ইন্টারঅ্যাকশন, স্ক্রোল রিভিল এবং প্রোগ্রেস বারের গতি ও স্টাইল কন্ট্রোল করুন"
            />

            {/* 1. Card Glow Border System */}
            <div className="rounded-2xl border border-teal-500/20 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-teal-300">✨ ১. কার্ড গ্লো বর্ডার এনিমেশন (Card Glow Border)</h3>
                  <p className="text-xs text-slate-400">প্রতিটি কার্ডের চারপাশে স্মুথ মুভিং লাইট ও লাইট বর্ডার ট্রাভেল এনিমেশন</p>
                </div>
                <div className="w-36">
                  <Toggle
                    checked={animations.cardBorderEnabled}
                    onChange={(v) => {
                      const next = { ...animations, cardBorderEnabled: v };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                    label={animations.cardBorderEnabled ? "চালু ✅" : "বন্ধ ❌"}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="গ্লো ইন্টেনসিটি (Glow Intensity)">
                  <Select
                    value={animations.cardGlowIntensity}
                    onChange={(e) => {
                      const next = { ...animations, cardGlowIntensity: e.target.value as any };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  >
                    <option value="subtle">সূক্ষ্ম (Subtle Glow - 20%)</option>
                    <option value="medium">মাঝারি (Medium Glow - 45% - প্রস্তাবিত)</option>
                    <option value="strong">তীব্র (Strong Premium Glow - 75%)</option>
                  </Select>
                </Field>

                <Field label="এনিমেশন গতি (Border Movement Speed)">
                  <Select
                    value={animations.cardBorderSpeed}
                    onChange={(e) => {
                      const next = { ...animations, cardBorderSpeed: e.target.value as any };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  >
                    <option value="slow">ধীরগতি (Slow - 10 Seconds)</option>
                    <option value="normal">স্বাভাবিক (Normal - 6 Seconds - প্রস্তাবিত)</option>
                    <option value="fast">দ্রুত (Fast - 3 Seconds)</option>
                  </Select>
                </Field>
              </div>

              {/* Card Preview Grid */}
              <div className="mt-4 rounded-xl bg-[#060a1e] p-4">
                <p className="text-xs font-bold text-slate-400 mb-3">🎨 কার্ড অ্যাকসент গ্লো প্রিভিউ (Live Accent Colors Preview):</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card accent="teal" className="p-3">
                    <p className="text-xs font-bold text-teal-300">Teal/Cyan Accent</p>
                    <p className="text-[11px] text-slate-400">Cyan Glow Border</p>
                  </Card>
                  <Card accent="purple" className="p-3">
                    <p className="text-xs font-bold text-purple-300">Purple/Violet Accent</p>
                    <p className="text-[11px] text-slate-400">Purple Glow Border</p>
                  </Card>
                  <Card accent="gold" className="p-3">
                    <p className="text-xs font-bold text-amber-300">Amber/Gold Accent</p>
                    <p className="text-[11px] text-slate-400">Warm Gold Glow Border</p>
                  </Card>
                </div>
              </div>
            </div>

            {/* 2. Button Animation System */}
            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-indigo-300">🔘 ২. বাটন ইন্টারঅ্যাকশন এনিমেশন (Button Interaction)</h3>
                  <p className="text-xs text-slate-400">হোভার প্রেসম্যাপ, লাইট শাইন বিম এবং প্রেস/ট্যাপ রেসপন্সিভ ফিডব্যাক</p>
                </div>
                <div className="w-36">
                  <Toggle
                    checked={animations.buttonAnimationEnabled}
                    onChange={(v) => {
                      const next = { ...animations, buttonAnimationEnabled: v };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                    label={animations.buttonAnimationEnabled ? "চালু ✅" : "বন্ধ ❌"}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="বাটন গ্লো লেভেল (Glow Level)">
                  <Select
                    value={animations.buttonGlowIntensity}
                    onChange={(e) => {
                      const next = { ...animations, buttonGlowIntensity: e.target.value as any };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  >
                    <option value="subtle">সূক্ষ্ম (Subtle)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="strong">উজ্জ্বল (Strong)</option>
                  </Select>
                </Field>

                <div className="pt-6">
                  <Toggle
                    checked={animations.buttonHoverEffect}
                    onChange={(v) => {
                      const next = { ...animations, buttonHoverEffect: v };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                    label="হোভার বিম শাইন এফেক্ট (Hover Shine Beam)"
                  />
                </div>
              </div>

              {/* Button Preview */}
              <div className="mt-2 rounded-xl bg-[#060a1e] p-4 flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold text-slate-400 w-full mb-1">🔘 লাইভ বাটন প্রিভিউ (Button Animation Live Preview):</p>
                <Button variant="primary" size="sm">Primary Button</Button>
                <Button variant="secondary" size="sm">Secondary Button</Button>
                <Button variant="gold" size="sm">Gold Button</Button>
                <Button variant="outline" size="sm">Outline Button</Button>
              </div>
            </div>

            {/* 3. Scroll / AOS Reveal System */}
            <div className="mt-4 rounded-2xl border border-sky-500/20 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-sky-300">📜 ৩. পেজ স্ক্রোল রিভিল এনিমেশন (Scroll Reveal / AOS)</h3>
                  <p className="text-xs text-slate-400">পেজে স্ক্রোল করার সময় কনটেন্ট ও কার্ডসমূহের মসৃণ আত্মপ্রকাশ</p>
                </div>
                <div className="w-36">
                  <Toggle
                    checked={animations.scrollAnimationEnabled}
                    onChange={(v) => {
                      const next = { ...animations, scrollAnimationEnabled: v };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                    label={animations.scrollAnimationEnabled ? "চালু ✅" : "বন্ধ ❌"}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="রিভিল এনিমেশন টাইপ (Default Animation Type)">
                  <Select
                    value={animations.scrollAnimationType}
                    onChange={(e) => {
                      const next = { ...animations, scrollAnimationType: e.target.value as any };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  >
                    <option value="fade-up">Fade Up (নিচ থেকে উপরে)</option>
                    <option value="fade-down">Fade Down (উপর থেকে নিচে)</option>
                    <option value="fade-left">Fade Left (ডান থেকে বামে)</option>
                    <option value="fade-right">Fade Right (বাম থেকে ডানে)</option>
                    <option value="zoom-in">Zoom In (জুম ইন)</option>
                    <option value="slide-up">Slide Up (মসৃণ স্লাইড)</option>
                  </Select>
                </Field>

                <Field label="এনিমেশন ডিউরেশন (Duration in ms)">
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    step={50}
                    value={animations.scrollAnimationDuration}
                    onChange={(e) => {
                      const next = { ...animations, scrollAnimationDuration: Number(e.target.value) || 500 };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  />
                </Field>

                <Field label="গ্রিড কার্ডস সিকোয়েন্স ডিলে (Stagger Delay ms)">
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    step={10}
                    value={animations.scrollAnimationStagger}
                    onChange={(e) => {
                      const next = { ...animations, scrollAnimationStagger: Number(e.target.value) || 80 };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  />
                </Field>
              </div>
            </div>

            {/* 4. Progress Bar Animation System */}
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-emerald-300">📊 ৪. প্রোগ্রেস বার এনিমেশন (Animated Progress Bar)</h3>
                  <p className="text-xs text-slate-400">পার্সেন্টেজ ফিল, শাইনিং স্ট্রিম ওভারলে এবং স্মুথ ফিলিং এনিমেশন</p>
                </div>
                <div className="w-36">
                  <Toggle
                    checked={animations.progressAnimationEnabled}
                    onChange={(v) => {
                      const next = { ...animations, progressAnimationEnabled: v };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                    label={animations.progressAnimationEnabled ? "চালু ✅" : "বন্ধ ❌"}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="প্রোগ্রেস ফিল ডিউরেশন (Fill Duration ms)">
                  <Input
                    type="number"
                    min={200}
                    max={3000}
                    step={100}
                    value={animations.progressAnimationDuration}
                    onChange={(e) => {
                      const next = { ...animations, progressAnimationDuration: Number(e.target.value) || 800 };
                      setAnimations(next);
                      updateLiveAnimationSettings(next);
                    }}
                  />
                </Field>
              </div>

              {/* Progress Bar Live Preview */}
              <div className="mt-2 rounded-xl bg-[#060a1e] p-4 space-y-3">
                <p className="text-xs font-bold text-slate-400">📊 লাইভ প্রোগ্রেস বার প্রিভিউ (Progress Bar Live Preview):</p>
                <Progress value={75} tone="teal" showLabel label="কুইজ প্রোগ্রেস (Teal Tone)" />
                <Progress value={90} tone="gold" showLabel label="লেভেল এক্সপি (Gold Tone)" />
                <Progress value={60} tone="purple" showLabel label="স্কিল পারফরম্যান্স (Purple Tone)" />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  const d = await post({ op: "saveSettings", key: "animations", value: animations });
                  if (d) push("প্রিমিয়াম এনিমেশন কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে ✅", "success");
                }}
              >
                💾 এনিমেশন সেটিংস সংরক্ষণ করুন
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setAnimations(DEFAULT_ANIMATION_SETTINGS);
                  updateLiveAnimationSettings(DEFAULT_ANIMATION_SETTINGS);
                }}
              >
                ডিফল্ট সেটিংস রিসেট করুন
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              title="🚀 ফ্রন্টএন্ড হিরো ও টেক্সট কনট্রোল"
              subtitle="হোমপেজের হিরো হেডিং, রঙ ও সকল বার্তা ব্যাকএন্ড থেকে সরাসরি নিয়ন্ত্রণ করুন"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="হিরো হেডিং (লাইন ১)"><Input value={hero.titleLine1} onChange={(e) => setHero({ ...hero, titleLine1: e.target.value })} placeholder="যেমন: লাইভ ক্লাসরুমে বন্ধুদের সাথে" /></Field>
              <Field label="হাইলাইটেড টেক্সট (২/৩ রঙের গ্র্যাডিয়েন্ট)"><Input value={hero.titleGradientText} onChange={(e) => setHero({ ...hero, titleGradientText: e.target.value })} placeholder="যেমন: রোমাঞ্চকর কুইজ ও গেমিং লড়াই ⚡" /></Field>
            </div>

            <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-slate-900/40 p-4 space-y-3">
              <p className="text-xs font-bold text-indigo-300">🎨 হেডিং এর ২-৩ রঙের ব্লেড (3 Color Scheme Gradient)</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="রঙ ১ (বাম)"><div className="flex items-center gap-2"><input type="color" value={hero.color1} onChange={(e) => setHero({ ...hero, color1: e.target.value })} className="h-10 w-12 rounded-lg border" /><Input value={hero.color1} onChange={(e) => setHero({ ...hero, color1: e.target.value })} /></div></Field>
                <Field label="রঙ ২ (মাঝখানের)"><div className="flex items-center gap-2"><input type="color" value={hero.color2} onChange={(e) => setHero({ ...hero, color2: e.target.value })} className="h-10 w-12 rounded-lg border" /><Input value={hero.color2} onChange={(e) => setHero({ ...hero, color2: e.target.value })} /></div></Field>
                <Field label="রঙ ৩ (ডান)"><div className="flex items-center gap-2"><input type="color" value={hero.color3} onChange={(e) => setHero({ ...hero, color3: e.target.value })} className="h-10 w-12 rounded-lg border" /><Input value={hero.color3} onChange={(e) => setHero({ ...hero, color3: e.target.value })} /></div></Field>
              </div>
              <div className="rounded-xl bg-[#060a1e] p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">কালার স্কিম প্রিভিউ:</p>
                <span
                  className="text-2xl font-black"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${hero.color1}, ${hero.color2}, ${hero.color3})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {hero.titleGradientText || "কালার ব্লেন্ড টেক্সট প্রিভিউ"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="সাবটাইটেল (প্রধান বর্ণনা)"><Textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className="min-h-[70px]" /></Field>
              <Field label="দ্বিতীয় টেক্সট (ছোট বর্ণনা)"><Textarea value={hero.subText} onChange={(e) => setHero({ ...hero, subText: e.target.value })} className="min-h-[70px]" /></Field>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="ব্যাজ Pill ১"><Input value={hero.badge1} onChange={(e) => setHero({ ...hero, badge1: e.target.value })} /></Field>
              <Field label="ব্যাজ Pill ২"><Input value={hero.badge2} onChange={(e) => setHero({ ...hero, badge2: e.target.value })} /></Field>
              <Field label="ব্যাজ Pill ৩"><Input value={hero.badge3} onChange={(e) => setHero({ ...hero, badge3: e.target.value })} /></Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="সরাসরি গেম পিন ইনপুট - শিরোনাম"><Input value={hero.joinTitle} onChange={(e) => setHero({ ...hero, joinTitle: e.target.value })} /></Field>
              <Field label="সরাসরি গেম পিন ইনপুট - উপশিরোনাম"><Input value={hero.joinSubtitle} onChange={(e) => setHero({ ...hero, joinSubtitle: e.target.value })} /></Field>
            </div>

            <div className="mt-4">
              <Field label="টপ টিঙ্কার নোটিশ বার টেক্সট"><Input value={hero.tickerText} onChange={(e) => setHero({ ...hero, tickerText: e.target.value })} /></Field>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="👁️ হোমপেজের সেকশন দৃশ্যমানতা (Show / Hide)"
              subtitle="হোমপেজের যেকোনো সেকশন প্রয়োজন অনুযায়ী চালু বা বন্ধ রাখুন"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle checked={hero.showTicker} onChange={(v) => setHero({ ...hero, showTicker: v })} label="⚡ টপ টিঙ্কার নোটিশ বার" />
              <Toggle checked={hero.showHero} onChange={(v) => setHero({ ...hero, showHero: v })} label="🚀 মেইন হিরো সেকশন" />
              <Toggle checked={hero.showGuide} onChange={(v) => setHero({ ...hero, showGuide: v })} label="📖 ধাপে ধাপে গাইড সেকশন" />
              <Toggle checked={hero.showGameFeatures} onChange={(v) => setHero({ ...hero, showGameFeatures: v })} label="🎮 গেম মোড ও ফিচার কার্ডস" />
              <Toggle checked={hero.showLivePreview} onChange={(v) => setHero({ ...hero, showLivePreview: v })} label="📡 লাইভ প্রিভিউ ট্যাব" />
              <Toggle checked={hero.showBentoGrid} onChange={(v) => setHero({ ...hero, showBentoGrid: v })} label="🧩 কুইজ স্টুডিও বেনটো গ্রিড" />
              <Toggle checked={hero.showRoles} onChange={(v) => setHero({ ...hero, showRoles: v })} label="👥 ভূমিকা নির্বাচন গ্রিড" />
              <Toggle checked={hero.showCredits} onChange={(v) => setHero({ ...hero, showCredits: v })} label="🏛️ কারিগরি পরিচিতি ফুটার সেকশন" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={async () => {
                  const d = await post({ op: "saveSettings", key: "hero", value: hero });
                  if (d) push("হোমপেজ ও হিরো সেটিংস সফলভাবে সংরক্ষিত ✅", "success");
                }}
              >
                💾 সংরক্ষণ করুন
              </Button>
              <Button variant="ghost" onClick={() => setHero(DEFAULT_HERO_SETTINGS)}>
                ডিফল্ট সেটিংস রিসেট করুন
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "branding" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="স্কুলের নাম (বাংলা)"><Input value={branding.schoolName} onChange={(e) => setBranding({ ...branding, schoolName: e.target.value })} /></Field>
              <Field label="School Name (English)"><Input value={branding.schoolNameEn} onChange={(e) => setBranding({ ...branding, schoolNameEn: e.target.value })} /></Field>
              <Field label="লোগো URL"><Input value={branding.logo} onChange={(e) => setBranding({ ...branding, logo: e.target.value })} /></Field>
              <Field label="লোগো Upload" hint="ছোট PNG/JPG/SVG ব্যবহার করুন"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="block w-full text-sm" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 700 * 1024) { push("লোগো 700KB-এর মধ্যে রাখুন", "error"); return; } const reader = new FileReader(); reader.onload = () => setBranding({ ...branding, logo: String(reader.result ?? "") }); reader.readAsDataURL(file); }} /></Field>
              <Field label="যোগাযোগ"><Input value={branding.contact} onChange={(e) => setBranding({ ...branding, contact: e.target.value })} /></Field>
              <Field label="ইমেইল"><Input value={branding.email} onChange={(e) => setBranding({ ...branding, email: e.target.value })} /></Field>
              <Field label="প্রাইমারি রঙ">
                <input type="color" value={branding.primary} onChange={(e) => setBranding({ ...branding, primary: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--pg-line)]" />
              </Field>
              <Field label="অ্যাকসেন্ট রঙ">
                <input type="color" value={branding.accent} onChange={(e) => setBranding({ ...branding, accent: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--pg-line)]" />
              </Field>
            </div>
            <Field label="ফুটার"><Textarea value={branding.footer} onChange={(e) => setBranding({ ...branding, footer: e.target.value })} /></Field>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="ডেভেলপারের নাম"><Input value={branding.developerName} onChange={(e) => setBranding({ ...branding, developerName: e.target.value })} /></Field>
              <Field label="ডেভেলপারের পদবি"><Input value={branding.developerTitle} onChange={(e) => setBranding({ ...branding, developerTitle: e.target.value })} /></Field>
              <Field label="ডেভেলপারের প্রতিষ্ঠান"><Input value={branding.developerInstitute} onChange={(e) => setBranding({ ...branding, developerInstitute: e.target.value })} /></Field>
              <Field label="কপিরাইট"><Input value={branding.copyright} onChange={(e) => setBranding({ ...branding, copyright: e.target.value })} /></Field>
            </div>
            <div className="mt-3">
              <Toggle
                checked={branding.lockBranding}
                onChange={(v) => setBranding({ ...branding, lockBranding: v })}
                label="স্কুল টেমপ্লেটে অফিসিয়াল ব্র্যান্ডিং লক করুন"
              />
            </div>
            <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "branding", value: branding }); if (d) push("সংরক্ষিত ✅", "success"); }}>
              💾 সংরক্ষণ করুন
            </Button>
          </Card>
          <Card>
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">প্রিভিউ</p>
            <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${branding.primary}, ${branding.accent})` }}>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 font-black">PG</div>
              <p className="mt-3 font-extrabold">{branding.schoolName}</p>
              <p className="text-xs opacity-80">{branding.schoolNameEn}</p>
              <p className="mt-3 text-[11px] opacity-70">{branding.contact}</p>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{branding.footer}</p>
          </Card>
        </div>
      ) : null}

      {tab === "institution" ? (
        <Card>
          <SectionTitle title="🏫 প্রতিষ্ঠান তথ্য" subtitle="প্রতিষ্ঠানের পরিচয় এক জায়গা থেকে নিয়ন্ত্রণ করুন" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="প্রতিষ্ঠানের নাম (বাংলা)"><Input value={institution.name} onChange={(e) => setInstitution({ ...institution, name: e.target.value })} /></Field>
            <Field label="Institution Name (English)"><Input value={institution.nameEn} onChange={(e) => setInstitution({ ...institution, nameEn: e.target.value })} /></Field>
            <Field label="Institution Code"><Input value={institution.code} onChange={(e) => setInstitution({ ...institution, code: e.target.value })} /></Field>
            <Field label="EIIN"><Input value={institution.eiin} onChange={(e) => setInstitution({ ...institution, eiin: e.target.value })} /></Field>
            <Field label="ঠিকানা"><Input value={institution.address} onChange={(e) => setInstitution({ ...institution, address: e.target.value })} /></Field>
            <Field label="ফোন"><Input value={institution.phone} onChange={(e) => setInstitution({ ...institution, phone: e.target.value })} /></Field>
            <Field label="ইমেইল"><Input value={institution.email} onChange={(e) => setInstitution({ ...institution, email: e.target.value })} /></Field>
            <Field label="ওয়েবসাইট"><Input value={institution.website} onChange={(e) => setInstitution({ ...institution, website: e.target.value })} /></Field>
            <Field label="প্রধানের নাম"><Input value={institution.principal} onChange={(e) => setInstitution({ ...institution, principal: e.target.value })} /></Field>
          </div>
          <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "institution", value: institution }); if (d) push("প্রতিষ্ঠান তথ্য সংরক্ষিত ✅", "success"); }}>💾 সংরক্ষণ করুন</Button>
        </Card>
      ) : null}

      {tab === "social" ? (
        <Card>
          <SectionTitle title="🌐 Social Accounts" subtitle="Footer, About ও profile card-এ দেখানোর লিংক" />
          <div className="grid gap-3 sm:grid-cols-2">
            {(["facebook", "youtube", "instagram", "linkedin", "github", "twitter", "website"] as const).map((key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}><Input value={social[key]} onChange={(e) => setSocial({ ...social, [key]: e.target.value })} placeholder="https://..." /></Field>
            ))}
          </div>
          <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "social", value: social }); if (d) push("Social links সংরক্ষিত ✅", "success"); }}>💾 সংরক্ষণ করুন</Button>
        </Card>
      ) : null}

      {tab === "appearance" ? (
        <Card>
          <SectionTitle title="✨ Appearance" subtitle="পুরো platform-এর visual defaults" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Theme"><Select value={appearance.theme} onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as AppearanceSettings["theme"] })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></Select></Field>
            <Field label="Animation"><Select value={appearance.animation} onChange={(e) => setAppearance({ ...appearance, animation: e.target.value as AppearanceSettings["animation"] })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Select></Field>
            <Field label="Primary Color"><input type="color" value={appearance.primary} onChange={(e) => setAppearance({ ...appearance, primary: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--pg-line)]" /></Field>
            <Field label="Accent Color"><input type="color" value={appearance.accent} onChange={(e) => setAppearance({ ...appearance, accent: e.target.value })} className="h-11 w-full rounded-xl border border-[var(--pg-line)]" /></Field>
            <Field label="English Font"><Input value={appearance.font} onChange={(e) => setAppearance({ ...appearance, font: e.target.value })} /></Field>
            <Field label="বাংলা Font"><Input value={appearance.bnFont} onChange={(e) => setAppearance({ ...appearance, bnFont: e.target.value })} /></Field>
            <Field label="Corner Style"><Select value={appearance.radius} onChange={(e) => setAppearance({ ...appearance, radius: e.target.value as AppearanceSettings["radius"] })}><option value="soft">Soft</option><option value="round">Round</option><option value="pill">Pill</option></Select></Field>
          </div>
          <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "appearance", value: appearance }); if (d) push("Appearance সংরক্ষিত ✅", "success"); }}>💾 সংরক্ষণ করুন</Button>
        </Card>
      ) : null}

      {tab === "quiz" ? (
        <Card>
          <SectionTitle title="🎮 Quiz Defaults" subtitle="Teacher নতুন quiz তৈরি করলে এগুলো default হবে" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Default Time (seconds)"><Input type="number" value={quizDefaults.questionTime} onChange={(e) => setQuizDefaults({ ...quizDefaults, questionTime: Math.max(5, Number(e.target.value)) })} /></Field>
            <Field label="Default Points"><Input type="number" value={quizDefaults.points} onChange={(e) => setQuizDefaults({ ...quizDefaults, points: Math.max(0, Number(e.target.value)) })} /></Field>
            <Field label="Maximum Participants"><Input type="number" value={quizDefaults.maxParticipants} onChange={(e) => setQuizDefaults({ ...quizDefaults, maxParticipants: Math.max(1, Number(e.target.value)) })} /></Field>
            <Field label="Live behavior"><Toggle checked={quizDefaults.autoNext} onChange={(v) => setQuizDefaults({ ...quizDefaults, autoNext: v })} label="সময় শেষ হলে auto-next" /></Field>
          </div>
          <div className="mt-4 space-y-2">
            <Toggle checked={quizDefaults.leaderboard} onChange={(v) => setQuizDefaults({ ...quizDefaults, leaderboard: v })} label="🏆 Leaderboard চালু" />
            <Toggle checked={quizDefaults.sound} onChange={(v) => setQuizDefaults({ ...quizDefaults, sound: v })} label="🔊 Sound effects চালু" />
            <Toggle checked={quizDefaults.music} onChange={(v) => setQuizDefaults({ ...quizDefaults, music: v })} label="🎵 Background music চালু" />
            <Toggle checked={quizDefaults.randomQuestions} onChange={(v) => setQuizDefaults({ ...quizDefaults, randomQuestions: v })} label="🔀 Questions randomize" />
            <Toggle checked={quizDefaults.randomOptions} onChange={(v) => setQuizDefaults({ ...quizDefaults, randomOptions: v })} label="🔀 Options randomize" />
            <Toggle checked={quizDefaults.lateJoin} onChange={(v) => setQuizDefaults({ ...quizDefaults, lateJoin: v })} label="➕ Late join অনুমতি" />
          </div>
          <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "quizDefaults", value: quizDefaults }); if (d) push("Quiz defaults সংরক্ষিত ✅", "success"); }}>💾 সংরক্ষণ করুন</Button>
        </Card>
      ) : null}

      {tab === "student" ? (
        <Card>
          <SectionTitle title="👨‍🎓 Student Settings" subtitle="Join experience-এর global defaults" />
          <div className="space-y-2">
            <Toggle checked={studentDefaults.nicknameRequired} onChange={(v) => setStudentDefaults({ ...studentDefaults, nicknameRequired: v })} label="Nickname বাধ্যতামূলক" />
            <Toggle checked={studentDefaults.autoNickname} onChange={(v) => setStudentDefaults({ ...studentDefaults, autoNickname: v })} label="Nickname না দিলে automatic nickname" />
            <Toggle checked={studentDefaults.avatar} onChange={(v) => setStudentDefaults({ ...studentDefaults, avatar: v })} label="Student avatar ব্যবহার করতে পারবে" />
            <Toggle checked={studentDefaults.allowRejoin} onChange={(v) => setStudentDefaults({ ...studentDefaults, allowRejoin: v })} label="Connection হারালে rejoin করতে পারবে" />
            <Toggle checked={studentDefaults.showNames} onChange={(v) => setStudentDefaults({ ...studentDefaults, showNames: v })} label="Leaderboard-এ নাম দেখাবে" />
          </div>
          <Button className="mt-4" onClick={async () => { const d = await post({ op: "saveSettings", key: "studentDefaults", value: studentDefaults }); if (d) push("Student settings সংরক্ষিত ✅", "success"); }}>💾 সংরক্ষণ করুন</Button>
        </Card>
      ) : null}

      {tab === "achievements" ? (
        <div className="space-y-4">
          <Card>
            <div className="grid gap-2 sm:grid-cols-5">
              <Input placeholder="নাম" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <Input placeholder="বাংলা নাম" value={draft.nameBn} onChange={(e) => setDraft({ ...draft, nameBn: e.target.value })} />
              <Input placeholder="আইকন" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
              <Input type="number" placeholder="XP" value={draft.xp} onChange={(e) => setDraft({ ...draft, xp: Number(e.target.value) })} />
              <Button onClick={async () => { const d = await post({ op: "saveAchievement", ...draft }); if (d) push("যোগ হয়েছে", "success"); }}>+ যোগ</Button>
            </div>
            <Input className="mt-2" placeholder="বিবরণ" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </Card>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-2xl">{a.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{a.nameBn || a.name}</p>
                    <p className="text-xs text-slate-500">{a.description}</p>
                    <div className="mt-1.5 flex gap-1.5">
                      <Badge tone="gold">+{a.xp} XP</Badge>
                      <Badge tone={a.active ? "green" : "slate"}>{a.active ? "সক্রিয়" : "বন্ধ"}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => post({ op: "saveAchievement", id: a.id, name: a.name, nameBn: a.nameBn, description: a.description, icon: a.icon, xp: a.xp, active: !a.active })}>
                    {a.active ? "বন্ধ করুন" : "চালু করুন"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => post({ op: "deleteAchievement", id: a.id })}>মুছুন</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              title="🔎 সার্চ ইঞ্জিন অপটিমাইজেশন"
              subtitle="গুগলে আপনার প্রতিষ্ঠান কীভাবে দেখাবে তা নির্ধারণ করুন"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="সাইটের নাম (বাংলা)">
                <Input value={seo.siteName} onChange={(e) => setSeo({ ...seo, siteName: e.target.value })} />
              </Field>
              <Field label="Site name (English)">
                <Input value={seo.siteNameEn} onChange={(e) => setSeo({ ...seo, siteNameEn: e.target.value })} />
              </Field>
            </div>
            <Field label="ট্যাগলাইন" hint="শেয়ার কার্ডে বড় করে দেখানো হবে">
              <Input value={seo.tagline} onChange={(e) => setSeo({ ...seo, tagline: e.target.value })} />
            </Field>
            <Field
              label="বিবরণ (মেটা ডেসক্রিপশন)"
              hint={`গুগলে শিরোনামের নিচে দেখানো হয় · ${seo.description.length}/160 অক্ষর`}
            >
              <Textarea
                value={seo.description}
                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                className="min-h-[70px]"
              />
            </Field>
            <Field label="Description (English)">
              <Textarea
                value={seo.descriptionEn}
                onChange={(e) => setSeo({ ...seo, descriptionEn: e.target.value })}
                className="min-h-[60px]"
              />
            </Field>
            <Field label="কীওয়ার্ড" hint="কমা দিয়ে আলাদা করুন">
              <Textarea
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="min-h-[60px] text-xs"
              />
            </Field>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-bold">🌐 ঠিকানা ও লোগো</p>
            <Field
              label="সাইটের পূর্ণ URL"
              hint="খালি রাখলে সার্ভার নিজে শনাক্ত করবে · sitemap ও শেয়ার লিংকে ব্যবহৃত হয়"
            >
              <Input
                value={seo.siteUrl}
                onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                placeholder="https://quiz.pgtsc.edu.bd"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="লোগো URL" hint="JSON-LD ও শেয়ার কার্ডে">
                <Input value={seo.logo} onChange={(e) => setSeo({ ...seo, logo: e.target.value })} placeholder="https://…/logo.png" />
              </Field>
              <Field label="থিম কালার" hint="মোবাইল ব্রাউজারের অ্যাড্রেস বার">
                <input
                  type="color"
                  value={seo.themeColor}
                  onChange={(e) => setSeo({ ...seo, themeColor: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[var(--pg-line)]"
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ঠিকানা">
                <Input
                  value={seo.org.address ?? ""}
                  onChange={(e) => setSeo({ ...seo, org: { ...seo.org, address: e.target.value } })}
                />
              </Field>
              <Field label="ইমেইল">
                <Input
                  value={seo.org.email ?? ""}
                  onChange={(e) => setSeo({ ...seo, org: { ...seo.org, email: e.target.value } })}
                />
              </Field>
              <Field label="ফোন">
                <Input
                  value={seo.org.phone ?? ""}
                  onChange={(e) => setSeo({ ...seo, org: { ...seo.org, phone: e.target.value } })}
                />
              </Field>
              <Field label="X / Twitter হ্যান্ডেল">
                <Input
                  value={seo.twitter}
                  onChange={(e) => setSeo({ ...seo, twitter: e.target.value })}
                  placeholder="@pgtsc"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-bold">✅ সার্চ কনসোল যাচাইকরণ</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Google verification code">
                <Input
                  value={seo.verification.google ?? ""}
                  onChange={(e) => setSeo({ ...seo, verification: { ...seo.verification, google: e.target.value } })}
                  placeholder="google-site-verification মান"
                />
              </Field>
              <Field label="Bing verification code">
                <Input
                  value={seo.verification.bing ?? ""}
                  onChange={(e) => setSeo({ ...seo, verification: { ...seo.verification, bing: e.target.value } })}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Toggle
                checked={seo.noIndex}
                onChange={(v) => setSeo({ ...seo, noIndex: v })}
                label="🚫 সার্চ ইঞ্জিন থেকে সম্পূর্ণ লুকান (লঞ্চের আগে)"
              />
              <p className="mt-1 text-xs text-slate-500">
                চালু করলে robots.txt সব ক্রলার ব্লক করবে এবং sitemap খালি হবে।
              </p>
            </div>
          </Card>

          <Card className="bg-slate-50">
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">গুগলে যেভাবে দেখাবে</p>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-emerald-700">{seo.siteUrl || "https://your-domain"} › </p>
              <p className="mt-0.5 text-lg leading-tight text-blue-700">
                {seo.siteName} | {seo.siteNameEn}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {seo.description.slice(0, 160)}
                {seo.description.length > 160 ? "…" : ""}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">sitemap.xml দেখুন ↗</Button>
              </a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">robots.txt দেখুন ↗</Button>
              </a>
              <a href="/opengraph-image" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline">শেয়ার কার্ড দেখুন ↗</Button>
              </a>
            </div>
          </Card>

          <Button
            onClick={async () => {
              await post({ op: "saveSettings", key: "seo", value: seo });
              push("SEO সেটিংস সংরক্ষিত ✅", "success");
            }}
          >
            💾 SEO সংরক্ষণ করুন
          </Button>
        </div>
      ) : null}

      {tab === "features" ? (
        <Card>
          <SectionTitle
            title="প্ল্যাটফর্ম ফিচার"
            subtitle="যে ফিচারগুলো আপনার প্রতিষ্ঠানে দরকার নেই সেগুলো বন্ধ রাখুন"
          />
          <div className="space-y-2">
            {FEATURE_LABELS.map((f) => (
              <div key={f.key}>
                <Toggle
                  checked={features[f.key]}
                  onChange={(v) => setFeatures({ ...features, [f.key]: v })}
                  label={`${f.icon} ${f.label}`}
                />
                <p className="mt-0.5 pl-1 text-[11px] text-slate-400">{f.hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                await post({ op: "saveSettings", key: "features", value: features });
                push("সংরক্ষিত ✅ — সাথে সাথে কার্যকর", "success");
              }}
            >
              💾 সংরক্ষণ করুন
            </Button>
            <Button variant="ghost" onClick={() => setFeatures({ ...DEFAULT_FEATURES })}>
              সব চালু করুন
            </Button>
          </div>
          <p className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500">
            ⚠️ কোনো ফিচার বন্ধ করলে সংশ্লিষ্ট API-ও বন্ধ হয়ে যায় — শুধু মেনু লুকানো নয়।
          </p>
        </Card>
      ) : null}

      {tab === "access" ? (
        <Card>
          <SectionTitle
            title="নতুন অ্যাকাউন্ট অনুমোদন"
            subtitle="কারা নিজে নিবন্ধন করলে সরাসরি ঢুকতে পারবে তা ঠিক করুন"
          />
          <div className="rounded-xl border border-[var(--pg-line)] p-3">
            <p className="text-sm font-bold">👩‍🏫 শিক্ষক</p>
            <p className="mt-0.5 text-xs text-slate-500">
              সর্বদা অ্যাডমিন অনুমোদন প্রয়োজন — নিরাপত্তার কারণে এটি বন্ধ করা যায় না।
            </p>
            <Badge tone="teal" className="mt-2">অনুমোদন আবশ্যক</Badge>
          </div>
          <div className="mt-3">
            <Toggle
              checked={registration.autoApproveStudents}
              onChange={(v) => setRegistration({ autoApproveStudents: v })}
              label="🎒 শিক্ষার্থী ও অভিভাবক অনুমোদন ছাড়াই ঢুকতে পারবে"
            />
            <p className="mt-1 text-xs text-slate-500">
              বন্ধ থাকলে (সুপারিশকৃত) সব নতুন অ্যাকাউন্ট অনুমোদনের অপেক্ষায় থাকবে।
            </p>
          </div>
          <Button
            className="mt-4"
            onClick={async () => {
              await post({ op: "saveSettings", key: "registration", value: registration });
              push("সংরক্ষিত ✅", "success");
            }}
          >
            💾 সংরক্ষণ করুন
          </Button>
        </Card>
      ) : null}

      {tab === "announce" ? (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="শিরোনাম"><Input value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} /></Field>
            <Field label="প্রাপক">
              <Select value={announcement.audience} onChange={(e) => setAnnouncement({ ...announcement, audience: e.target.value })}>
                <option value="students">শিক্ষার্থী</option>
                <option value="teachers">শিক্ষক</option>
                <option value="parents">অভিভাবক</option>
                <option value="all">সবাই</option>
              </Select>
            </Field>
          </div>
          <Field label="বার্তা"><Textarea value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} /></Field>
          <Button
            className="mt-3"
            onClick={async () => {
              const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ op: "broadcast", ...announcement }),
              });
              const data = await res.json();
              if (res.ok) push(`${data.sent} জনকে পাঠানো হয়েছে`, "success");
              else push(data.error ?? "ব্যর্থ", "error");
            }}
          >
            📢 ঘোষণা পাঠান
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
