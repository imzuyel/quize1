import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Storage Abstraction Layer for PDF and static asset management.
 * Provides a clean interface for saving, retrieving, checking checksums,
 * and deleting files while preventing path traversal vulnerabilities.
 */

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const PDF_UPLOADS_DIR = path.join(PUBLIC_UPLOADS_DIR, "pdfs");

const sanitizeFilename = (filename: string): string => {
  const base = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, "_");
  return base || "document.pdf";
};

export async function ensurePdfStorageDir(): Promise<string> {
  await fs.mkdir(PDF_UPLOADS_DIR, { recursive: true });
  return PDF_UPLOADS_DIR;
}

export function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function savePdfFile(
  buffer: Buffer,
  originalFilename: string
): Promise<{ storagePath: string; checksum: string; fileSize: number }> {
  await ensurePdfStorageDir();
  const checksum = calculateChecksum(buffer);
  const ext = path.extname(originalFilename).toLowerCase() || ".pdf";
  const safeBase = sanitizeFilename(path.basename(originalFilename, ext)).slice(0, 50);
  const uniqueId = crypto.randomBytes(6).toString("hex");
  const filename = `${safeBase}_${checksum.slice(0, 8)}_${uniqueId}${ext}`;
  const relativePath = `/uploads/pdfs/${filename}`;
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await fs.writeFile(absolutePath, buffer);

  return {
    storagePath: relativePath,
    checksum,
    fileSize: buffer.length,
  };
}

export async function deletePdfFile(relativePath: string): Promise<boolean> {
  if (!relativePath || !relativePath.startsWith("/uploads/pdfs/")) {
    return false;
  }
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  try {
    await fs.unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}

export async function readPdfBuffer(relativePath: string): Promise<Buffer | null> {
  if (!relativePath || !relativePath.startsWith("/uploads/")) {
    return null;
  }
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  try {
    return await fs.readFile(absolutePath);
  } catch {
    return null;
  }
}
