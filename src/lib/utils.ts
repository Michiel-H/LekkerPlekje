/**
 * Escape characters that have special meaning in PostgREST `or()` filters and
 * SQL LIKE patterns. Use whenever user input is embedded in `.or(...)`,
 * `.ilike(...)`, or `.like(...)` queries.
 */
export function sanitizeLike(input: string): string {
  return input.replace(/[%_,()*\\]/g, "\\$&");
}

/**
 * Allowed image MIME types for user uploads.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate an uploaded image file. Returns null if OK, or a Dutch error string.
 */
export function validateImage(
  file: File,
  maxSize: number = MAX_PHOTO_SIZE
): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return "Alleen JPG, PNG, WebP of HEIC zijn toegestaan.";
  }
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    return `Bestand is te groot — max ${mb} MB.`;
  }
  if (file.size === 0) {
    return "Bestand is leeg.";
  }
  return null;
}

/**
 * Pick a safe extension from the MIME type rather than the user-supplied
 * filename. Defaults to "jpg" if unknown.
 */
export function safeImageExt(file: File): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[file.type] ?? "jpg";
}
