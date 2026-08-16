import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const contacts = [
  { name: "National Emergency", number: "112", color: "bg-emergency-medical/10 text-emergency-medical border-emergency-medical/30" },
  { name: "Ambulance", number: "108", color: "bg-emergency-ambulance/10 text-emergency-ambulance border-emergency-ambulance/30" },
  { name: "Fire Department", number: "101", color: "bg-emergency-fire/10 text-emergency-fire border-emergency-fire/30" },
  { name: "Police", number: "100", color: "bg-emergency-police/10 text-emergency-police border-emergency-police/30" },
  { name: "Women Helpline", number: "1091", color: "bg-emergency-blood/10 text-emergency-blood border-emergency-blood/30" },
  { name: "Disaster Management", number: "1070", color: "bg-emergency-disaster/10 text-emergency-disaster border-emergency-disaster/30" },
];

const EmergencyContacts = () => {
  return (
    <section className="py-16 bg-secondary/50" id="contacts">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">
            Emergency Contact Numbers
          </h2>
          <p className="text-muted-foreground text-lg">One-tap calling for immediate help</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {contacts.map((c, i) => (
            <motion.a
              key={c.number}
              href={`tel:${c.number}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 ${c.color} hover:scale-105 transition-transform`}
            >
              <Phone className="w-6 h-6" />
              <span className="text-2xl font-bold font-display">{c.number}</span>
              <span className="text-xs font-medium text-center opacity-80">{c.name}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmergencyContacts;
