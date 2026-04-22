import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Subtle glow effect in the background */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-100 to-orange-100 opacity-30 blur-2xl" />
        
        <Card className="relative flex flex-col items-center overflow-hidden border-none p-8 text-center shadow-2xl ring-1 ring-border/50">
          {/* Status Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>

          <div className="inline-flex rounded-full bg-amber-100/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 ring-1 ring-amber-200">
            Payment Canceled
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
            No changes were made
          </h1>
          
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your current plan remains active. You can return to the billing center anytime if you decide to upgrade later.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3">
            <Link to="/billing">
              <Button className="h-12 w-full text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Return to Billing
              </Button>
            </Link>
            
            <Link to="/app">
              <Button variant="ghost" className="h-12 w-full text-sm font-semibold text-muted-foreground hover:text-foreground">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Footer Detail */}
          <p className="mt-8 text-[11px] font-medium text-muted-foreground/50">
            Secure checkout powered by Stripe.
          </p>
        </Card>
      </div>
    </div>
  );
}