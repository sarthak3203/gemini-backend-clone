import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSend = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  async function sendResetOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setInfo(res?.message || "OTP sent");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold text-[rgb(var(--text-muted))]">Account recovery</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">
        We will send a reset OTP to your email.
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
        <Button onClick={sendResetOtp} disabled={!canSend || loading} className="w-full">
          {loading ? "Sending..." : "Send reset OTP"}
        </Button>
      </div>

      <div className="mt-5 text-sm text-[rgb(var(--text-muted))]">
        <Link className="underline-offset-4 hover:underline" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
