import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import zxcvbn from "zxcvbn";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";
import { useAuth } from "../../app/auth/AuthContext";

const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
  {
    id: "special",
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
];

export function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("details"); // details | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const passwordChecks = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const passwordStrength = useMemo(() => zxcvbn(password), [password]);
  const isPasswordValid = useMemo(
    () => passwordChecks.every((rule) => rule.passed),
    [passwordChecks]
  );

  const canSubmit = useMemo(
    () => name.trim().length > 0 && /\S+@\S+\.\S+/.test(email.trim()) && isPasswordValid,
    [email, isPasswordValid, name]
  );
  const canVerify = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()) && otp.trim().length >= 4,
    [email, otp]
  );

  async function signup() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.signup({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password,
      });
      setPhase("otp");
      setInfo(res?.message || "Verification code sent to your email.");
    } catch (e) {
      setError(e.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function verifySignup() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.verifySignup({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      if (!res?.token) throw new Error("No token returned");
      login(res.token);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {phase === "details" ? "Create your account" : "Verify your email"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {phase === "details" 
            ? "Join us to start managing your projects efficiently." 
            : `We've sent a 6-digit code to ${email}`}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={phase === "otp" || loading}
            className="h-12 border-muted-foreground/20 focus:ring-2 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={phase === "otp" || loading}
            className="h-12 border-muted-foreground/20 focus:ring-2 transition-all"
          />
        </div>

        {phase === "details" ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                disabled={loading}
                className="h-12 border-muted-foreground/20 pr-20 focus:ring-2 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={loading}
                className="absolute inset-y-0 right-3 my-auto h-fit text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="space-y-3 rounded-2xl border border-border/50 bg-background/60 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={password ? "text-foreground" : "text-muted-foreground"}>
                    {password ? strengthLabels[passwordStrength.score] : "Very Weak"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      password ? strengthColors[passwordStrength.score] : "bg-muted-foreground/30"
                    }`}
                    style={{ width: `${password ? ((passwordStrength.score + 1) / 5) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-2 text-xs">
                {passwordChecks.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-2 ${
                      rule.passed ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    <span className="font-bold">{rule.passed ? "✓" : "✕"}</span>
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Verification Code
            </label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              disabled={loading}
              className="h-12 text-center text-lg font-mono tracking-[0.5em] focus:ring-2"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {(error || info) && (
        <div className={`mt-6 rounded-xl border p-4 text-sm flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
          error ? "border-red-500/20 bg-red-50 text-red-700" : "border-emerald-500/20 bg-emerald-50 text-emerald-800"
        }`}>
          <div className={`shrink-0 h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
          <p className="flex-1 font-medium">{error || info}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {phase === "details" ? (
          <Button 
            onClick={signup} 
            disabled={!canSubmit || loading} 
            className="h-12 w-full text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        ) : (
          <>
            <Button 
              onClick={verifySignup} 
              disabled={!canVerify || loading} 
              className="h-12 w-full text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
            >
              {loading ? "Verifying..." : "Complete Registration"}
            </Button>
            <button
              onClick={() => {
                setPhase("details");
                setOtp("");
                setShowPassword(false);
                setError("");
                setInfo("");
              }}
              disabled={loading}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Go back to edit details
            </button>
          </>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-10 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-semibold text-primary hover:underline transition-all" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
