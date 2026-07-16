"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import { 
  Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft, Send, 
  CheckCircle2, ChevronLeft, User, MessageSquare, ArrowRight 
} from "lucide-react";
import { resendVerificationEmail } from "@/lib/actions/verification";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<"EMAIL" | "PASSWORD" | "LINKING">("EMAIL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isLinkIntent, setIsLinkIntent] = useState(false);
  const [linkAgreed, setLinkAgreed] = useState(false);
  const [googleVerifyPending, setGoogleVerifyPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const linkParam = params.get("link");
    const errorParam = params.get("error");
    if (emailParam) {
      setEmail(emailParam);
      setCurrentStep("PASSWORD");
    }
    if (linkParam === "true") {
      setIsLinkIntent(true);
    }
    // AccessDenied = Google sign-in blocked because email not verified yet
    if (errorParam === "AccessDenied") {
      setGoogleVerifyPending(true);
    }
  }, []);

  async function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setCurrentStep("PASSWORD");
  }

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
    } catch (error) {
      toast.error("An unexpected error occurred.");
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
    
    // Simulate linking process with the specific message requested
    setTimeout(() => {
      toast.success("Accounts successfully linked!");
      window.location.href = "/dashboard";
    }, 2500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        if (result.error.includes("verify your email")) {
          toast.error(result.error, {
            action: {
              label: "Resend Email",
              onClick: () => handleResendEmail(),
            },
            duration: 10000,
          });
        } else if (result.error === "CredentialsSignin" || result.error.includes("CredentialsSignin")) {
          toast.error("Invalid email, username or password.");
        } else {
          toast.error(result?.error || "Invalid credentials, please check your email and password.");
        }
      } else {
        // If coming from "Link Account" flow, transition to the linking confirmation step
        if (isLinkIntent) {
          setCurrentStep("LINKING");
          setLoading(false);
          return;
        }

        // Standard flow: Fetch session and redirect
        let session = await getSession();
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 500));
          session = await getSession();
        }
        
        if (session?.user?.role === "SUPERADMIN") {
          toast.success("Welcome, Super Admin");
          window.location.href = "/super-admin";
        } else {
          toast.success("Login successful");
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred during login.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 sm:p-8 relative">
      
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to website
      </Link>

      {/* Branding Header */}
      <Link href="/" className="mb-10 flex flex-col items-center gap-4 group">
         <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <User className="h-6 w-6 text-white" />
         </div>
         <div className="text-center">
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Protech <span className="text-indigo-600">Enterprise</span></span>
         </div>
      </Link>

      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 relative">

        {/* Google Email Verification Pending Banner */}
        {googleVerifyPending && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-black text-sm text-amber-800 dark:text-amber-300">Check your email!</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  Your Google account has been registered. Please click the verification link we sent to your email before signing in.
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:text-amber-900 disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === "EMAIL" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-2">Sign in to your Protech Enterprise account</p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Email or Username</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-200 text-base focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      placeholder="name@company.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm transition-all"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {currentStep === "PASSWORD" && (
            <motion.div
              key="password-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Enter password</h2>
                <p className="text-slate-500 text-sm mt-2">Please verify your credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Preview */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 group">
                   <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                         {email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{email}</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Personal Account</p>
                      </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setCurrentStep("EMAIL")}
                     className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 shrink-0 transition-all"
                   >
                     Change
                   </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-sm text-slate-700 dark:text-slate-300">Password</Label>
                    <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                       Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 pr-12 rounded-xl bg-slate-50 border-slate-200 text-base focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all"
                      placeholder="••••••••"
                      required
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                   <button type="button" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                      Sign in using Email OTP
                   </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm transition-all"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </motion.div>
          )}

          {currentStep === "LINKING" && (
            <motion.div
              key="linking-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight">Link Accounts</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic text-center">Your Google account will be linked to your Protech account.</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protech Account</p>
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{email}</p>
                 </div>

                 <div className="h-px bg-indigo-100" />

                 <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Account</p>
                       <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={14} height={14} />
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{email}</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-start gap-3 px-2">
                    <Checkbox 
                      id="link-agree" 
                      checked={linkAgreed} 
                      onCheckedChange={(checked: any) => setLinkAgreed(checked as boolean)}
                      className="mt-1 rounded-md border-indigo-200" 
                    />
                    <Label htmlFor="link-agree" className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                      I agree to link my Google account <span className="text-indigo-600 font-black">{email}</span> with my Protech account.
                    </Label>
                 </div>

                 <div className="flex flex-col gap-4">
                    <Button 
                      onClick={handleFinalLink}
                      disabled={loading || !linkAgreed}
                      className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Link"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentStep("PASSWORD")}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600"
                    >
                      Cancel
                    </Button>
                 </div>
              </div>

              {loading && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse"
                >
                  Please wait while we make everything perfect for you...
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep !== "LINKING" && (
          <div className="mt-8 flex flex-col gap-6 items-center">
             <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                   <span className="bg-white dark:bg-slate-900 px-4 text-slate-500">Or continue with</span>
                </div>
             </div>
             
             <div className="flex gap-4 w-full">
                <Button 
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-sm font-semibold flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                   <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} /> Google
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-sm font-semibold flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                   <Lock className="h-4 w-4 text-slate-400" /> LinkedIn
                </Button>
             </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center space-y-4">
         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            © 2026 PROTECH ASSIST (SL) LIMITED. All rights reserved.
         </p>
         <div className="flex justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/super-admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Super Admin Node</Link>
         </div>
      </footer>
    </div>
  );
}
