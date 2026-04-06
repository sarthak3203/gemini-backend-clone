import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiRequest } from "../../lib/api";

export function ForgotPasswordPage() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSend = useMemo(() => mobile.trim().length >= 8, [mobile]);

  async function sendResetOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/forgot-password", { method: "POST", data: { mobile: mobile.trim() } });
      setInfo(res?.otp ? `Reset OTP sent (dev): ${res.otp}` : res?.message || "OTP sent");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold">Forgot password</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">
        We’ll generate a reset OTP. (The backend currently changes password via the authenticated endpoint; we’ll guide you
        back to login after.)
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Mobile</label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" />
        </div>
      </div>

      {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {info && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</div>}

      <div className="mt-5 flex gap-2">
        <Button onClick={sendResetOtp} disabled={!canSend || loading} className="w-full">
          {loading ? "Sending…" : "Send reset OTP"}
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

