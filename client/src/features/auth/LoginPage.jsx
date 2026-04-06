import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiRequest } from "../../lib/api";
import { useAuth } from "../../app/auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("mobile"); // mobile | otp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSend = useMemo(() => mobile.trim().length >= 8, [mobile]);
  const canVerify = useMemo(() => otp.trim().length >= 4 && mobile.trim().length >= 8, [otp, mobile]);

  async function sendOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/send-otp", { method: "POST", data: { mobile: mobile.trim() } });
      setPhase("otp");
      setInfo(res?.otp ? `OTP sent (dev): ${res.otp}` : res?.message || "OTP sent");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/verify-otp", {
        method: "POST",
        data: { mobile: mobile.trim(), otp: otp.trim() },
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

  return (
    <div>
      <div className="text-sm font-semibold">Login</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">We’ll send a one-time password to your mobile.</div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Mobile</label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" />
        </div>

        {phase === "otp" && (
          <div>
            <label className="text-xs font-medium text-[rgb(var(--text-muted))]">OTP</label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4–6 digits" />
          </div>
        )}
      </div>

      {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {info && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</div>}

      <div className="mt-5 flex gap-2">
        {phase === "mobile" ? (
          <Button onClick={sendOtp} disabled={!canSend || loading} className="w-full">
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setPhase("mobile")} disabled={loading} className="w-full">
              Back
            </Button>
            <Button onClick={verifyOtp} disabled={!canVerify || loading} className="w-full">
              {loading ? "Verifying…" : "Verify & Continue"}
            </Button>
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
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

