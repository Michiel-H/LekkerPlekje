import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();

  const [pendingRes, publishedRes, usersRes, toppertjesRes] = await Promise.all([
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "toppertje"),
  ]);

  return {
    pending: pendingRes.count ?? 0,
    published: publishedRes.count ?? 0,
    users: usersRes.count ?? 0,
    toppertjes: toppertjesRes.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Openstaande suggesties", value: stats.pending, color: "bg-spritz/10 text-spritz" },
    { label: "Actieve locaties", value: stats.published, color: "bg-groen/10 text-groen" },
    { label: "Gebruikers", value: stats.users, color: "bg-espresso/5 text-espresso" },
    { label: "Toppertjes", value: stats.toppertjes, color: "bg-frisgroen/10 text-frisgroen" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Dashboard</h1>
      <p className="mt-1 text-sm text-espresso-light">Overzicht van LekkerPlekje.com</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white border border-espresso/8 p-5"
          >
            <p className="text-sm text-espresso-light">{card.label}</p>
            <p className={`mt-2 text-3xl font-display font-bold ${card.color.split(" ")[1]}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
