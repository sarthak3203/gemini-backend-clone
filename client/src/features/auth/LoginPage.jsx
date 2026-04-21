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
      setInfo(res?.message || "OTP sent");
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
      setError(e.message || "Failed to verify OTP");
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
      setError(e.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold text-[rgb(var(--text-muted))]">Welcome back</div>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">
        {method === "otp" ? "Sign in with OTP" : "Sign in with password"}
      </h2>
      <div className="mt-2 text-sm text-[rgb(var(--text-muted))]">
        {method === "otp"
          ? "We will send a one-time password to your email."
          : "Use the password you set while creating your account."}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/70 p-1">
        <button
          type="button"
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            method === "otp"
              ? "bg-white text-[rgb(var(--text))] shadow-sm"
              : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
          }`}
          onClick={() => switchMethod("otp")}
          disabled={loading}
        >
          Email OTP
        </button>
        <button
          type="button"
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            method === "password"
              ? "bg-white text-[rgb(var(--text))] shadow-sm"
              : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
          }`}
          onClick={() => switchMethod("password")}
          disabled={loading}
        >
          Email + Password
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {method === "otp" && phase === "otp" && (
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">OTP</label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4-6 digits" />
          </div>
        )}

        {method === "password" && (
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {info && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {info}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {method === "password" ? (
          <Button onClick={loginWithPassword} disabled={!canLoginWithPassword || loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        ) : (
          <>
            {phase === "email" ? (
              <Button onClick={sendOtp} disabled={!canSend || loading} className="w-full">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setPhase("email")} disabled={loading} className="w-full">
                  Back
                </Button>
                <Button onClick={verifyOtp} disabled={!canVerify || loading} className="w-full">
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]" to="/forgot-password">
          Forgot password
        </Link>
        <Link className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]" to="/signup">
          Create account
        </Link>
      </div>
    </div>
  );
}
