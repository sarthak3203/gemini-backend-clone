import { Outlet } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="text-sm font-medium text-[rgb(var(--text-muted))]">Gemini Chat</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Sign in to continue</div>
            <div className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              A minimal workspace to chat, manage rooms, and upgrade to Pro.
            </div>
          </div>
          <Card className="p-6">
            <Outlet />
          </Card>
          <div className="mt-6 text-xs text-[rgb(var(--text-muted))]">
            Light theme UI • Tailwind-only • OTP auth
          </div>
        </div>
      </div>
    </div>
  );
}

