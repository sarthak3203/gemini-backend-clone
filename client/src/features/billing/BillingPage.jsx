import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../app/auth/AuthContext";
import { backend } from "../../lib/backend";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function BillingPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await backend.subscription.status(token);
      setStatusMessage(res?.message || "");
    } catch (e) {
      setError(e.message || "Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function upgrade() {
    setError("");
    try {
      const res = await backend.subscription.checkoutPro(token);
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      throw new Error("No Stripe checkout URL returned");
    } catch (e) {
      setError(e.message || "Failed to start checkout");
    }
  }

  const isPro = useMemo(() => statusMessage.toLowerCase().includes("pro"), [statusMessage]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">Subscription</div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Billing control center</h2>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              Connected to `GET /subscription/status` and `POST /subscribe/pro`.
            </p>
          </div>
          {loading ? <Spinner className="h-5 w-5" /> : <Badge tone={isPro ? "pro" : "neutral"}>{isPro ? "Pro" : "Basic"}</Badge>}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-[rgb(var(--border))] bg-white/85 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">Current status</div>
          <div className="mt-2 text-sm font-semibold">{statusMessage || (loading ? "Loading..." : "Unknown")}</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={loadStatus} disabled={loading}>
            Refresh status
          </Button>
          <Button onClick={upgrade} disabled={loading || isPro}>
            {isPro ? "Already Pro" : "Upgrade to Pro"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">Plan comparison</div>
        <h3 className="mt-1 text-xl font-bold tracking-tight">Basic vs Pro</h3>

        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-[rgb(var(--border))] bg-white p-4">
            <div className="font-semibold">Basic</div>
            <div className="mt-1 text-[rgb(var(--text-muted))]">Daily response cap suitable for light usage.</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
            <div className="font-semibold text-emerald-900">Pro</div>
            <div className="mt-1 text-emerald-900/80">
              Higher daily limits and a smoother chat workflow with fewer interruptions.
            </div>
          </div>
          <div className="rounded-xl border border-[rgb(var(--border))] bg-white p-4 text-[rgb(var(--text-muted))]">
            Payments are securely handled through Stripe Checkout.
          </div>
        </div>
      </Card>
    </div>
  );
}
