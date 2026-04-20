import { Outlet } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function AuthLayout() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <Card className="relative overflow-hidden p-7 sm:p-10">
          <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-[rgb(var(--accent))]/30 blur-3xl" />
          <div className="absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-[rgb(var(--primary))]/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-[rgb(var(--border))] bg-white/80 px-3 py-1 text-xs font-semibold text-[rgb(var(--text-muted))]">
              Gemini Workspace
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Collaborative AI chat, designed for focus.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[rgb(var(--text-muted))]">
              Sign in with email OTP to access your chatrooms, ask Gemini questions, and manage your subscription in one clean workspace.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[rgb(var(--border))] bg-white/85 p-3">
                <div className="text-xs font-semibold text-[rgb(var(--text-muted))]">Authentication</div>
                <div className="mt-1 text-sm font-semibold">Email OTP</div>
              </div>
              <div className="rounded-xl border border-[rgb(var(--border))] bg-white/85 p-3">
                <div className="text-xs font-semibold text-[rgb(var(--text-muted))]">Chat Layer</div>
                <div className="mt-1 text-sm font-semibold">Rooms + AI responses</div>
              </div>
              <div className="rounded-xl border border-[rgb(var(--border))] bg-white/85 p-3">
                <div className="text-xs font-semibold text-[rgb(var(--text-muted))]">Billing</div>
                <div className="mt-1 text-sm font-semibold">Stripe-powered Pro</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
