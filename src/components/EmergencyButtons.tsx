import { motion } from "framer-motion";
import {
  Siren,
  Flame,
  Shield,
  Home,
  AlertTriangle,
  Droplets,
  CloudLightning,
  Ambulance,
} from "lucide-react";

export interface EmergencyCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const emergencyCategories: EmergencyCategory[] = [
  {
    id: "medical",
    label: "Medical Emergency",
    icon: <Siren className="w-8 h-8" />,
    color: "text-emergency-medical",
    bgColor: "bg-emergency-medical/10",
    borderColor: "border-emergency-medical/30",
    description: "Hospitals & clinics nearby",
  },
  {
    id: "fire",
    label: "Fire Emergency",
    icon: <Flame className="w-8 h-8" />,
    color: "text-emergency-fire",
    bgColor: "bg-emergency-fire/10",
    borderColor: "border-emergency-fire/30",
    description: "Fire stations nearby",
  },
  {
    id: "police",
    label: "Police Assistance",
    icon: <Shield className="w-8 h-8" />,
    color: "text-emergency-police",
    bgColor: "bg-emergency-police/10",
    borderColor: "border-emergency-police/30",
    description: "Police stations nearby",
  },
  {
    id: "shelter",
    label: "Safe Shelter",
    icon: <Home className="w-8 h-8" />,
    color: "text-emergency-shelter",
    bgColor: "bg-emergency-shelter/10",
    borderColor: "border-emergency-shelter/30",
    description: "Shelters & safe zones",
  },
  {
    id: "accident",
    label: "Report Accident",
    icon: <AlertTriangle className="w-8 h-8" />,
    color: "text-emergency-accident",
    bgColor: "bg-emergency-accident/10",
    borderColor: "border-emergency-accident/30",
    description: "Report an incident",
  },
  {
    id: "blood",
    label: "Blood Banks",
    icon: <Droplets className="w-8 h-8" />,
    color: "text-emergency-blood",
    bgColor: "bg-emergency-blood/10",
    borderColor: "border-emergency-blood/30",
    description: "Nearby blood banks",
  },
  {
    id: "disaster",
    label: "Disaster Relief",
    icon: <CloudLightning className="w-8 h-8" />,
    color: "text-emergency-disaster",
    bgColor: "bg-emergency-disaster/10",
    borderColor: "border-emergency-disaster/30",
    description: "Relief centers nearby",
  },
  {
    id: "ambulance",
    label: "Ambulance",
    icon: <Ambulance className="w-8 h-8" />,
    color: "text-emergency-ambulance",
    bgColor: "bg-emergency-ambulance/10",
    borderColor: "border-emergency-ambulance/30",
    description: "Call an ambulance",
  },
];

interface EmergencyButtonsProps {
  onSelect: (category: EmergencyCategory) => void;
  activeCategory: string | null;
}

const EmergencyButtons = ({ onSelect, activeCategory }: EmergencyButtonsProps) => {
  return (
    <section className="py-16 section-container" id="emergency-buttons">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">
          Quick Emergency Access
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select the type of emergency to find nearby services instantly
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {emergencyCategories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            onClick={() => onSelect(cat)}
            className={`emergency-btn ${cat.bgColor} ${cat.borderColor} ${
              activeCategory === cat.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
            }`}
          >
            <div className={cat.color}>{cat.icon}</div>
            <span className={`font-semibold text-sm sm:text-base ${cat.color}`}>{cat.label}</span>
            <span className="text-muted-foreground text-xs">{cat.description}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default EmergencyButtons;
