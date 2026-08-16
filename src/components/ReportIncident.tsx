import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Camera, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const incidentTypes = [
  "Road Accident",
  "Fire Outbreak",
  "Medical Emergency",
  "Natural Disaster",
  "Crime Incident",
  "Other",
];

const ReportIncident = () => {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error("Please select an incident type");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Incident reported successfully! Emergency teams have been notified.");
      setType("");
      setDescription("");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <section className="py-16 section-container" id="report">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emergency-accident/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-emergency-accident" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">Report an Incident</h2>
              <p className="text-muted-foreground text-sm">Help emergency teams respond faster</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Incident Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {incidentTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      type === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the emergency situation..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <Camera className="w-4 h-4" />
                Attach Photo
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Share Location
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {submitting ? "Sending Report..." : "Submit Emergency Report"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ReportIncident;
