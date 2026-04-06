import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiRequest } from "../../lib/api";

export function SignupPage() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const canSubmit = useMemo(() => mobile.trim().length >= 8, [mobile]);

  async function signup() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/signup", { method: "POST", data: { mobile: mobile.trim(), name: name.trim() } });
      setInfo(res?.message || "Account created. Please log in.");
      setTimeout(() => navigate("/login"), 600);
    } catch (e) {
      setError(e.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-sm font-semibold">Sign up</div>
      <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">Create an account with your mobile number.</div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Mobile</label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" />
        </div>
        <div>
          <label className="text-xs font-medium text-[rgb(var(--text-muted))]">Name (optional)</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
      </div>

      {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {info && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</div>}

      <div className="mt-5">
        <Button onClick={signup} disabled={!canSubmit || loading} className="w-full">
          {loading ? "Creating…" : "Create account"}
        </Button>
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

