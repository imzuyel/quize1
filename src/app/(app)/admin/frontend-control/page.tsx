"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Modal,
  SectionTitle,
  Select,
  Textarea,
  Toggle,
  useToast,
} from "@/components/ui";

type FrontendSection = {
  id: number;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  icon: string | null;
  image: string | null;
  link: string | null;
  buttonText: string | null;
  buttonVisible: boolean;
  isActive: boolean;
  displayOrder: number;
  visibility: "everyone" | "authenticated" | "roles";
  allowedRoles: string[];
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
};

const SECTION_KEY_LABELS: Record<string, string> = {
  hero_banner: "⚡ মূল হিরো ব্যানার (Main Hero Banner)",
  quick_actions: "🚀 প্রধান সেবা কার্ডসমূহ (Quick Action Cards)",
  notice_banner: "📢 গুরুত্বপূর্ণ বিজ্ঞপ্তি ব্যানার (Notice Banner)",
  featured_quizzes: "🏆 ফিচার্ড কুইজ হাইলাইট (Featured Quizzes)",
  useful_links: "🔗 প্রয়োজনীয় লিংকসমূহ (Useful Links)",
  footer_info: "📌 ফুটার বিশেষ তথ্যাবলী (Footer Information)",
};

export default function AdminFrontendControlPage() {
  const { push } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState<FrontendSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editSection, setEditSection] = useState<FrontendSection | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editBtnText, setEditBtnText] = useState("");
  const [editBtnVisible, setEditBtnVisible] = useState(true);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editOrder, setEditOrder] = useState(0);
  const [editVisibility, setEditVisibility] = useState<"everyone" | "authenticated" | "roles">("everyone");
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Preview Modal
  const [previewSec, setPreviewSec] = useState<FrontendSection | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/frontend-sections?all=1");
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch {
      push("ফ্রন্টএন্ড সেকশন তথ্য লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/frontend-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "toggle",
          id,
          isActive: !currentActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        push(data.message || "স্ট্যাটাস পরিবর্তন হয়েছে", "success");
        fetchSections();
      } else {
        push(data.error || "ত্রুটি ঘটেছে", "error");
      }
    } catch {
      push("সার্ভার সমস্যা", "error");
    }
  };

  const handleOpenEdit = (sec: FrontendSection) => {
    setEditSection(sec);
    setEditTitle(sec.title || "");
    setEditSubtitle(sec.subtitle || "");
    setEditDesc(sec.description || "");
    setEditContent(sec.content || "");
    setEditIcon(sec.icon || "");
    setEditImage(sec.image || "");
    setEditLink(sec.link || "");
    setEditBtnText(sec.buttonText || "");
    setEditBtnVisible(sec.buttonVisible);
    setEditIsActive(sec.isActive);
    setEditOrder(sec.displayOrder);
    setEditVisibility(sec.visibility || "everyone");
    setEditRoles(sec.allowedRoles || []);
  };

  const handleSaveEdit = async () => {
    if (!editSection) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/frontend-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "update",
          id: editSection.id,
          sectionKey: editSection.sectionKey,
          title: editTitle,
          subtitle: editSubtitle,
          description: editDesc,
          content: editContent,
          icon: editIcon,
          image: editImage,
          link: editLink,
          buttonText: editBtnText,
          buttonVisible: editBtnVisible,
          isActive: editIsActive,
          displayOrder: editOrder,
          visibility: editVisibility,
          allowedRoles: editRoles,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        push(data.message || "সেকশন সফলভাবে আপডেট হয়েছে", "success");
        setEditSection(null);
        fetchSections();
      } else {
        push(data.error || "আপডেট ব্যর্থ হয়েছে", "error");
      }
    } catch {
      push("সার্ভার ত্রুটি", "error");
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop reorder state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const saveReorderedList = async (updated: FrontendSection[]) => {
    const reindexed = updated.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setSections(reindexed);
    try {
      const res = await fetch("/api/admin/frontend-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "reorder",
          items: reindexed.map((s) => ({ id: s.id, displayOrder: s.displayOrder })),
        }),
      });
      if (res.ok) {
        push("সেকশন ক্রম সফলভাবে আপডেট করা হয়েছে", "success");
      } else {
        push("অর্ডার সেভ করা যায়নি", "error");
      }
    } catch {
      push("অর্ডার সেভ করা যায়নি", "error");
    }
  };

  const filteredSections = sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (sec.title || SECTION_KEY_LABELS[sec.sectionKey] || "").toLowerCase();
    const subtitle = (sec.subtitle || "").toLowerCase();
    const key = (sec.sectionKey || "").toLowerCase();
    const desc = (sec.description || "").toLowerCase();
    return title.includes(q) || subtitle.includes(q) || key.includes(q) || desc.includes(q);
  });

  const handleFilteredMove = (fromFilteredIdx: number, toFilteredIdx: number) => {
    const fromSec = filteredSections[fromFilteredIdx];
    const toSec = filteredSections[toFilteredIdx];
    if (!fromSec || !toSec) return;

    const realFromIdx = sections.findIndex((s) => s.id === fromSec.id);
    const realToIdx = sections.findIndex((s) => s.id === toSec.id);

    if (realFromIdx === -1 || realToIdx === -1) return;

    const copy = [...sections];
    const [moved] = copy.splice(realFromIdx, 1);
    copy.splice(realToIdx, 0, moved);
    saveReorderedList(copy);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    handleFilteredMove(draggedIdx, dropIndex);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="🎛️ ফ্রন্টএন্ড সেকশন ও কনটেন্ট ব্যাকএন্ড কন্ট্রোল"
        subtitle="মাউস দিয়ে ড্র্যাগ-এন্ড-ড্রপ (Drag & Drop) করে ড্র্যাগ হ্যান্ডেল ধরে হোমপেজের সেকশন ক্রমানুসারে সাজান"
      />

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-2xl border border-[var(--pg-line)] shadow-sm">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <Input
            placeholder="সেকশনের শিরোনাম, সাবটাইটেল বা কী (Key) দিয়ে ফিল্টার করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 py-2 w-full text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              title="ফিল্টার ক্লিয়ার করুন"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-500 whitespace-nowrap px-1">
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ফলাফল: {filteredSections.length} / {sections.length}
          </span>
        </div>
      </div>

      {loading ? (
        <Card padded className="text-center py-12">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-slate-500">সেকশন সেটিংস লোড হচ্ছে...</p>
        </Card>
      ) : sections.length === 0 ? (
        <Card padded className="text-center py-12">
          <p className="text-slate-500">কোনো সেকশন পাওয়া যায়নি।</p>
        </Card>
      ) : filteredSections.length === 0 ? (
        <Card padded className="text-center py-12 space-y-2">
          <div className="text-3xl">🔎</div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            &quot;{searchQuery}&quot; দিয়ে কোনো সেকশন খুঁজে পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-500">
            অনুগ্রহ করে অন্য শিরোনাম বা কী লিখে সার্চ করুন অথবা ফিল্টার ক্লিয়ার করুন।
          </p>
          <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="mt-2">
            ফিল্টার রিমুভ করুন
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredSections.map((sec, index) => {
            const isDragging = draggedIdx === index;
            const isOver = dragOverIdx === index;

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDrop={(e) => handleDrop(e, index)}
                className={`group relative transition-all duration-200 rounded-2xl border ${
                  isDragging
                    ? "opacity-40 scale-[0.99] border-dashed border-teal-500 bg-teal-500/5"
                    : isOver
                    ? "border-2 border-teal-400 bg-teal-500/10 shadow-lg scale-[1.01]"
                    : "border-[var(--pg-line)] bg-white dark:bg-slate-900/90 hover:border-teal-400/60 shadow-sm"
                }`}
              >
                {/* Active Drop-Zone Target Overlay Indicator */}
                {isOver && draggedIdx !== null && draggedIdx !== index && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-teal-500/20 backdrop-blur-[2px] border-2 border-dashed border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.4)] pointer-events-none animate-pulse">
                    <div className="flex items-center gap-2.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-teal-300 shadow-2xl border border-teal-400/60">
                      <span className="text-lg animate-bounce">🎯</span>
                      <span>এখানে ড্রপ করুন — অবস্থান #{index + 1}-এ স্থাপন হবে</span>
                    </div>
                  </div>
                )}

                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-3 flex-1">
                    {/* Drag Handle & Reorder controls */}
                    <div className="flex flex-col items-center justify-center gap-1 select-none">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                        title="মাউস চেপে ধরে উপরে-নিচে ড্র্যাগ করে সাজান"
                      >
                        <span className="text-base font-black leading-none">⣿</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleFilteredMove(index, index - 1)}
                          className="p-1 text-[10px] rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 font-black text-slate-600 dark:text-slate-300"
                          title="উপরে সরান"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredSections.length - 1}
                          onClick={() => handleFilteredMove(index, index + 1)}
                          className="p-1 text-[10px] rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 font-black text-slate-600 dark:text-slate-300"
                          title="নিচে সরান"
                        >
                          ▼
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-teal-500/10 px-1.5 text-xs font-black text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          #{index + 1}
                        </span>
                        <span className="text-xl">{sec.icon || "📌"}</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {sec.title || SECTION_KEY_LABELS[sec.sectionKey] || sec.sectionKey}
                        </h3>
                        <Badge variant={sec.isActive ? "success" : "danger"}>
                          {sec.isActive ? "দৃশ্যমান (Shown)" : "লুকায়িত (Hidden)"}
                        </Badge>
                        <Badge variant="info">
                          কী: <code className="text-xs">{sec.sectionKey}</code>
                        </Badge>
                      </div>

                      {sec.subtitle && (
                        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                          {sec.subtitle}
                        </p>
                      )}

                      {sec.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                          {sec.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {sec.isActive ? "অন" : "অফ"}
                      </span>
                      <Toggle
                        label=""
                        checked={sec.isActive}
                        onChange={() => handleToggleActive(sec.id, sec.isActive)}
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewSec(sec)}
                    >
                      👁️ প্রিভিউ
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenEdit(sec)}
                    >
                      ✏️ কনটেন্ট এডিট
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editSection && (
        <Modal
          open={Boolean(editSection)}
          onClose={() => setEditSection(null)}
          title={`✏️ সেকশন এডিটর (${editSection.sectionKey})`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                সেকশন প্রদর্শন স্ট্যাটাস:
              </span>
              <Toggle
                checked={editIsActive}
                onChange={() => setEditIsActive(!editIsActive)}
              />
            </div>

            <Field label="আইকন (Emoji বা Text)">
              <Input
                placeholder="উদাহরণ: ⚡, 📢, 🏆"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
              />
            </Field>

            <Field label="মূল শিরোনাম (Main Title)">
              <Input
                placeholder="সেকশনের প্রধান হেডার লিখুন"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Field>

            <Field label="সাবটাইটেল / আইব্রো">
              <Input
                placeholder="ছোট সাবহেডিং"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
              />
            </Field>

            <Field label="সংক্ষিপ্ত বিবরণ (Description)">
              <Textarea
                placeholder="সেকশন সম্পর্কিত প্যারাগ্রাফ লিখুন"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="বাটন টেক্সট (Button Label)">
                <Input
                  placeholder="উদাহরণ: কুইজে অংশ নিন"
                  value={editBtnText}
                  onChange={(e) => setEditBtnText(e.target.value)}
                />
              </Field>

              <Field label="বাটন লিংক (Target URL)">
                <Input
                  placeholder="উদাহরণ: /quizzes বা https://..."
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                />
              </Field>
            </div>

            <Field label="দৃশ্যমানতা (Visibility Scope)">
              <Select
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value as any)}
              >
                <option value="everyone">সবাই দেখতে পাবে (Everyone)</option>
                <option value="authenticated">শুধুমাত্র লগইনকৃত ব্যবহারকারী (Authenticated)</option>
                <option value="roles">নির্দিষ্ট রোলসমূহের জন্য (Role Restricted)</option>
              </Select>
            </Field>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setEditSection(null)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleSaveEdit}
              >
                পরিবর্তন সেভ করুন
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewSec && (
        <Modal
          open={Boolean(previewSec)}
          onClose={() => setPreviewSec(null)}
          title={`👁️ লাইভ প্রিভিউ - ${previewSec.title || previewSec.sectionKey}`}
        >
          <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4 shadow-xl border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-white/10 rounded-xl">{previewSec.icon || "📌"}</span>
              <div>
                {previewSec.subtitle && (
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                    {previewSec.subtitle}
                  </span>
                )}
                <h3 className="text-xl font-black text-white">{previewSec.title || "শিরোনাম দেয়া হয়নি"}</h3>
              </div>
            </div>

            {previewSec.description && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {previewSec.description}
              </p>
            )}

            {previewSec.buttonText && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg">
                  {previewSec.buttonText} →
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
