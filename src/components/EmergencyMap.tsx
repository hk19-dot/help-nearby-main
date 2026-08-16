import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EmergencyCategory } from "./EmergencyButtons";
import { NearbyPlace } from "@/lib/overpass";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface EmergencyMapProps {
  userLocation: { lat: number; lng: number } | null;
  activeCategory: EmergencyCategory | null;
  places: NearbyPlace[];
  loading: boolean;
  searchedLocationName?: string;
}

const EmergencyMap = ({ userLocation, activeCategory, places, loading, searchedLocationName }: EmergencyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const center = userLocation || { lat: 17.4435, lng: 78.3772 };

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (userLocation) {
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        color: "#dc2626",
        fillColor: "#dc2626",
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(`<b>${searchedLocationName || "Your Location"}</b>`);
    }

    if (places.length > 0) {
      const bounds = L.latLngBounds([]);
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);

      places.forEach((loc) => {
        bounds.extend([loc.lat, loc.lng]);
        L.marker([loc.lat, loc.lng])
          .addTo(map)
          .bindPopup(
            `<div style="min-width:150px"><b>${loc.name}</b><br/><small>${loc.address}</small><br/><a href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}" target="_blank" style="color:#dc2626;font-weight:600">Get Directions →</a></div>`
          );
      });

      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, activeCategory?.id, userLocation, places]);

  return (
    <section className="py-16 section-container" id="map">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">
          {activeCategory ? `Nearby ${activeCategory.label}` : "Emergency Services Map"}
        </h2>
        <p className="text-muted-foreground text-lg">
          {loading
            ? "Searching for nearby services..."
            : activeCategory
            ? `Found ${places.length} ${activeCategory.label.toLowerCase()} service(s) near ${searchedLocationName || "you"}`
            : "Select an emergency type above to see nearby services"}
        </p>
      </div>
      <div className="glass-card overflow-hidden">
        <div ref={mapRef} className="w-full h-[400px] sm:h-[500px] rounded-2xl" />
      </div>
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {!loading && places.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((loc, i) => (
            <div key={i} className="glass-card p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{loc.name}</h4>
                <p className="text-sm text-muted-foreground">{loc.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold text-sm hover:underline whitespace-nowrap ml-4"
              >
                Directions →
              </a>
            </div>
          ))}
        </div>
      )}
      {!loading && activeCategory && (places?.length ?? 0) === 0 && (
        <div className="mt-6 text-center text-muted-foreground">
          <p>No {activeCategory.label.toLowerCase()} services found nearby. Try searching a different location.</p>
        </div>
      )}
    </section>
  );
};

export default EmergencyMap;
