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
    if (String(me.subscription).toLowerCase() === "pro") return "pro";
    if (String(me.subscription).toLowerCase() === "canceled") return "warning";
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
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function changePassword() {
    setPwError("");
    setPwInfo("");
    setPwLoading(true);
    try {
      await backend.auth.changePassword(token, { password: pw });
      setPwInfo("Password updated.");
      setPw("");
    } catch (e) {
      setPwError(e.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[rgb(var(--border))]/80 bg-[rgb(var(--bg))]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/app" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--primary))] text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
              G
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text-muted))]">Control</div>
              <div className="text-base font-bold tracking-tight">Gemini Console</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-[rgb(var(--text))] shadow-sm"
                    : "text-[rgb(var(--text-muted))] hover:bg-white/70 hover:text-[rgb(var(--text))]"
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/billing"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-[rgb(var(--text))] shadow-sm"
                    : "text-[rgb(var(--text-muted))] hover:bg-white/70 hover:text-[rgb(var(--text))]"
                }`
              }
            >
              Billing
            </NavLink>
          </nav>

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 shadow-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="max-w-[160px] truncate text-sm font-semibold">{me?.name || me?.email || "Account"}</span>
              <Badge tone={subscriptionTone}>{me?.subscription || "Basic"}</Badge>
            </button>

            {menuOpen && (
              <Card className="absolute right-0 mt-2 w-72 p-3" role="menu">
                <div className="px-2 pb-3">
                  <div className="text-xs font-semibold text-[rgb(var(--text-muted))]">Signed in as</div>
                  <div className="mt-1 truncate text-sm font-semibold">{me?.email || "-"}</div>
                </div>
                <div className="space-y-1 border-t border-[rgb(var(--border))] pt-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setPwOpen(true)}>
                    Change password
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/billing");
                    }}
                  >
                    Billing
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[rgb(var(--danger))]"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </header>

      {pwOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold tracking-tight">Change password</h3>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
              This calls the backend route `POST /auth/change-password`.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-[rgb(var(--text-muted))]">New password</label>
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Choose a strong password"
              />
            </div>

            {pwError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {pwError}
              </div>
            )}
            {pwInfo && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {pwInfo}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setPwOpen(false);
                  setPw("");
                  setPwError("");
                  setPwInfo("");
                }}
                disabled={pwLoading}
              >
                Cancel
              </Button>
              <Button className="w-full" onClick={changePassword} disabled={!pw || pwLoading}>
                {pwLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
