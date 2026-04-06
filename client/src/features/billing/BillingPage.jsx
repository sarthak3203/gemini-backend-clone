import { useEffect, useState } from "react";
import { useAuth } from "../../app/auth/AuthContext";
import { apiRequest } from "../../lib/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function BillingPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadStatus() {
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("/subscription/status", { token });
      setStatusMessage(res?.message || "");
    } catch (e) {
      setError(e.message || "Failed to load subscription status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function upgrade() {
    setError("");
    try {
      const res = await apiRequest("/subscribe/pro", { method: "POST", token });
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error("No Stripe checkout URL returned");
      }
    } catch (e) {
      setError(e.message || "Failed to start checkout");
    }
  }

  const isPro = statusMessage.toLowerCase().includes("pro");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Subscription</div>
            <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">Upgrade to Pro for higher daily limits.</div>
          </div>
          {loading ? <Spinner /> : <Badge tone={isPro ? "pro" : "neutral"}>{isPro ? "Pro" : "Basic"}</Badge>}
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--muted))] px-4 py-3">
          <div className="text-xs font-medium text-[rgb(var(--text-muted))]">Status</div>
          <div className="mt-1 text-sm">{statusMessage || (loading ? "Loading…" : "Unknown")}</div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={loadStatus} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={upgrade} disabled={loading || isPro}>
            {isPro ? "Already Pro" : "Upgrade to Pro"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold">What you get</div>
        <div className="mt-2 space-y-2 text-sm text-[rgb(var(--text-muted))]">
          <div className="rounded-lg border border-[rgb(var(--border))] bg-white px-4 py-3">
            Higher daily response limit (Basic is capped).
          </div>
          <div className="rounded-lg border border-[rgb(var(--border))] bg-white px-4 py-3">
            Faster workflows with fewer interruptions.
          </div>
          <div className="rounded-lg border border-[rgb(var(--border))] bg-white px-4 py-3">
            Subscription is managed securely via Stripe Checkout.
          </div>
        </div>
      </Card>
    </div>
  );
}

