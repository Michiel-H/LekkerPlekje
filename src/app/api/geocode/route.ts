import { NextResponse, type NextRequest } from "next/server";

/**
 * Server-side proxy for Nominatim geocoding lookups.
 *
 * The Nominatim usage policy requires a valid User-Agent identifying the
 * application — browsers can't set one, which is why the client-side call
 * previously omitted it. Running the request from a server route lets us
 * comply and also gives us a place to cache popular queries.
 *
 * See: https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3 || q.length > 200) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }

  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}` +
    `&format=json&addressdetails=1&countrycodes=nl&limit=5`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LekkerPlekje.com (contact@lekkerplekje.com)",
        "Accept-Language": "nl",
      },
      // Cache identical lookups for an hour — addresses don't move.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed." }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Geocoding failed." }, { status: 502 });
  }
}
