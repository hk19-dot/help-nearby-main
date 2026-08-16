import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EmergencyButtons, { EmergencyCategory } from "@/components/EmergencyButtons";
import EmergencyMap from "@/components/EmergencyMap";
import EmergencyContacts from "@/components/EmergencyContacts";
import ReportIncident from "@/components/ReportIncident";
import Footer from "@/components/Footer";
import SOSButton from "@/components/SOSButton";

import LocationSearch from "@/components/LocationSearch";
import { fetchNearbyPlaces, NearbyPlace } from "@/lib/overpass";

const Index = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("idle");
  const [activeCategory, setActiveCategory] = useState<EmergencyCategory | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [locationName, setLocationName] = useState<string>("");

  const fetchPlaces = useCallback(async (lat: number, lng: number, category: EmergencyCategory) => {
    setLoadingPlaces(true);
    try {
      const results = await fetchNearbyPlaces(lat, lng, category.id);
      setPlaces(results);
    } catch {
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus("granted");
        setLocationName("Your Location");
        if (activeCategory) {
          fetchPlaces(loc.lat, loc.lng, activeCategory);
        }
      },
      () => setLocationStatus("denied")
    );
  }, [activeCategory, fetchPlaces]);

  const handleLocationSearch = useCallback((lat: number, lng: number, name: string) => {
    setUserLocation({ lat, lng });
    setLocationStatus("granted");
    setLocationName(name);
    if (activeCategory) {
      fetchPlaces(lat, lng, activeCategory);
    }
  }, [activeCategory, fetchPlaces]);

  const handleCategorySelect = useCallback((category: EmergencyCategory) => {
    setActiveCategory(category);
    if (userLocation) {
      fetchPlaces(userLocation.lat, userLocation.lng, category);
    }
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
  }, [userLocation, fetchPlaces]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onLocateMe={handleLocateMe} locationStatus={locationStatus} />
      
      {/* Location Search */}
      <section className="py-8 section-container">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold font-display mb-2">Search Any Location</h3>
          <p className="text-muted-foreground text-sm">
            Search for any city, area, or landmark to find emergency services nearby
          </p>
        </div>
        <LocationSearch onLocationSelect={handleLocationSearch} />
        {locationName && (
          <p className="text-center text-sm text-primary mt-3 font-medium">
            📍 Showing results for: {locationName}
          </p>
        )}
      </section>

      <EmergencyButtons onSelect={handleCategorySelect} activeCategory={activeCategory?.id ?? null} />
      <EmergencyMap
        userLocation={userLocation}
        activeCategory={activeCategory}
        places={places}
        loading={loadingPlaces}
        searchedLocationName={locationName}
      />
      <EmergencyContacts />
      <ReportIncident />
      <Footer />
      <SOSButton />
    </div>
  );
};

export default Index;
