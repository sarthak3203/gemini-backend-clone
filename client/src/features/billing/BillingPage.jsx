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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Current Subscription Section */}
      <Card className="flex flex-col overflow-hidden border-none shadow-md ring-1 ring-border/50">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subscription Management</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight">Billing</h2>
            </div>
            {loading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <Badge 
                className={`px-4 py-1 text-xs font-bold uppercase ${isPro ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}
              >
                {isPro ? "Pro Member" : "Basic Plan"}
              </Badge>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Manage your plan preferences and view your current account limits. 
            All payments are securely processed and encrypted via Stripe.
          </p>

          <div className="mt-8 space-y-4">
            <div className={`rounded-2xl border p-5 transition-all ${isPro ? "border-primary/20 bg-primary/[0.03]" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Status</p>
                  <p className="mt-1 text-base font-semibold text-foreground">
                    {statusMessage || (loading ? "Checking status..." : "Status unavailable")}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${isPro ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button 
              onClick={upgrade} 
              disabled={loading || isPro} 
              className={`h-12 flex-1 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isPro ? "opacity-50" : "shadow-lg shadow-primary/25"}`}
            >
              {isPro ? "You are on Pro" : "Upgrade to Pro"}
            </Button>
            <Button 
              variant="outline" 
              onClick={loadStatus} 
              disabled={loading} 
              className="h-12 border-border bg-transparent px-8 hover:bg-muted"
            >
              Sync Status
            </Button>
          </div>
        </div>
        
        <div className="border-t bg-muted/20 px-6 py-4">
          <p className="text-[11px] text-muted-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Active session: {token ? "Authenticated" : "Unauthenticated"}
          </p>
        </div>
      </Card>

      {/* Plan Details Section */}
      <Card className="flex flex-col border-none shadow-md ring-1 ring-border/50">
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold tracking-tight">Plan Comparison</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose the workflow that fits your needs.</p>

          <div className="mt-8 space-y-4">
            {/* Basic Plan Info */}
            <div className="group rounded-2xl border border-border bg-background p-5 transition-colors hover:border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Basic</span>
                <span className="text-xs font-medium text-muted-foreground italic">Free</span>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Standard daily response limits
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Community support access
                </li>
              </ul>
            </div>

            {/* Pro Plan Info */}
            <div className="group rounded-2xl border border-primary/30 bg-primary/[0.02] p-5 transition-all hover:border-primary/50 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-primary">Pro</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-tighter">Recommended</span>
              </div>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Priority high-limit daily cap
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Smoother, interrupt-free chat
                </li>
                <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Early access to new features
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 grayscale opacity-50 contrast-125">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Powered by Stripe</span>
          </div>
        </div>
      </Card>
    </div>
  );
}