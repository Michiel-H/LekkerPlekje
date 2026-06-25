import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !isAdmin(user.role)) {
    redirect("/");
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("locations")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <AdminShell
      user={{
        display_name: user.display_name,
        role: user.role,
        avatar_url: user.avatar_url ?? null,
      }}
      initialPendingCount={count ?? 0}
    >
      {children}
    </AdminShell>
  );
}
