import { Siren, Heart } from "lucide-react";

const Footer = () => (
  <footer className="py-10 border-t bg-card">
    <div className="section-container">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-bold">
          <Siren className="w-5 h-5 text-primary" />
          <span>EmergencyLocator</span>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-primary fill-primary" /> for public safety
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nearby Emergency Locator
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
