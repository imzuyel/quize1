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

  const handleReorder = async (id: number, newOrder: number) => {
    try {
      const updated = sections.map((s) => (s.id === id ? { ...s, displayOrder: newOrder } : s));
      setSections(updated);

      await fetch("/api/admin/frontend-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "reorder",
          items: updated.map((s) => ({ id: s.id, displayOrder: s.displayOrder })),
        }),
      });
    } catch {
      push("অর্ডার সেভ করা যায়নি", "error");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="🎛️ ফ্রন্টএন্ড সেকশন ও কনটেন্ট ব্যাকএন্ড কন্ট্রোল"
        subtitle="কোড পরিবর্তন ছাড়াই হোমপেজ ও ড্যাশবোর্ডের সেকশনসমূহ অন/অফ, এডিট ও সাজান"
      />

      {loading ? (
        <Card padded className="text-center py-12">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-slate-500">সেকশন সেটিংস লোড হচ্ছে...</p>
        </Card>
      ) : sections.length === 0 ? (
        <Card padded className="text-center py-12">
          <p className="text-slate-500">কোনো সেকশন পাওয়া যায়নি।</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sections.map((sec) => (
            <Card key={sec.id} padded className="hover:border-indigo-300 transition duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {sec.subtitle}
                    </p>
                  )}

                  {sec.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      {sec.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
                    <span>ক্রম:</span>
                    <input
                      type="number"
                      className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-xs"
                      value={sec.displayOrder}
                      onChange={(e) => handleReorder(sec.id, Number(e.target.value))}
                    />
                  </div>

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
            </Card>
          ))}
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
