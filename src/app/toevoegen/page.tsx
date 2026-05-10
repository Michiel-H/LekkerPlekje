"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { TAGS } from "@/lib/tags";
import { createClient } from "@/lib/supabase/client";
import type { TagCategory } from "@/lib/supabase/types";

export default function ToevoegenPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    Record<string, string>
  >({});
  const [motivations, setMotivations] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  useEffect(() => {
    let active = true;

    if (!address || address.length < 3 || !showAddressSuggestions) {
      const t = setTimeout(() => {
        if (active) setAddressSuggestions([]);
      }, 0);
      return () => {
        active = false;
        clearTimeout(t);
      };
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            address
          )}&format=json&addressdetails=1&countrycodes=nl&limit=5`,
          {
            headers: {
              "User-Agent": "LekkerPlekjeApp/1.0",
            },
          }
        );
        const data = await res.json();
        if (active) setAddressSuggestions(data);
      } catch (err) {
        console.error("Nominatim search error:", err);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [address, showAddressSuggestions]);

  function toggleTag(slug: string) {
    setSelectedTags((prev) => {
      const next = { ...prev };
      if (next[slug]) {
        delete next[slug];
        const m = { ...motivations };
        delete m[slug];
        setMotivations(m);
      } else {
        next[slug] = slug;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Je moet ingelogd zijn om een plekje toe te voegen.");
      setLoading(false);
      router.push("/login");
      return;
    }

    // Get Amsterdam city_id
    const { data: cityData } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", "amsterdam")
      .single();

    const city = cityData as any;
    if (!city) {
      setError("Kon de stad niet vinden. Probeer het later opnieuw.");
      setLoading(false);
      return;
    }

    // Insert location
    const { data: locationData, error: locationError } = await supabase
      .from("locations")
      .insert({
        name,
        address,
        neighborhood: neighborhood || null,
        city_id: city.id,
        submitted_by: user.id,
      } as never)
      .select("id")
      .single();

    const location = locationData as any;
    if (locationError || !location) {
      setError(locationError?.message || "Kon het plekje niet opslaan.");
      setLoading(false);
      return;
    }

    // Get tag IDs for selected tags
    const tagSlugs = Object.keys(selectedTags);
    const { data: dbTags } = await supabase
      .from("tags")
      .select("id, slug")
      .in("slug", tagSlugs);

    const tagRows = dbTags as any[] | null;
    if (tagRows && tagRows.length > 0) {
      const locationTagInserts = tagRows.map((tag: any) => ({
        location_id: location.id,
        tag_id: tag.id,
        motivation: motivations[tag.slug] || null,
      }));

      await supabase.from("location_tags").insert(locationTagInserts as never);
    }

    setLoading(false);
    setSubmitted(true);
  }

  const categories: { key: TagCategory; label: string }[] = [
    { key: "vibe", label: "Wat ga je doen?" },
    { key: "gezelschap", label: "Met wie?" },
  ];

  if (submitted) {
    return (
      <>
        <Header />
        <main className="flex-1 px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-espresso">
            Bedankt voor je tip!
          </h1>
          <p className="mt-2 text-espresso-light max-w-md mx-auto">
            We checken je plekje en zetten het zo snel mogelijk live. Nog 5
            goedgekeurde plekjes en je bent een Toppertje!
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setAddress("");
              setNeighborhood("");
              setSelectedTags({});
              setMotivations({});
            }}
          >
            Nog een plekje toevoegen
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-espresso">
            Plekje toevoegen
          </h1>
          <p className="mt-2 text-espresso-light">
            Ken je een lekker plekje? Deel het met de rest! Kies de tags die
            passen en schrijf er een korte motivatie bij.
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Naam van het plekje
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="bijv. Café de Klos"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
            </div>

            {/* Address */}
            <div className="relative">
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Adres
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setShowAddressSuggestions(true);
                }}
                onFocus={() => setShowAddressSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                placeholder="bijv. Kerkstraat 41, Amsterdam"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
              {/* Dropdown */}
              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-espresso/15 bg-white shadow-lg text-left">
                  {addressSuggestions.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => {
                        const { road, house_number, city, town, village, neighbourhood, suburb } = item.address || {};
                        const street = road ? `${road} ${house_number || ""}`.trim() : "";
                        const place = city || town || village || "";
                        const fullAddress = street && place ? `${street}, ${place}` : item.display_name;
                        
                        setAddress(fullAddress);
                        if (neighbourhood || suburb) {
                          setNeighborhood(neighbourhood || suburb);
                        }
                        setShowAddressSuggestions(false);
                      }}
                      className="cursor-pointer px-4 py-2.5 text-sm text-espresso hover:bg-spritz/5 border-b border-espresso/5 last:border-0 truncate"
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-espresso mb-1.5">
                Buurt
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="bijv. Jordaan, De Pijp, Oost"
                className="w-full rounded-xl border border-espresso/15 bg-white px-4 py-3 text-sm text-espresso placeholder:text-espresso-light/50 focus:outline-none focus:ring-2 focus:ring-spritz/50"
              />
            </div>

            {/* Tags by category */}
            {categories.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-espresso mb-2">
                  {key === "vibe" ? "Wat kan je hier doen?" : label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.filter((t) => t.category === key).map((tag) => {
                    const isSelected = !!selectedTags[tag.slug];
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() => toggleTag(tag.slug)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-groen text-white"
                            : "bg-white border border-espresso/10 text-espresso hover:border-groen hover:text-groen"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>

                {/* Motivations for selected tags in this category */}
                {TAGS.filter(
                  (t) => t.category === key && selectedTags[t.slug]
                ).map((tag) => (
                  <div key={`mot-${tag.slug}`} className="mt-3 ml-2">
                    <label className="block text-xs font-medium text-espresso-light mb-1">
                      Waarom {tag.name}?
                    </label>
                    <input
                      type="text"
                      value={motivations[tag.slug] || ""}
                      onChange={(e) =>
                        setMotivations((prev) => ({
                          ...prev,
                          [tag.slug]: e.target.value,
                        }))
                      }
                      placeholder="bijv. Hele gezellige binnentuin"
                      className="w-full rounded-lg border border-espresso/10 bg-white px-3 py-2 text-sm text-espresso placeholder:text-espresso-light/40 focus:outline-none focus:ring-2 focus:ring-spritz/50"
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={
                  !name || !address || Object.keys(selectedTags).length === 0 || loading
                }
              >
                {loading ? "Bezig met opslaan..." : "Plekje insturen"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
