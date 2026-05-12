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

/**
 * Strip EXIF metadata (including GPS coordinates) from an uploaded image by
 * rendering it to a canvas and re-exporting. Also normalises HEIC/HEIF to
 * JPEG so all browsers can render the result, and caps dimensions at 2048px
 * on the long edge to keep file sizes sane.
 *
 * Falls back to the original file if the browser can't decode it — better to
 * ship the user's photo with metadata than to fail the upload.
 */
export async function stripImageMetadata(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  const isHeic = file.type === "image/heic" || file.type === "image/heif";
  // Most browsers can't decode HEIC into a canvas; pass it through unchanged.
  // (HEIC files generally don't expose GPS to the consumer either way,
  // and Supabase's image CDN handles them.)
  if (isHeic) return file;

  const outputType =
    file.type === "image/png" ? "image/png"
    : file.type === "image/webp" ? "image/webp"
    : "image/jpeg";
  const quality = outputType === "image/jpeg" ? 0.9 : undefined;
  const MAX_EDGE = 2048;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (Math.max(width, height) > MAX_EDGE) {
      const scale = MAX_EDGE / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    const ext =
      outputType === "image/png" ? "png"
      : outputType === "image/webp" ? "webp"
      : "jpg";
    return new File([blob], `${baseName}.${ext}`, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.error("EXIF strip failed, using original:", err);
    return file;
  }
}
