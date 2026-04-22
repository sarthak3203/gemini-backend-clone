import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { backend } from "../../lib/backend";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phase, setPhase] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const passwordsMismatch =
    phase === "reset" &&
    confirmPassword.trim().length > 0 &&
    password !== confirmPassword;

  const canSend = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const canReset = useMemo(
    () =>
      /\S+@\S+\.\S+/.test(email.trim()) &&
      otp.trim().length >= 4 &&
      password.length >= 6 &&
      password === confirmPassword,
    [email, otp, password, confirmPassword]
  );

  async function sendResetOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await backend.auth.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setPhase("reset");
      setInfo(res?.message || "OTP sent successfully");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Both passwords should match");
      return;
    }

    setLoading(true);
    try {
      const res = await backend.auth.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      setInfo(res?.message || "Password reset successfully");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      navigate("/login", { replace: true });
    } catch (e) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.7 1.5-1.7 1.5-2.7 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 .6.1 1.1.4 1.5l-5 5v3h3l1.5-1.5M15 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /></svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {phase === "email" ? "Forgot password?" : "Verify your identity"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {phase === "email"
            ? "No worries, we'll send you reset instructions."
            : `We've sent a code to ${email}`}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter your email"
            disabled={phase === "reset" || loading}
            className="h-11 shadow-sm transition-all focus:ring-2"
          />
        </div>

        {phase === "reset" && (
          <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">OTP Code</label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                disabled={loading}
                className="h-11 text-center font-mono text-lg tracking-[0.3em]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  className="h-11 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 my-auto h-fit text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Confirm New Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                  className="h-11 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  disabled={loading}
                  className="absolute inset-y-0 right-3 my-auto h-fit text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs font-medium text-destructive">
                  Both passwords should match
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || info) && (
        <div className={`mt-4 rounded-lg border p-3 text-sm flex items-center gap-2 ${
          error ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
        }`}>
          {error ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          )}
          {error || info}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {phase === "email" ? (
          <Button
            onClick={sendResetOtp}
            disabled={!canSend || loading}
            className="h-11 w-full text-sm font-semibold"
          >
            {loading ? "Sending..." : "Send Reset OTP"}
          </Button>
        ) : (
          <>
            <Button
              onClick={resetPassword}
              disabled={!canReset || loading}
              className="h-11 w-full text-sm font-semibold"
            >
              {loading ? "Resetting..." : "Update Password"}
            </Button>
            <button
              onClick={() => {
                setPhase("email");
                setOtp("");
                setPassword("");
                setConfirmPassword("");
                setShowPassword(false);
                setShowConfirmPassword(false);
                setError("");
                setInfo("");
              }}
              disabled={loading}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Didn't get the code? Click to go back
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}
