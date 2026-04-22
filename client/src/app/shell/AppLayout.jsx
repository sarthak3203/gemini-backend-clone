import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { backend } from "../../lib/backend";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

function TopNav() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwInfo, setPwInfo] = useState("");

  const subscriptionTone = useMemo(() => {
    if (!me?.subscription) return "neutral";
    const sub = String(me.subscription).toLowerCase();
    if (sub === "pro") return "pro";
    if (sub === "canceled") return "warning";
    return "neutral";
  }, [me]);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await backend.user.me(token);
        if (!cancelled) setMe(res?.user || null);
      } catch {
        if (!cancelled) setMe(null);
      }
    }
    if (token) loadMe();
    return () => { cancelled = true; };
  }, [token]);

  async function changePassword() {
    setPwError("");
    setPwInfo("");
    setPwLoading(true);
    try {
      await backend.auth.changePassword(token, { password: pw });
      setPwInfo("Password updated successfully.");
      setPw("");
      setTimeout(() => setPwOpen(false), 2000);
    } catch (e) {
      setPwError(e.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo Section */}
          <Link to="/app" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-black text-white shadow-lg shadow-primary/20 ring-1 ring-white/20">
              G
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/70">Console</span>
              <span className="text-sm font-extrabold tracking-tight text-foreground">Gemini Workspace</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-1 sm:flex">
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  isActive ? "bg-background text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/billing"
              className={({ isActive }) =>
                `rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  isActive ? "bg-background text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Billing
            </NavLink>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-2xl border border-border/50 bg-background/50 p-1.5 pl-3 transition-all hover:bg-muted active:scale-95"
            >
              <span className="max-w-[100px] truncate text-xs font-bold text-foreground sm:max-w-[160px]">
                {me?.name || me?.email?.split('@')[0] || "Account"}
              </span>
              <Badge tone={subscriptionTone} className="h-6 scale-90">
                {me?.subscription || "Basic"}
              </Badge>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
                <Card className="absolute right-0 mt-3 w-64 overflow-hidden border-none p-1.5 shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Authenticated as</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{me?.email || "-"}</p>
                  </div>
                  <div className="space-y-1 rounded-2xl bg-muted/30 p-1">
                    <Button variant="ghost" className="h-9 w-full justify-start text-xs font-bold" onClick={() => { setPwOpen(true); setMenuOpen(false); }}>
                      Security Settings
                    </Button>
                    <Button variant="ghost" className="h-9 w-full justify-start text-xs font-bold" onClick={() => { navigate("/billing"); setMenuOpen(false); }}>
                      Plan & Billing
                    </Button>
                    <div className="my-1 h-px bg-border/50" />
                    <Button
                      variant="ghost"
                      className="h-9 w-full justify-start text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => { logout(); navigate("/login"); }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Password Modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-none p-8 shadow-2xl ring-1 ring-border">
            <h3 className="text-xl font-extrabold tracking-tight">Update Security</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enter a new secure password for your workspace account.
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                <Input
                  type="password"
                  autoFocus
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="h-12"
                />
              </div>

              {pwError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-bold text-destructive animate-in slide-in-from-top-1">
                  {pwError}
                </div>
              )}
              {pwInfo && (
                <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary animate-in slide-in-from-top-1">
                  {pwInfo}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  className="h-12 flex-1"
                  onClick={() => { setPwOpen(false); setPw(""); setPwError(""); setPwInfo(""); }}
                  disabled={pwLoading}
                >
                  Cancel
                </Button>
                <Button className="h-12 flex-[2]" onClick={changePassword} disabled={!pw || pwLoading}>
                  {pwLoading ? "Saving..." : "Update Password"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}