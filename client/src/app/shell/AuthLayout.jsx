import { Outlet } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* Hero Section (Left Side) */}
          <Card className="relative hidden flex-col justify-between overflow-hidden border-none p-10 shadow-2xl ring-1 ring-border/50 lg:flex">
            {/* Dynamic Background Blurs */}
            <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Gemini Workspace v2.0
              </div>
              
              <h1 className="mt-8 text-5xl font-black leading-[1.1] tracking-tighter text-foreground">
                Collaborative AI chat, <br />
                <span className="text-primary">designed for focus.</span>
              </h1>
              
              <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed text-muted-foreground">
                Securely manage your workspace, interact with advanced AI models, and handle subscriptions from one unified console.
              </p>
            </div>

            {/* Feature Bento Grid */}
            <div className="relative z-10 mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { title: "Authentication", desc: "OTP & Password", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
                { title: "Chat Engine", desc: "Real-time Logic", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
                { title: "Billing", desc: "Stripe Secured", icon: "M12 1v22m5-18H7a3 3 0 0 0 0 6h10a3 3 0 0 1 0 6H7" }
              ].map((feature, i) => (
                <div key={i} className="group rounded-2xl border border-border/50 bg-background/40 p-4 backdrop-blur-md transition-all hover:border-primary/30 hover:bg-background/60">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={feature.icon}/></svg>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{feature.title}</div>
                  <div className="mt-1 text-xs font-extrabold text-foreground">{feature.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Auth Form (Right Side) */}
          <div className="flex flex-col justify-center lg:px-4">
            <Card className="border-none p-6 shadow-none ring-0 sm:p-10 lg:bg-transparent lg:shadow-none lg:ring-0">
              <Outlet />
            </Card>
            
            {/* Subtle Footer for Auth Side */}
            <div className="mt-8 px-10 text-center text-xs text-muted-foreground/40 lg:text-left">
              &copy; 2026 Gemini Systems. All rights reserved. 
              <span className="mx-2">|</span>
              <button className="hover:text-primary transition-colors">Privacy</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}