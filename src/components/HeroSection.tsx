import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  onLocateMe: () => void;
  locationStatus: string;
}

const HeroSection = ({ onLocateMe, locationStatus }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Emergency services background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, hsla(220,20%,10%,0.75), hsla(220,20%,10%,0.5))" }}
      />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-emergency" />
            <span className="text-primary-foreground text-sm font-medium">Emergency Assistance Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-4 font-display leading-tight">
            Nearby Emergency<br />
            <span className="text-primary">Locator</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Find hospitals, police stations, fire services, and safe shelters near you in seconds. Every second counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLocateMe}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:brightness-110 transition-all shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-5 h-5" />
              {locationStatus === "loading" ? "Detecting..." : "Locate Me Now"}
            </button>
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-foreground/10 transition-all"
            >
              <Phone className="w-5 h-5" />
              Call 112
            </a>
          </div>
          {locationStatus === "granted" && (
            <p className="text-emergency-shelter text-sm mt-4">✓ Location detected successfully</p>
          )}
          {locationStatus === "denied" && (
            <p className="text-primary text-sm mt-4">Location access denied. Please enable location services.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
