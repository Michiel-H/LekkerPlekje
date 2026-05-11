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

  const MAX_WORDS = 25;
  const wordCount = bio.trim() === "" ? 0 : bio.trim().split(/\s+/).length;

  function handleChange(value: string) {
    // Enforce word limit — truncate to first MAX_WORDS words, but allow a
    // trailing space so the user can keep typing the next word
    const words = value.split(/\s+/);
    if (words.length > MAX_WORDS) {
      setBio(words.slice(0, MAX_WORDS).join(" "));
    } else {
      setBio(value);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-espresso-light italic hover:text-espresso transition-colors text-left"
      >
        {bio ? `"${bio}"` : "+ Voeg iets toe over jezelf"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <textarea
        value={bio}
        onChange={(e) => handleChange(e.target.value)}
        rows={2}
        placeholder="bijv. Altijd op zoek naar terrassen waar je tot 21:00 zon hebt."
        className="w-full rounded-lg border border-espresso/15 bg-white px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-spritz/50 resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${wordCount >= MAX_WORDS ? "text-koraal" : "text-espresso-light/60"}`}>
          {wordCount}/{MAX_WORDS} woorden
        </span>
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
