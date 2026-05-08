"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/types";

interface User {
  id: string;
  display_name: string;
  role: UserRole;
  approved_count: number;
  created_at: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Gebruiker",
  toppertje: "Toppertje",
  admin: "Admin",
  superadmin: "Superadmin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  user: "bg-espresso/5 text-espresso-light",
  toppertje: "bg-spritz/10 text-spritz",
  admin: "bg-groen/10 text-groen",
  superadmin: "bg-frisgroen/10 text-frisgroen",
};

export default function CommunityTable({
  users,
  currentUserRole,
}: {
  users: User[];
  currentUserRole: UserRole;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function changeRole(userId: string, newRole: UserRole) {
    setLoading(userId);
    const supabase = createClient();
    await supabase.from("users").update({ role: newRole } as never).eq("id", userId);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="rounded-xl bg-white border border-espresso/8 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-espresso/8 bg-espresso/[0.02]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Naam</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Rol</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Plekjes</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Lid sinds</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-espresso-light uppercase tracking-wider">Acties</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-espresso/5">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-espresso/[0.01]">
              <td className="px-4 py-3 text-sm font-medium text-espresso">{user.display_name}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-espresso-light">{user.approved_count}</td>
              <td className="px-4 py-3 text-sm text-espresso-light">
                {new Date(user.created_at).toLocaleDateString("nl-NL")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {user.role === "user" && (
                    <button
                      onClick={() => changeRole(user.id, "toppertje")}
                      disabled={loading === user.id}
                      className="rounded-lg bg-spritz/10 px-3 py-1.5 text-xs font-medium text-spritz hover:bg-spritz/20 transition-colors disabled:opacity-50"
                    >
                      Promoveer tot Toppertje
                    </button>
                  )}
                  {user.role === "toppertje" && (
                    <button
                      onClick={() => changeRole(user.id, "user")}
                      disabled={loading === user.id}
                      className="rounded-lg bg-koraal/10 px-3 py-1.5 text-xs font-medium text-koraal hover:bg-koraal/20 transition-colors disabled:opacity-50"
                    >
                      Demoveer naar Gebruiker
                    </button>
                  )}
                  {(user.role === "admin" || user.role === "superadmin") && (
                    <span className="text-xs text-espresso-light">—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
