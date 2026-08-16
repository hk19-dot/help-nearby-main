import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Siren, Menu, X, LogIn, LogOut, Users, Brain, User } from "lucide-react";
import { getUser, logoutUser, User as UserType } from "@/lib/auth";

const navLinks = [
  { label: "Emergency", href: "/#emergency-buttons", isHash: true },
  { label: "Map", href: "/#map", isHash: true },
  { label: "Contacts", href: "/contacts", isHash: false },
  { label: "AI Report", href: "/report", isHash: false },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  // Read user on mount and whenever localStorage changes (cross-tab sync)
  useEffect(() => {
    setUser(getUser());
    const syncUser = () => setUser(getUser());
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="section-container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Siren className="w-5 h-5 text-primary" />
          </div>
          <span>EmergencyLocator</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-5">
          {navLinks.map((l) =>
            l.isHash ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            )
          )}

          <a
            href="tel:112"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
          >
            Call 112
          </a>

          {user ? (
            <div className="flex items-center gap-2 ml-1 pl-4 border-l border-border">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {user.name?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
                </div>
                <span className="text-muted-foreground max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline ml-1"
            >
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t bg-card px-4 pb-4 space-y-1">
          {navLinks.map((l) =>
            l.isHash ? (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {l.label === "Contacts" && <Users className="w-4 h-4" />}
                {l.label === "AI Report" && <Brain className="w-4 h-4" />}
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {l.label === "Contacts" && <Users className="w-4 h-4" />}
                {l.label === "AI Report" && <Brain className="w-4 h-4" />}
                {l.label}
              </Link>
            )
          )}

          <div className="pt-2 border-t border-border mt-2">
            <a
              href="tel:112"
              className="block text-center bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold mb-2"
            >
              📞 Call 112
            </a>

            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-sm text-destructive border border-destructive/30 rounded-xl py-2.5 hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="w-4 h-4 inline mr-1" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-center text-primary font-semibold border border-primary/30 rounded-xl py-2.5 hover:bg-primary/5 transition-colors"
              >
                <LogIn className="w-4 h-4 inline mr-1" /> Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
