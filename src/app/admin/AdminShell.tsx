"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import type { UserRole } from "@/lib/supabase/types";

const STORAGE_KEY = "lp-admin-sidebar-collapsed";

export default function AdminShell({
  user,
  initialPendingCount,
  children,
}: {
  user: { display_name: string; role: UserRole; avatar_url?: string | null };
  initialPendingCount: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Restore the user's preference after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-creme">
      <AdminSidebar
        role={user.role}
        collapsed={collapsed}
        onToggle={toggle}
        initialPendingCount={initialPendingCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar user={user} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
