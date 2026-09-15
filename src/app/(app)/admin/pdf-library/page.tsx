"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  useToast,
} from "@/components/ui";

type PdfItem = {
  id: number;
  title: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  description: string | null;
  category: string | null;
  subjectId: number | null;
  classId: number | null;
  tags: string[];
  status: "active" | "inactive" | "archived";
  pageCount: number;
  chars: number;
  pages: string[];
  outline: { title: string; pageFrom: number; pageTo: number }[];
  usageCount: number;
  createdAt: string;
};

export default function AdminPdfLibraryPage() {
  const router = useRouter();
  const { push } = useToast();

  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadCat, setUploadCat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingPdf: PdfItem;
  } | null>(null);

  // Preview modal state
  const [previewPdf, setPreviewPdf] = useState<PdfItem | null>(null);
  const [previewPage, setPreviewPage] = useState(0);

  // Edit metadata modal state
  const [editPdf, setEditPdf] = useState<PdfItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive" | "archived">("active");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal state
  const [deletePdf, setDeletePdf] = useState<PdfItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPdfs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        status: statusFilter,
        page: String(page),
        limit: "15",
      });
      const res = await fetch(`/api/pdf-library?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      push("PDF লাইব্রেরি তথ্য লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter, page, push]);

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  const handleUpload = async (force = false) => {
    if (!uploadFile) {
      push("একটি PDF ফাইল নির্বাচন করুন", "error");
      return;
    }

    setUploading(true);
    setDuplicateWarning(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDesc);
    formData.append("category", uploadCat);
    if (force) formData.append("forceUpload", "true");

    try {
      const res = await fetch("/api/pdf-library", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        push(data.error || "আপলোড ব্যর্থ হয়েছে", "error");
        return;
      }

      if (data.duplicate && data.existingPdf) {
        setDuplicateWarning({
          message: data.message,
          existingPdf: data.existingPdf,
        });
        return;
      }

      push(data.message || "PDF আপলোড সফল হয়েছে", "success");
      setUploadOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      setUploadCat("");
      fetchPdfs();
    } catch {
      push("সার্ভার ত্রুটি ঘটেছে", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editPdf) return;
    setSavingEdit(true);

    try {
      const res = await fetch("/api/pdf-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "update",
          id: editPdf.id,
          title: editTitle,
          description: editDesc,
          category: editCat,
          status: editStatus,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        push("PDF তথ্য সফলভাবে আপডেট হয়েছে", "success");
        setEditPdf(null);
        fetchPdfs();
      } else {
        push(data.error || "আপডেট ব্যর্থ হয়েছে", "error");
      }
    } catch {
      push("সার্ভার সমস্যা", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePdf) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/pdf-library?id=${deletePdf.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        push(data.message || "কাজটি সম্পন্ন হয়েছে", "success");
        setDeletePdf(null);
        fetchPdfs();
      } else {
        push(data.error || "ডিলিট ব্যর্থ হয়েছে", "error");
      }
    } catch {
      push("সার্ভার সমস্যা", "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="📚 স্থায়ী PDF লাইব্রেরি ম্যানেজমেন্ট"
        subtitle="কুইজ তৈরির জন্য আপলোডকৃত PDF বই, টেস্ট পেপার ও নোটস ম্যানেজ করুন"
        action={
          <Button
            variant="primary"
            icon="⬆️"
            onClick={() => {
              setUploadFile(null);
              setUploadTitle("");
              setUploadDesc("");
              setUploadCat("");
              setDuplicateWarning(null);
              setUploadOpen(true);
            }}
          >
            নতুন PDF আপলোড করুন
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card padded className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="🔍 টাইটেল, ফাইলের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">সব স্ট্যাটাস (All Statuses)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
            <option value="archived">আর্কাইভড (Archived)</option>
          </Select>
          <div className="flex items-center justify-end text-sm text-slate-500">
            মোট ফাইল: <strong className="ml-1 text-slate-800 dark:text-slate-200">{items.length} টি</strong>
          </div>
        </div>
      </Card>

      {/* PDF Table / Cards */}
      {loading ? (
        <Card padded className="text-center py-12">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-slate-500">PDF লাইব্রেরি লোড হচ্ছে...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card padded className="text-center py-12">
          <div className="text-4xl mb-3">📁</div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">কোনো PDF ফাইল পাওয়া যায়নি</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            নতুন PDF আপলোড করুন অথবা ফিল্টার পরিবর্তন করুন।
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setQ("");
              setStatusFilter("all");
            }}
          >
            ফিল্টার রিসেট করুন
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((pdf) => (
            <Card key={pdf.id} padded className="hover:border-indigo-300 transition duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl">📄</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {pdf.title}
                    </h3>
                    <Badge
                      variant={
                        pdf.status === "active"
                          ? "success"
                          : pdf.status === "archived"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {pdf.status === "active"
                        ? "সক্রিয়"
                        : pdf.status === "archived"
                        ? "আর্কাইভড"
                        : "নিষ্ক্রিয়"}
                    </Badge>
                    {pdf.usageCount > 0 && (
                      <Badge variant="info">
                        🔗 {pdf.usageCount} টি কুইজে ব্যবহৃত
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    মূল ফাইল: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{pdf.originalFilename}</code> • সাইজ: {formatSize(pdf.fileSize)} • পৃষ্ঠা: {pdf.pageCount} টি ({pdf.chars.toLocaleString()} অক্ষর)
                  </p>

                  {pdf.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      {pdf.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewPdf(pdf);
                      setPreviewPage(0);
                    }}
                  >
                    👁️ প্রিভিউ
                  </Button>

                  <a
                    href={pdf.storagePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                  >
                    ⬇️ ডাউনলোড
                  </a>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditPdf(pdf);
                      setEditTitle(pdf.title);
                      setEditDesc(pdf.description || "");
                      setEditCat(pdf.category || "");
                      setEditStatus(pdf.status);
                    }}
                  >
                    ✏️ এডিট
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      router.push(`/teacher/ai?tab=document&pdfId=${pdf.id}`);
                    }}
                  >
                    ⚡ কুইজ বানান
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeletePdf(pdf)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← পূর্ববর্তী
          </Button>
          <span className="text-xs font-bold px-3 text-slate-600 dark:text-slate-300">
            পৃষ্ঠা {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            পরবর্তী →
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="⬆️ নতুন PDF স্থায়ী লাইব্রেরিতে আপলোড করুন"
      >
        <div className="space-y-4">
          {duplicateWarning && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-sm">
                <span>⚠️ ডুপ্লিকেট PDF সনাক্ত হয়েছে</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {duplicateWarning.message}
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => {
                    setUploadOpen(false);
                    setPreviewPdf(duplicateWarning.existingPdf);
                  }}
                >
                  বিদ্যমান PDF ব্যবহার করুন
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  loading={uploading}
                  onClick={() => handleUpload(true)}
                >
                  জোরপূর্বক পুনরায় আপলোড করুন
                </Button>
              </div>
            </div>
          )}

          <Field label="PDF ফাইল নির্বাচন করুন" required hint="সর্বোচ্চ ৫০MB, শুধুমাত্র .pdf ফরম্যাট">
            <input
              type="file"
              accept=".pdf"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadFile(f);
                  if (!uploadTitle) setUploadTitle(f.name.replace(/\.pdf$/i, ""));
                }
              }}
            />
          </Field>

          <Field label="PDF শিরোনাম / বইয়ের নাম" required>
            <Input
              placeholder="উদাহরণ: দশম শ্রেণি গণিত ১ম অধ্যায়"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </Field>

          <Field label="ক্যাটাগরি / বিষয়">
            <Input
              placeholder="উদাহরণ: টেক্সটবুক, টেস্ট পেপার, গাইড, প্রশ্ন ব্যাংক"
              value={uploadCat}
              onChange={(e) => setUploadCat(e.target.value)}
            />
          </Field>

          <Field label="সংক্ষিপ্ত বিবরণ">
            <Textarea
              placeholder="PDF সম্পর্কিত প্রয়োজনীয় নোটস বা বিবরণ লিখুন..."
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="primary"
              loading={uploading}
              disabled={!uploadFile || !uploadTitle}
              onClick={() => handleUpload(false)}
            >
              আপলোড ও সেভ করুন
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewPdf && (
        <Modal
          open={Boolean(previewPdf)}
          onClose={() => setPreviewPdf(null)}
          title={`📖 ${previewPdf.title}`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span>মোট পৃষ্ঠা: <strong>{previewPdf.pageCount}</strong></span>
              <span>মোট অক্ষর: <strong>{previewPdf.chars.toLocaleString()}</strong></span>
              <a
                href={previewPdf.storagePath}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline font-bold"
              >
                আসল PDF খুলুন ↗
              </a>
            </div>

            {previewPdf.outline && previewPdf.outline.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">📑 অধ্যায় ও আউটলাইন:</h4>
                <div className="space-y-1">
                  {previewPdf.outline.map((item, i) => (
                    <div
                      key={i}
                      className="text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex justify-between cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                      onClick={() => setPreviewPage(Math.max(0, item.pageFrom - 1))}
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                      <span className="text-slate-500">পৃষ্ঠা {item.pageFrom} - {item.pageTo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewPdf.pages && previewPdf.pages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    📄 এক্সট্রাক্টকৃত টেক্সট প্রিভিউ (পৃষ্ঠা {previewPage + 1} / {previewPdf.pages.length}):
                  </h4>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={previewPage <= 0}
                      onClick={() => setPreviewPage((p) => p - 1)}
                    >
                      ‹ আগের পৃষ্ঠা
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={previewPage >= previewPdf.pages.length - 1}
                      onClick={() => setPreviewPage((p) => p + 1)}
                    >
                      পরের পৃষ্ঠা ›
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed border border-slate-700">
                  {previewPdf.pages[previewPage] || "(এই পৃষ্ঠায় কোনো টেক্সট পাওয়া যায়নি)"}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Metadata Modal */}
      {editPdf && (
        <Modal
          open={Boolean(editPdf)}
          onClose={() => setEditPdf(null)}
          title="✏️ PDF মেটাডেটা এডিট করুন"
        >
          <div className="space-y-4">
            <Field label="শিরোনাম">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </Field>

            <Field label="ক্যাটাগরি">
              <Input
                value={editCat}
                onChange={(e) => setEditCat(e.target.value)}
              />
            </Field>

            <Field label="স্ট্যাটাস">
              <Select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
              >
                <option value="active">সক্রিয় (Active)</option>
                <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                <option value="archived">আর্কাইভড (Archived)</option>
              </Select>
            </Field>

            <Field label="বিবরণ">
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditPdf(null)}>
                বাতিল
              </Button>
              <Button
                variant="primary"
                loading={savingEdit}
                onClick={handleSaveEdit}
              >
                পরিবর্তন সেভ করুন
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletePdf && (
        <Modal
          open={Boolean(deletePdf)}
          onClose={() => setDeletePdf(null)}
          title="⚠️ PDF মুছে ফেলার নিশ্চিতকরণ"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              আপনি কি নিশ্চিত যে <strong>&quot;{deletePdf.title}&quot;</strong> ফাইলটি মুছে ফেলতে চান?
            </p>
            {deletePdf.usageCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-800 dark:text-amber-200">
                <strong>টিপস:</strong> ফাইলটি {deletePdf.usageCount} টি কুইজে লিংক রয়েছে। তাই এটি স্থায়ীভাবে মুছে ফেলার পরিবর্তে নিরাপদে <strong>আর্কাইভ</strong> এ সরিয়ে রাখা হবে যাতে বিদ্যমান কুইজগুলো নষ্ট না হয়।
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeletePdf(null)}>
                বাতিল
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                নিশ্চিত করুন
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
