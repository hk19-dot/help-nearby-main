import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Siren, Mail, KeyRound, User, ArrowRight, RefreshCw,
  Lock, Eye, EyeOff, ShieldCheck, LogIn,
} from "lucide-react";
import {
  signupUser, sendLoginOtp, verifyOtpAndLogin, loginWithPassword,
} from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type Step = "form" | "otp";
type Mode = "login" | "signup";
type LoginMethod = "otp" | "password";

const Login = () => {
  const [step, setStep] = useState<Step>("form");
  const [mode, setMode] = useState<Mode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("otp");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSentAt, setOtpSentAt] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/";

  const resetOtp = () => setOtp(["", "", "", "", "", ""]);

  // ─── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode === "signup" && (!name || !password)) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        await signupUser(name.trim(), email.trim(), password);
      } else {
        await sendLoginOtp(email.trim());
      }
      setStep("otp");
      setOtpSentAt(Date.now());
      toast({
        title: "OTP Sent! 📧",
        description: `Check your inbox at ${email}`,
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Password Login ────────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await loginWithPassword(email.trim(), password);
      toast({ title: `Welcome back, ${user.name}! 🎉` });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handlers ────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length !== 6) return;

    if (Date.now() - otpSentAt > 5 * 60 * 1000) {
      toast({ title: "OTP Expired", description: "Please resend the OTP", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtpAndLogin(email.trim(), entered, mode === "signup" ? "signup" : "login");
      toast({
        title: mode === "signup" ? "Account Created! 🎉" : `Welcome back, ${user.name}! 🎉`,
        description: mode === "signup" ? "Your account is verified and ready." : "You are now logged in.",
      });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Verification Failed",
        description: err instanceof Error ? err.message : "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        await signupUser(name.trim(), email.trim(), password);
      } else {
        await sendLoginOtp(email.trim());
      }
      resetOtp();
      setOtpSentAt(Date.now());
      toast({ title: "OTP Resent 📧", description: "A new OTP has been sent to your email." });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const remainingSeconds = Math.max(
    0,
    Math.ceil((otpSentAt + 5 * 60 * 1000 - Date.now()) / 1000)
  );

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("form");
    resetOtp();
    setLoginMethod("otp");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl mb-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Siren className="w-6 h-6 text-primary" />
            </div>
            EmergencyLocator
          </a>
          <p className="text-muted-foreground text-sm mt-1">
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : "Secure access to your emergency dashboard"}
          </p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-secondary p-1 mb-6">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Login method tabs (only for login) */}
                {mode === "login" && (
                  <div className="flex gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("otp")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        loginMethod === "otp"
                          ? "border-primary text-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      📧 OTP Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("password")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        loginMethod === "password"
                          ? "border-primary text-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      🔑 Password Login
                    </button>
                  </div>
                )}

                <form
                  onSubmit={
                    mode === "login" && loginMethod === "password"
                      ? handlePasswordLogin
                      : handleSendOtp
                  }
                  className="space-y-4"
                >
                  {/* Name field (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password (signup or password-login mode) */}
                  {(mode === "signup" || loginMethod === "password") && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        {mode === "signup" ? "Create Password" : "Password"}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {mode === "signup" && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Password is securely hashed with bcrypt before storing
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : mode === "login" && loginMethod === "password" ? (
                      <>Login <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Send OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secured with bcrypt + JWT authentication
                  </p>
                </form>
              </motion.div>
            ) : (
              /* ─── OTP Step ───────────────────────────────────────────────── */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OTP sent to{" "}
                      <span className="font-semibold text-foreground">{email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check your inbox (and spam folder)
                    </p>
                  </div>

                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(i, e.target.value.replace(/\D/g, ""))
                        }
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verify & {mode === "login" ? "Login" : "Create Account"}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                    <span className="text-muted-foreground tabular-nums">
                      Expires in {Math.floor(remainingSeconds / 60)}:
                      {String(remainingSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep("form"); resetOtp(); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change email
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
