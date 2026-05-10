"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  initialBio: string | null;
}

export default function BioEditor({ userId, initialBio }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(initialBio ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ bio: bio.trim() || null } as never)
      .eq("id", userId);
    setEditing(false);
    setSaving(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-espresso-light italic hover:text-espresso transition-colors text-left"
      >
        {bio ? `"${bio}"` : "+ Voeg een vibe toe over jezelf"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, 140))}
        rows={2}
        placeholder="bijv. Altijd op zoek naar terrassen waar je tot 21:00 zon hebt."
        className="w-full rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50 resize-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-espresso-light/60">{bio.length}/140</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(false);
              setBio(initialBio ?? "");
            }}
            className="rounded-lg bg-espresso/5 px-2.5 py-1 text-xs font-medium text-espresso-light hover:bg-espresso/10"
          >
            Annuleren
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-groen/10 px-2.5 py-1 text-xs font-medium text-groen hover:bg-groen/20 disabled:opacity-50"
          >
            {saving ? "..." : "Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
