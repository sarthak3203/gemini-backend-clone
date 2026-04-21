import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSend = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const canReset = useMemo(
    () => /\S+@\S+\.\S+/.test(email.trim()) && otp.trim().length >= 4 && password.length >= 6,
    [email, otp, password]
  );

  async function sendResetOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setPhase("reset");
      setInfo(res?.message || "OTP sent");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      setInfo(res?.message || "Password reset successfully");
      setOtp("");
      setPassword("");
    } catch (e) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold text-[rgb(var(--text-muted))]">Account recovery</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">
        Request a reset OTP, then set a new password using the code from your email.
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={phase === "reset" || loading}
          />
        </div>
        {phase === "reset" && (
          <>
            <div>
              <label className="text-xs font-medium text-[rgb(var(--text-muted))]">OTP</label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the code from your email"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[rgb(var(--text-muted))]">New password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
              />
            </div>
          </>
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
        {phase === "email" ? (
          <Button onClick={sendResetOtp} disabled={!canSend || loading} className="w-full">
            {loading ? "Sending..." : "Send reset OTP"}
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setPhase("email");
                setOtp("");
                setPassword("");
                setError("");
                setInfo("");
              }}
              disabled={loading}
              className="w-full"
            >
              Back
            </Button>
            <Button onClick={resetPassword} disabled={!canReset || loading} className="w-full">
              {loading ? "Resetting..." : "Reset password"}
            </Button>
          </>
        )}
      </div>

      <div className="mt-5 text-sm text-[rgb(var(--text-muted))]">
        <Link className="underline-offset-4 hover:underline" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
