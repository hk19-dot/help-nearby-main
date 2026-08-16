import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Edit2, Save, X, Phone, Users, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContacts, addContact, updateContact, deleteContact, EmergencyContact } from "@/lib/contacts";
import { getUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const EmergencyContactsPage = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", relationship: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateContact(editingId, form);
        setContacts((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast({ title: "Contact Updated ✅" });
      } else {
        const newContact = await addContact(form);
        setContacts((prev) => [newContact, ...prev]);
        toast({ title: "Contact Added ✅", description: `${form.name} has been added` });
      }
      resetForm();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save contact",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setForm({ name: contact.name, phone: contact.phone, relationship: contact.relationship });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Contact Removed" });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="section-container py-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Emergency Contacts
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your trusted emergency contacts — stored securely in the cloud
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add Contact
          </button>
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAdd} className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg">
                    {editingId ? "Edit Contact" : "Add New Contact"}
                  </h3>
                  <button type="button" onClick={resetForm} className="p-1 hover:bg-secondary rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Contact name"
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Relationship</label>
                    <input
                      type="text"
                      value={form.relationship}
                      onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                      placeholder="e.g. Father, Friend"
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Update" : "Save"} Contact
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Emergency Contacts</h3>
            <p className="text-muted-foreground">Add at least 2-3 trusted contacts for emergency situations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-display text-lg">
                      {contact.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold">{contact.name}</h4>
                      {contact.relationship && (
                        <span className="text-xs text-muted-foreground">{contact.relationship}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(contact)} className="p-1.5 rounded-lg hover:bg-secondary">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 rounded-lg hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <a href={`tel:${contact.phone}`} className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                  <Phone className="w-4 h-4" /> {contact.phone}
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsPage;
