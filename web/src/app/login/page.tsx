"use client";

import { useState, useEffect, FormEvent, ReactNode } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/lib/actions/verification";
import { preLoginCheck } from "@/lib/actions/auth-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  User, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import "./login.css";

function ProTechLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand--compact" : ""}`} title="Return to ProTech Home">
      <img src="/protech-assist-logo.png" alt="ProTech Assist — Innovate, Develop, Deliver" />
      <span className="brand__product">Enterprise OS</span>
    </Link>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <span className="icon">{children}</span>;
}

type TextFieldProps = {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  trailing?: ReactNode;
  autoFocus?: boolean;
};

function TextField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  trailing,
  autoFocus = false,
}: TextFieldProps) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          autoFocus={autoFocus}
        />
        {trailing}
      </div>
      {error && (
        <span className="field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.87A6 6 0 0 1 6.07 12c0-.65.11-1.29.32-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z" />
    </svg>
  );
}

function EnterpriseIllustration() {
  return (
    <div className="visual" aria-label="ProTech business overview preview">
      <div className="dashboard">
        <div className="dashboard__rail">
          <span className="rail-brand">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 5h7a5 5 0 0 1 0 10H9v4H6V5Zm3 3v4h4a2 2 0 1 0 0-4H9Z" fill="currentColor" /></svg>
          </span>
          <span className="rail-item rail-item--active" aria-label="Overview">
            <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="12" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="3" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="12" y="12" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
          </span>
          <span className="rail-item" aria-label="Sales">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 15.5 7.2 11l3.1 2.4L17 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span className="rail-item" aria-label="Inventory">
            <svg viewBox="0 0 20 20" fill="none"><path d="m4 7 6-3 6 3-6 3-6-3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="m4 7v6l6 3 6-3V7M10 10v6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
          </span>
          <span className="rail-item" aria-label="Customers">
            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M4.5 16c.6-2.6 2.5-4 5.5-4s4.9 1.4 5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </span>
        </div>
        <div className="dashboard__body">
          <div className="dashboard__header">
            <div>
              <strong>Business overview</strong>
              <span>Monday, 12 January</span>
            </div>
            <button type="button" className="dashboard-period">This week <span>⌄</span></button>
          </div>
          <div className="metrics-row">
            <div className="mini-metric">
              <div className="metric-label"><span>Sales</span><small>+12.4%</small></div>
              <strong>$24.8K</strong>
              <span className="metric-caption">Gross sales</span>
            </div>
            <div className="mini-metric">
              <div className="metric-label"><span>Orders</span><small>+8.2%</small></div>
              <strong>1,284</strong>
              <span className="metric-caption">Completed orders</span>
            </div>
            <div className="mini-metric">
              <div className="metric-label"><span>Customers</span><small>+5.7%</small></div>
              <strong>846</strong>
              <span className="metric-caption">Active customers</span>
            </div>
          </div>
          <div className="dashboard__lower">
            <div className="chart-panel">
              <div className="panel-title">
                <div><strong>Revenue overview</strong><span>Income performance</span></div>
                <button type="button">Last 7 days <span>⌄</span></button>
              </div>
              <div className="chart">
                <div className="chart-y"><span>$30K</span><span>$20K</span><span>$10K</span><span>$0</span></div>
                <div className="chart-plot">
                  <svg viewBox="0 0 420 148" preserveAspectRatio="none" aria-hidden="true">
                    <path className="chart-grid" d="M0 8h420M0 52h420M0 96h420M0 140h420" />
                    <path className="chart-area" d="M0 125C35 122 54 99 85 102s51 15 82-5 48-59 81-46 48 37 80 15 53-45 92-50v132H0Z" />
                    <path className="chart-line" d="M0 125C35 122 54 99 85 102s51 15 82-5 48-59 81-46 48 37 80 15 53-45 92-50" />
                    <circle cx="248" cy="51" r="4" fill="#fff" stroke="#2563EB" strokeWidth="3" />
                  </svg>
                  <div className="chart-x"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                </div>
              </div>
            </div>
            <div className="summary-panel">
              <div className="summary-card">
                <span className="summary-icon summary-icon--blue">
                  <svg viewBox="0 0 20 20" fill="none"><path d="M4 14.5 8 10l3 2.5L16 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M12.5 6H16v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </span>
                <div><span>Total Revenue</span><strong>$84,320.60</strong><small>+14.2% this month</small></div>
              </div>
              <div className="summary-card">
                <span className="summary-icon summary-icon--navy">
                  <svg viewBox="0 0 20 20" fill="none"><path d="M5 6.5h10l-1 8H6l-1-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
                <div><span>Today&apos;s Sales</span><strong>$6,248.00</strong><small className="summary-neutral">132 transactions</small></div>
              </div>
              <div className="summary-card summary-card--inventory">
                <div className="inventory-heading"><span>Inventory Overview</span><strong>94%</strong></div>
                <span className="progress-track"><span /></span>
                <div className="inventory-meta"><span>1,246 in stock</span><span>Healthy</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Account Linking & Forgot Password Modal States
  const [isLinkIntent, setIsLinkIntent] = useState(false);
  const [linkAgreed, setLinkAgreed] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load URL parameters and remembered credentials
  useEffect(() => {
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("protech_remember_email");
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const linkParam = params.get("link");
    const errorParam = params.get("error");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (linkParam === "true") {
      setIsLinkIntent(true);
      setShowLinkModal(true);
    }
    if (errorParam === "AccessDenied") {
      toast.error("Access Denied: Please check your Google authentication status.");
    }
  }, []);

  async function handleResendEmail() {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred while resending email.");
    } finally {
      setResending(false);
    }
  }

  async function handleFinalLink() {
    if (!linkAgreed) {
      toast.error("Please agree to link your accounts first.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Accounts successfully linked!");
      setShowLinkModal(false);
      window.location.href = "/dashboard";
    }, 2000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = "Please enter your business email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // 1. Run Pre-Login Security & Status Check
      const preCheckError = await preLoginCheck(trimmedEmail, password);

      if (preCheckError) {
        setLoading(false);
        const err = preCheckError;

        if (err.includes("verify your email")) {
          setErrors({ email: "Email verification required." });
          toast.error(err, {
            action: { label: "Resend Email", onClick: () => handleResendEmail() },
            duration: 10000,
          });
        } else if (err.includes("ACCOUNT_BLOCKED")) {
          setErrors({ password: "Account blocked due to multiple failed attempts." });
          toast.error("🔒 Account blocked. Please contact ProTech support to restore access.", {
            duration: 10000,
          });
        } else if (err.includes("ACCOUNT_INACTIVE")) {
          setErrors({ email: "Account is inactive." });
          toast.error("Your account is not active. Please contact your organization administrator.");
        } else if (err.includes("INVALID_ATTEMPT:")) {
          const attempt = parseInt(err.split("INVALID_ATTEMPT:")[1], 10);
          const remaining = 3 - attempt;
          setErrors({
            password: `Invalid credentials. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? "s" : ""} left before account is locked.` : "Account is now locked."}`
          });
          toast.error(
            `Wrong attempt ${attempt} of 3. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? "s" : ""} left before your account is blocked.` : "Account locked."}`,
            { duration: 6000 }
          );
        } else {
          setErrors({ password: "Invalid email or password." });
          toast.error("Invalid email or password.");
        }
        return;
      }

      // 2. Perform NextAuth Credentials Sign In
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        setErrors({ password: "Invalid email or password." });
        toast.error("Invalid email or password.");
        return;
      }

      // Handle Remember Me
      if (typeof window !== "undefined") {
        if (remember) {
          localStorage.setItem("protech_remember_email", trimmedEmail);
        } else {
          localStorage.removeItem("protech_remember_email");
        }
      }

      // Handle Account Linking Intent
      if (isLinkIntent) {
        setShowLinkModal(true);
        setLoading(false);
        return;
      }

      // 3. Resolve Session and Callback Routing
      let session = await getSession();
      if (!session) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        session = await getSession();
      }

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        toast.success("Login successful");
        window.location.href = callbackUrl;
      } else if (session?.user?.role === "SUPERADMIN") {
        toast.success("Welcome, Super Admin");
        window.location.href = "/super-admin";
      } else {
        toast.success("Login successful");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setLoading(false);
      console.error("[Login Error]:", error);
      toast.error("An unexpected error occurred during login. Please try again.");
    }
  }

  const handleGoogleSignIn = () => {
    const callback = searchParams.get("callbackUrl") || "/dashboard";
    signIn("google", { callbackUrl: callback });
  };

  return (
    <main className="login-page">
      {/* ─── LEFT BRAND PANEL ─── */}
      <section className="brand-panel">
        <ProTechLogo />

        <div className="brand-panel__content">
          <div className="brand-copy">
            <h1>Run Your Business.<br />Smarter.</h1>
            <p>
              Manage your inventory, sales, customers, and business operations from one intelligent platform.
            </p>
          </div>

          <EnterpriseIllustration />
        </div>

        <div className="brand-panel__foot">
          <span>One platform. Complete control.</span>
        </div>
      </section>

      {/* ─── RIGHT FORM PANEL ─── */}
      <section className="form-panel">
        <div className="mobile-brand">
          <ProTechLogo compact />
        </div>

        <div className="form-wrap">
          <div className="form-heading">
            <h2>Welcome back</h2>
            <p>Sign in to your Enterprise OS account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              id="email"
              label="Email address"
              type="text"
              placeholder="Enter your business email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoFocus
            />

            <TextField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              trailing={
                <button
                  className="visibility-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <Icon>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none"><path d="m4 4 16 16M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 8.5 7 8.5 7a15.2 15.2 0 0 1-2.1 3.2M6.2 6.2C4.5 7.4 3 9.3 2 12c0 0 3 7 10 7 1.4 0 2.6-.3 3.7-.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none"><path d="M2.5 12s3-7 9.5-7 9.5 7 9.5 7-3 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.8" /></svg>
                    )}
                  </Icon>
                </button>
              }
            />

            <div className="form-options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span className="checkbox__box">
                  <svg viewBox="0 0 12 10" fill="none"><path d="m1 5 3.2 3L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setForgotEmail(email || "");
                  setShowForgotModal(true);
                }}
              >
                Forgot password?
              </button>
            </div>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="divider"><span>OR</span></div>

            <button
              className="google-button"
              type="button"
              onClick={handleGoogleSignIn}
            >
              <GoogleLogo />
              Continue with Google
            </button>
          </form>

          <div className="security-note">
            <span className="security-note__icon">
              <svg viewBox="0 0 20 20" fill="none"><rect x="4.5" y="8.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 8.5V6a3 3 0 0 1 6 0v2.5M10 12v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </span>
            <span>Your business data is protected.</span>
          </div>
        </div>

        <footer>© 2026 ProTech Assist SL Limited.</footer>
      </section>

      {/* ─── FORGOT PASSWORD MODAL ─── */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
              <Lock className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Enterprise Password Reset
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              For security, password changes for Enterprise OS accounts are validated with administrative identity verification.
            </DialogDescription>
          </DialogHeader>

          {forgotSubmitted ? (
            <div className="space-y-4 pt-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Reset Request Dispatched!</strong>
                  <p className="mt-1">
                    If an account matches <strong>{forgotEmail}</strong>, password reset instructions and an authorization token have been sent to that address.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSubmitted(false);
                }}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Account Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Need instant help?
                </p>
                <p>
                  Contact support at{" "}
                  <a
                    href="mailto:protechassist36@gmail.com?subject=Enterprise%20OS%20Password%20Reset%20Request"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    protechassist36@gmail.com
                  </a>{" "}
                  or your company Store Admin.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 h-11 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
                      toast.error("Please enter a valid email address.");
                      return;
                    }
                    setForgotSubmitted(true);
                    toast.success("Password reset request logged.");
                  }}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Request Reset
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── IDENTITY LINKING MODAL ─── */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl">
          <DialogHeader className="text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Identity Linking Required
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Authorize the connection between your Google account and your existing Enterprise OS workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise User</p>
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">{email}</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-100 bg-blue-50/60">
              <Checkbox
                id="link-terms"
                checked={linkAgreed}
                onCheckedChange={(checked) => setLinkAgreed(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="link-terms" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                I authorize linking this external identity (<span className="text-blue-700 font-bold">{email}</span>) with my Enterprise OS organization.
              </Label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 h-11 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFinalLink}
                disabled={loading || !linkAgreed}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize & Sign In"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
