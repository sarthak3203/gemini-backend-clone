import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../../lib/api";
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
        const res = await apiRequest("/user/me", { token });
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
      await apiRequest("/auth/change-password", { method: "POST", token, data: { password: pw } });
      setPwInfo("Password updated.");
      setPw("");
    } catch (e) {
      setPwError(e.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="sticky top-0 z-20 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/app" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[rgb(var(--muted))] text-sm font-semibold">
            G
          </div>
          <div className="text-sm font-semibold tracking-tight">Gemini Chat</div>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="mr-2 hidden items-center gap-1 text-sm sm:flex">
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${
                  isActive ? "bg-[rgb(var(--muted))] text-[rgb(var(--text))]" : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                }`
              }
            >
              Chat
            </NavLink>
            <NavLink
              to="/billing"
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 ${
                  isActive ? "bg-[rgb(var(--muted))] text-[rgb(var(--text))]" : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
                }`
              }
            >
              Billing
            </NavLink>
          </nav>
          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-md border border-[rgb(var(--border))] bg-white px-3 py-1.5 text-sm hover:bg-[rgb(var(--muted))]"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="max-w-[140px] truncate font-medium">{me?.name || me?.mobile || "Account"}</span>
              <Badge tone={subscriptionTone}>{me?.subscription || "Basic"}</Badge>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl border border-[rgb(var(--border))] bg-white shadow-lg"
                role="menu"
              >
                <div className="px-4 py-3">
                  <div className="text-xs font-medium text-[rgb(var(--text-muted))]">Signed in as</div>
                  <div className="mt-1 text-sm font-semibold">{me?.mobile || "—"}</div>
                  <div className="mt-2 text-xs text-[rgb(var(--text-muted))]">Subscription</div>
                  <div className="mt-1">
                    <Badge tone={subscriptionTone}>{me?.subscription || "Basic"}</Badge>
                  </div>
                </div>
                <div className="border-t border-[rgb(var(--border))] p-2">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {pwOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-6" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Change password</div>
                <div className="mt-1 text-sm text-[rgb(var(--text-muted))]">Updates your password for this account.</div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setPwOpen(false);
                  setPwError("");
                  setPwInfo("");
                }}
              >
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-[rgb(var(--text-muted))]">New password</label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
            </div>

            {pwError && <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{pwError}</div>}
            {pwInfo && <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{pwInfo}</div>}

            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="w-full" onClick={() => setPwOpen(false)} disabled={pwLoading}>
                Cancel
              </Button>
              <Button className="w-full" onClick={changePassword} disabled={!pw || pwLoading}>
                {pwLoading ? "Updating…" : "Update"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[rgb(var(--surface))]">
      <TopNav />
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
}

