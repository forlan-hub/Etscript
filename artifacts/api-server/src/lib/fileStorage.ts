import fs from "fs";
import path from "path";

const UPLOADS_DIR = "/tmp/etscript-files/uploads";
const OUTPUTS_DIR = "/tmp/etscript-files/outputs";

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function resolveUploadPath(fileKey: string): string {
  return path.join(UPLOADS_DIR, fileKey.replace(/^manuscripts\//, ""));
}

export function getUploadDir(userId: string, manuscriptId: number): string {
  const dir = path.join(UPLOADS_DIR, userId, String(manuscriptId));
  ensureDir(dir);
  return dir;
}

export function getOutputDir(jobId: number): string {
  const dir = path.join(OUTPUTS_DIR, String(jobId));
  ensureDir(dir);
  return dir;
}

export function getOutputPath(jobId: number, format: "pdf" | "docx"): string {
  return path.join(getOutputDir(jobId), `formatted.${format}`);
}

export function outputFileKey(jobId: number, format: "pdf" | "docx"): string {
  return `jobs/${jobId}/formatted.${format}`;
}

export function resolveOutputPath(outputKey: string): string {
  return path.join(OUTPUTS_DIR, outputKey.replace(/^jobs\//, ""));
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
