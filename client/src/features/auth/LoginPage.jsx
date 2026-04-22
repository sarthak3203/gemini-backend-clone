import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";
import { useAuth } from "../../app/auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("otp"); // otp | password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("email"); // email | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSend = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const canVerify = useMemo(
    () => otp.trim().length >= 4 && /\S+@\S+\.\S+/.test(email.trim()),
    [otp, email]
  );
  const canLoginWithPassword = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 6,
    [email, password]
  );

  function resetMessages() {
    setError("");
    setInfo("");
  }

  function switchMethod(nextMethod) {
    setMethod(nextMethod);
    setPhase("email");
    setOtp("");
    setPassword("");
    resetMessages();
  }

  async function sendOtp() {
    resetMessages();
    setLoading(true);
    try {
      const res = await backend.auth.sendOtp({ email: email.trim().toLowerCase() });
      setPhase("otp");
      setInfo(res?.message || "Verification code sent to your email.");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    resetMessages();
    setLoading(true);
    try {
      const res = await backend.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      if (!res?.token) throw new Error("No token returned");
      login(res.token);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithPassword() {
    resetMessages();
    setLoading(true);
    try {
      const res = await backend.auth.login({
        email: email.trim().toLowerCase(),
        password,
      });
      if (!res?.token) throw new Error("No token returned");
      login(res.token);
      navigate("/app", { replace: true });
    } catch (e) {
      setError(e.message || "Incorrect email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {method === "otp"
            ? "Enter your email to receive a secure login code."
            : "Enter your credentials to access your account."}
        </p>
      </div>

      {/* Modern Segmented Control (Tabs) */}
      <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1 border border-border/50">
        <button
          type="button"
          className={`relative rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
            method === "otp"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => switchMethod("otp")}
          disabled={loading}
        >
          Passwordless
        </button>
        <button
          type="button"
          className={`relative rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
            method === "password"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => switchMethod("password")}
          disabled={loading}
        >
          Password
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            Email Address
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={loading || (method === "otp" && phase === "otp")}
            className="h-12 border-muted-foreground/20 focus:ring-2 transition-all"
          />
        </div>

        {method === "otp" && phase === "otp" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              One-Time Password
            </label>
            <Input 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="••••••" 
              className="h-12 text-center text-lg font-mono tracking-[0.5em]"
              autoFocus
            />
          </div>
        )}

        {method === "password" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Link className="text-xs font-medium text-primary hover:underline" to="/forgot-password">
                Forgot?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              className="h-12 border-muted-foreground/20 focus:ring-2 transition-all"
            />
          </div>
        )}
      </div>

      {/* Status Messages */}
      {(error || info) && (
        <div className={`mt-6 rounded-xl border p-4 text-sm flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
          error ? "border-red-500/20 bg-red-50 text-red-700" : "border-emerald-500/20 bg-emerald-50 text-emerald-800"
        }`}>
          <div className={`shrink-0 h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
          <p className="flex-1">{error || info}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {method === "password" ? (
          <Button 
            onClick={loginWithPassword} 
            disabled={!canLoginWithPassword || loading} 
            className="h-12 w-full text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? "Verifying..." : "Sign in to account"}
          </Button>
        ) : (
          <>
            {phase === "email" ? (
              <Button 
                onClick={sendOtp} 
                disabled={!canSend || loading} 
                className="h-12 w-full text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {loading ? "Sending..." : "Send secure code"}
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={verifyOtp} 
                  disabled={!canVerify || loading} 
                  className="h-12 w-full text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                >
                  {loading ? "Signing in..." : "Confirm & Login"}
                </Button>
                <button 
                  onClick={() => setPhase("email")} 
                  disabled={loading}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Entered wrong email? Go back
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-10 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link className="font-semibold text-primary hover:underline transition-all" to="/signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}