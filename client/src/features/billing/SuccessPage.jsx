import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Success glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-100 opacity-40 blur-2xl" />
        
        <Card className="relative flex flex-col items-center overflow-hidden border-none p-8 text-center shadow-2xl ring-1 ring-border/50">
          {/* Animated Success Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner animate-in zoom-in duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div className="inline-flex rounded-full bg-emerald-100/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-900 ring-1 ring-emerald-200">
            Payment Successful
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
            You're all set!
          </h1>
          
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Thank you for upgrading. Your Pro features are being activated and will be available in your account shortly.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3">
            <Link to="/app">
              <Button className="h-12 w-full text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Start Chatting
              </Button>
            </Link>
            
            <Link to="/billing">
              <Button variant="ghost" className="h-12 w-full text-sm font-semibold text-muted-foreground hover:text-foreground">
                View Subscription Details
              </Button>
            </Link>
          </div>

          {/* Confetti-like detail */}
          <div className="mt-8 flex gap-1.5">
            <div className="h-1 w-1 rounded-full bg-emerald-400" />
            <div className="h-1 w-1 rounded-full bg-teal-400" />
            <div className="h-1 w-1 rounded-full bg-sky-400" />
          </div>
        </Card>
      </div>
    </div>
  );
}