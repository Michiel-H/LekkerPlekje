"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateImage, safeImageExt, MAX_AVATAR_SIZE, stripImageMetadata } from "@/lib/utils";
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
      // Extension derived from MIME, not from the user-supplied filename
      const ext = safeImageExt(sanitized);
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, sanitized, { upsert: true, contentType: sanitized.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      await supabase
        .from("users")
        .update({ avatar_url: publicUrl } as never)
        .eq("id", userId);
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
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
