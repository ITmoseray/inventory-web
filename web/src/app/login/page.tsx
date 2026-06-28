"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    // Check if email is passed in URL from register page or link dialog
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const linkParam = params.get("link");
    if (emailParam) {
      setEmail(emailParam);
      setCurrentStep("PASSWORD");
    }
    if (linkParam === "true") {
      setIsLinkIntent(true);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 sm:p-8">
      
      {/* Branding Header */}
      <Link href="/" className="mb-12 flex flex-col items-center gap-4 group">
         <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            <User className="h-7 w-7 text-white" />
         </div>
         <div className="text-center">
            <span className="font-black text-3xl tracking-tighter text-slate-900 dark:text-white">Protech <span className="text-indigo-600 italic">Assist</span></span>
         </div>
      </Link>

      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-14 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 relative">
        
        <AnimatePresence mode="wait">
          {currentStep === "EMAIL" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight">Sign in</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">to access Inventory intelligence</p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-8">
                <div className="space-y-2">
                  <Label className="font-black text-[9px] uppercase tracking-[0.3em] text-slate-400 ml-1">Email or Username</Label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      type="text" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-16 pl-14 rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all"
                      placeholder="Email or Username"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Next Step <ArrowRight className="ml-3 h-5 w-5" />
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
              className="space-y-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-tight">Authorize</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">verify your credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* User Preview Node */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 group">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                         {email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Account Node</p>
                         <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[180px]">{email}</p>
                      </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setCurrentStep("EMAIL")}
                     className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-3 py-2 rounded-lg hover:bg-white transition-all"
                   >
                     Change
                   </button>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[9px] uppercase tracking-[0.3em] text-slate-400 ml-1">Secure Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-16 pl-14 pr-14 rounded-2xl bg-slate-50 border-slate-100 text-lg font-bold focus:ring-4 focus:ring-indigo-600/10 transition-all"
                      placeholder="••••••••"
                      required
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                   <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                      Sign in using email OTP
                   </button>
                   <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                      Forgot Password?
                   </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Authorize & Sign In"}
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
          <div className="mt-12 flex flex-col gap-6 items-center">
             <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                   <span className="bg-white dark:bg-slate-900 px-4 text-slate-300">Fast Connect</span>
                </div>
             </div>
             
             <div className="flex gap-4 w-full">
                <Button 
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest flex gap-2"
                >
                   <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={14} height={14} /> Google
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest flex gap-2">
                   <Lock className="h-3.5 w-3.5 text-slate-300" /> LinkedIn
                </Button>
             </div>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center space-y-4">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">
            © 2026 PROTECH ASSIST (SL) LIMITED. ALL RIGHTS RESERVED.
         </p>
         <div className="flex justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link href="/super-admin" className="text-indigo-600 hover:text-indigo-700">Super Admin Node</Link>
         </div>
      </footer>
    </div>
  );
}
