export interface NearbyPlace {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const categoryToOverpass: Record<string, string> = {
  medical: '["amenity"~"hospital|clinic|doctors"]',
  fire: '["amenity"="fire_station"]',
  police: '["amenity"="police"]',
  shelter: '["amenity"~"shelter|social_facility"]["social_facility"~"shelter|refugee"]',
  blood: '["healthcare"="blood_donation"]["amenity"="blood_bank"]',
  disaster: '["emergency"~"assembly_point|disaster"]',
  ambulance: '["emergency"="ambulance_station"]',
  accident: '["amenity"="police"]',
};

// Fallback broader queries for categories that often return empty
const categoryFallback: Record<string, string> = {
  shelter: '["amenity"~"shelter|community_centre|social_facility"]',
  blood: '["amenity"~"hospital|clinic"]["healthcare"~"blood|laboratory"]',
  disaster: '["amenity"~"community_centre|fire_station"]["emergency"~"yes|assembly_point"]',
  ambulance: '["amenity"~"hospital"]["emergency"="yes"]',
};

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  categoryId: string,
  radiusMeters = 10000
): Promise<NearbyPlace[]> {
  const tag = categoryToOverpass[categoryId];
  if (!tag) return [];

  const query = `
    [out:json][timeout:15];
    (
      node${tag}(around:${radiusMeters},${lat},${lng});
      way${tag}(around:${radiusMeters},${lat},${lng});
    );
    out center 15;
  `;

  try {
    let places = await runOverpassQuery(query);

    // If no results, try fallback query with larger radius
    if (places.length === 0 && categoryFallback[categoryId]) {
      const fallbackTag = categoryFallback[categoryId];
      const fallbackQuery = `
        [out:json][timeout:15];
        (
          node${fallbackTag}(around:${radiusMeters * 2},${lat},${lng});
          way${fallbackTag}(around:${radiusMeters * 2},${lat},${lng});
        );
        out center 15;
      `;
      places = await runOverpassQuery(fallbackQuery);
    }

    return places;
  } catch (err) {
    console.error("Overpass API error:", err);
    return [];
  }
}

async function runOverpassQuery(query: string): Promise<NearbyPlace[]> {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) throw new Error(`Overpass API returned ${res.status}`);
  const data = await res.json();

  return (data.elements || [])
    .map((el: any) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) return null;

      const tags = el.tags || {};
      const name = tags.name || tags["name:en"] || tags.operator || "Unnamed";
      const parts = [tags["addr:street"], tags["addr:city"], tags["addr:state"]].filter(Boolean);
      const address = parts.length > 0 ? parts.join(", ") : "Address not available";

      return { name, lat: elLat, lng: elLng, address };
    })
    .filter(Boolean) as NearbyPlace[];
}
