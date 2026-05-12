import LocatiesTable from "./LocatiesTable";

export default function LocatiesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-espresso">Alle Locaties</h1>
      <p className="mt-1 text-sm text-espresso-light">
        Alle live locaties op LekkerPlekje.com. Bewerk of verwijder waar nodig.
      </p>

      <div className="mt-8">
        <LocatiesTable />
      </div>
    </div>
  );
}
