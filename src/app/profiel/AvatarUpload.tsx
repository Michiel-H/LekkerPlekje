"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_IMAGE_ACCEPT,
  validateImage,
  safeImageExt,
  MAX_AVATAR_SIZE,
  stripImageMetadata,
} from "@/lib/utils";
import { reportError } from "@/lib/reportError";

interface Props {
  userId: string;
  initialUrl: string | null;
  fallbackInitial: string;
}

export default function AvatarUpload({ userId, initialUrl, fallbackInitial }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file, MAX_AVATAR_SIZE);
    if (validationError) {
      alert(validationError);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      // Strip EXIF (incl. GPS) before upload.
      const sanitized = await stripImageMetadata(file);
      // Extension derived from MIME, not from the user-supplied filename.
      // Unique filename (timestamp + random) means no conflict, so no upsert —
      // upsert turns the upload into an INSERT...ON CONFLICT that the storage
      // RLS rejects with a 400 (the plain insert the locations bucket uses works).
      const ext = safeImageExt(sanitized);
      const path = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, sanitized, { contentType: sanitized.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const { error: updErr } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl } as never)
        .eq("id", userId);
      if (updErr) throw updErr;
      setUrl(publicUrl);
      router.refresh();
    } catch (err) {
      reportError(err, { where: "AvatarUpload", userId });
      alert("Foto uploaden mislukt. Probeer een andere afbeelding.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={() => inputRef.current?.click()}
        className="w-20 h-20 rounded-full bg-spritz/10 flex items-center justify-center text-3xl font-display font-bold text-spritz overflow-hidden ring-2 ring-transparent hover:ring-spritz transition-all"
        title="Klik om een nieuwe foto te uploaden"
        type="button"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          fallbackInitial
        )}
        <span className="absolute inset-0 rounded-full bg-espresso/0 group-hover:bg-espresso/40 transition-colors flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
          {uploading ? "Bezig..." : "Wijzig"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
