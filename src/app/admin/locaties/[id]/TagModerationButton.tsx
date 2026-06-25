"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Hide/unhide an individual location_tag from the location detail view. */
export default function TagModerationButton({
  id,
  hidden,
}: {
  id: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/location-tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={error ? "Mislukt — probeer opnieuw" : undefined}
      className={
        hidden
          ? "shrink-0 rounded-lg bg-groen/10 px-2.5 py-1 text-xs font-medium text-groen transition-colors hover:bg-groen/20 disabled:opacity-50"
          : "shrink-0 rounded-lg bg-koraal/10 px-2.5 py-1 text-xs font-medium text-koraal transition-colors hover:bg-koraal/20 disabled:opacity-50"
      }
    >
      {hidden ? "Toon weer" : "Verberg"}
    </button>
  );
}
