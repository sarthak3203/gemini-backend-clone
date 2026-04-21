import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";
import { useAuth } from "../../app/auth/AuthContext";

export function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSubmit = useMemo(
    () => name.trim().length > 0 && /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 6,
    [email, name, password]
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
      setInfo(res?.message || "OTP sent. Enter it to complete signup.");
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
      setError(e.message || "Failed to verify signup OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold text-[rgb(var(--text-muted))]">First time here?</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">
        Create your account with a password, then verify the OTP sent to your email.
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={phase === "otp" || loading}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={phase === "otp" || loading}
          />
        </div>
        {phase === "details" ? (
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">OTP</label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the code from your email"
              disabled={loading}
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
        {phase === "details" ? (
          <Button onClick={signup} disabled={!canSubmit || loading} className="w-full">
            {loading ? "Sending OTP..." : "Create account"}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setPhase("details");
                setOtp("");
                setError("");
                setInfo("");
              }}
              disabled={loading}
              className="w-full"
            >
              Back
            </Button>
            <Button onClick={verifySignup} disabled={!canVerify || loading} className="w-full">
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </>
        )}
      </div>

      <div className="mt-5 text-sm text-[rgb(var(--text-muted))]">
        Already have an account?{" "}
        <Link className="text-[rgb(var(--text))] underline-offset-4 hover:underline" to="/login">
          Log in
        </Link>
      </div>
    </div>
  );
}
