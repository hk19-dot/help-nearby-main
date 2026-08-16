import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, Send, X, Phone, CheckCircle2, Loader2, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const SOSButton = () => {
  const [active, setActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sosId, setSosId] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [contactCount, setContactCount] = useState(0);
  const { toast } = useToast();
  const user = getUser();

  // Fetch contact count on mount
  useEffect(() => {
    if (user) {
      api.contacts.list()
        .then((res) => setContactCount(res.contacts.length))
        .catch(() => setContactCount(0));
    }
  }, [user]);

  const handleSOS = () => {
    setActive(true);
    setSent(false);
    setSosId(null);
    setLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => {
          setLocation(null);
          setLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSendAlert = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to send SOS alerts",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location Required",
        description: "Please allow location access to send SOS",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const res = await api.sos.trigger(location.lat, location.lng, "SOS emergency triggered from app");
      setSosId(res.sos._id);
      setSent(true);

      const mapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      toast({
        title: "🚨 SOS Alert Sent!",
        description: `Your location has been logged. Maps: ${mapsLink}`,
      });
    } catch (err: unknown) {
      toast({
        title: "SOS Failed",
        description: err instanceof Error ? err.message : "Failed to send SOS. Call 112 directly.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!sosId) return;
    try {
      await api.sos.resolve(sosId);
      toast({ title: "SOS Resolved ✅", description: "Your SOS alert has been marked as resolved." });
      setActive(false);
      setSent(false);
      setSosId(null);
    } catch {
      toast({ title: "Error", description: "Could not resolve SOS", variant: "destructive" });
    }
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={handleSOS}
        id="sos-button"
        aria-label="Send SOS Emergency Alert"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 0 0 hsla(0,72%,51%,0.5)",
            "0 0 0 22px hsla(0,72%,51%,0)",
            "0 0 0 0 hsla(0,72%,51%,0.5)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertTriangle className="w-7 h-7" />
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => !sent && setActive(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display">SOS Emergency</h3>
                    <p className="text-xs text-muted-foreground">Powered by MongoDB backend</p>
                  </div>
                </div>
                <button
                  onClick={() => setActive(false)}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-4">
                Send your live location to emergency services and all your saved contacts instantly.
              </p>

              {/* Location status */}
              <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 mb-4 ${
                locating
                  ? "bg-secondary text-muted-foreground"
                  : location
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}>
                <MapPin className="w-4 h-4 shrink-0" />
                {locating ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Getting your location...
                  </span>
                ) : location ? (
                  <span>
                    📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                ) : (
                  <span>Location unavailable — enable GPS</span>
                )}
              </div>

              {/* Sent success state */}
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-3"
                >
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                  <p className="font-bold text-lg">Alert Sent & Saved!</p>
                  {sosId && (
                    <p className="text-xs text-muted-foreground font-mono">SOS ID: {sosId.slice(-8)}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Your SOS is stored in the database. Emergency services have been notified.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleResolve}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary transition-all"
                    >
                      <ShieldOff className="w-4 h-4" /> Mark Resolved
                    </button>
                    <a
                      href="tel:112"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:brightness-110"
                    >
                      <Phone className="w-4 h-4" /> Call 112
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <button
                    id="sos-send-btn"
                    onClick={handleSendAlert}
                    disabled={sending || locating}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending Alert...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send SOS Alert</>
                    )}
                  </button>

                  <a
                    href="tel:112"
                    className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary/5 transition-all"
                  >
                    <Phone className="w-4 h-4" /> Call 112 Directly
                  </a>
                </div>
              )}

              {/* Footer info */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                {user
                  ? `Logged in as ${user.name} • ${contactCount} contact(s) saved`
                  : "Login to save SOS to database"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
