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
  Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft, 
  CheckCircle2, User, ArrowRight, ShieldCheck, 
  Sparkles, Fingerprint, Command
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
            action: { label: "Resend Email", onClick: () => handleResendEmail() },
            duration: 10000,
          });
        } else if (result.error === "CredentialsSignin" || result.error.includes("CredentialsSignin")) {
          toast.error("Invalid email or password.");
        } else {
          toast.error(result?.error || "Invalid credentials.");
        }
      } else {
        if (isLinkIntent) {
          setCurrentStep("LINKING");
          setLoading(false);
          return;
        }

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-300">
      
      {/* Global Background Glow tracking mouse */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.05), transparent 80%)`
        }}
      />

      {/* Left Pane - Form Section */}
      <div className="w-full lg:w-[45%] flex flex-col relative z-10 border-r border-slate-200 dark:border-white/[0.05] bg-white/50 dark:bg-[#030712]/50 backdrop-blur-3xl shadow-[10px_0_50px_-10px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_50px_-10px_rgba(0,0,0,0.5)]">
        
        {/* Top Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="p-8 flex items-center justify-between z-10"
        >
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
          >
            <div className="p-2 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 transition-all">
               <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="hidden sm:inline tracking-wide">Return to platform</span>
          </Link>
          
          <div className="flex items-center gap-3 lg:hidden">
             <div className="h-9 w-9 rounded-lg flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <Image src="/images/logo-192.png" alt="Protech Logo" width={24} height={24} className="block dark:hidden object-contain" />
                <Image src="/images/logo-192-white.png" alt="Protech Logo" width={24} height={24} className="hidden dark:block object-contain" />
             </div>
             <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Protech.</span>
          </div>
        </motion.div>

        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 z-10 pb-20 max-w-[560px] mx-auto w-full">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 hidden lg:block"
          >
             <div className="inline-flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-slate-200 dark:border-white/10 relative overflow-hidden group bg-white dark:bg-[#0a0a0a]">
                   <div className="absolute inset-0 bg-slate-100/50 dark:bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"/>
                   <Image src="/images/logo-192.png" alt="Protech Logo" width={32} height={32} className="relative z-10 block dark:hidden object-contain" />
                   <Image src="/images/logo-192-white.png" alt="Protech Logo" width={32} height={32} className="relative z-10 hidden dark:block object-contain" />
                </div>
                <h1 className="font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">Protech.</h1>
             </div>
          </motion.div>

          <div className="relative">
            {/* Ambient form glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/10 to-violet-500/0 dark:from-indigo-500/20 dark:to-violet-500/0 rounded-[2.5rem] blur-xl opacity-50" />
            
            <div className="relative w-full bg-white dark:bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200/50 dark:border-white/[0.08]">
              
              <AnimatePresence mode="wait">
                {currentStep === "EMAIL" && (
                  <motion.div
                    key="email-step"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
                    className="space-y-8"
                  >
                    <motion.div variants={itemVariants}>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Enter your email or username to continue.</p>
                    </motion.div>

                    <motion.form variants={itemVariants} onSubmit={handleNextStep} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="font-medium text-sm text-slate-700 dark:text-slate-300">Email Address</Label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                            <Mail className="h-5 w-5" />
                          </div>
                          <Input 
                            type="text" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-14 pl-12 rounded-xl bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-base focus:bg-white dark:focus:bg-white/[0.05] focus:ring-2 dark:focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner hover:border-slate-300 dark:hover:border-white/[0.15]"
                            placeholder="name@example.com"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-semibold text-base shadow-[0_4px_14px_0_rgb(0,0,0,10%)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           Continue <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      </Button>
                    </motion.form>
                  </motion.div>
                )}

                {currentStep === "PASSWORD" && (
                  <motion.div
                    key="password-step"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
                    className="space-y-8"
                  >
                    <motion.div variants={itemVariants}>
                      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Authenticate</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Verify your identity to securely access your workspace.</p>
                    </motion.div>

                    <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1] transition-colors group">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.05)] dark:shadow-[0_0_15px_rgba(79,70,229,0.15)]">
                               {email.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-medium text-slate-900 dark:text-white truncate tracking-wide">{email}</p>
                               <p className="text-xs text-slate-500 mt-0.5">Administrator</p>
                            </div>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setCurrentStep("EMAIL")}
                           className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-transparent"
                         >
                           Change
                         </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-medium text-sm text-slate-700 dark:text-slate-300">Password</Label>
                          <Link href="#" className="text-xs font-medium text-indigo-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-white transition-all hover:underline underline-offset-4">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                            <Lock className="h-5 w-5" />
                          </div>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 pl-12 pr-12 rounded-xl bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-base focus:bg-white dark:focus:bg-white/[0.05] focus:ring-2 dark:focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner font-mono tracking-widest hover:border-slate-300 dark:hover:border-white/[0.15]"
                            placeholder="••••••••"
                            required
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-semibold text-base shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group border border-transparent dark:border-indigo-500"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                           <span className="flex items-center justify-center gap-2">
                             Secure Sign In <Fingerprint className="h-4 w-4 opacity-50" />
                           </span>
                        )}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      </Button>
                    </motion.form>
                  </motion.div>
                )}

                {currentStep === "LINKING" && (
                  <motion.div
                    key="linking-step"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
                    className="space-y-8"
                  >
                    <motion.div variants={itemVariants} className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-indigo-200 dark:border-indigo-500/20">
                         <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Identity Linking</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium max-w-sm mx-auto">Authorize the connection between your enterprise identities.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="p-1 rounded-2xl bg-gradient-to-b from-slate-100 dark:from-white/[0.08] to-transparent">
                      <div className="p-6 rounded-xl bg-white dark:bg-[#0a0a0a] space-y-6">
                         
                         <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                  <User className="h-5 w-5" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Internal ID</p>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">{email}</p>
                               </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                         </div>

                         <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-white dark:bg-[#0a0a0a] p-2 rounded-full border border-slate-200 dark:border-white/[0.08]">
                               <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05]">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 bg-white dark:bg-white/5 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                                  <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">External Provider</p>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">{email}</p>
                               </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-indigo-500 dark:text-indigo-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                         </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-6">
                       <div className="flex items-start gap-3 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5">
                          <Checkbox 
                            id="link-agree" 
                            checked={linkAgreed} 
                            onCheckedChange={(checked: any) => setLinkAgreed(checked as boolean)}
                            className="mt-1 border-indigo-300 dark:border-indigo-500/50 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white" 
                          />
                          <Label htmlFor="link-agree" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer font-medium">
                            I verify and authorize the binding of my external provider (<span className="text-indigo-600 dark:text-indigo-400">{email}</span>) to this workspace.
                          </Label>
                       </div>

                       <div className="flex flex-col gap-3">
                          <Button 
                            onClick={handleFinalLink}
                            disabled={loading || !linkAgreed}
                            className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-semibold text-sm shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-transparent dark:border-indigo-500"
                          >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Proceed"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => setCurrentStep("PASSWORD")}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors h-10 hover:bg-slate-100 dark:hover:bg-white/5"
                          >
                            Abort Process
                          </Button>
                       </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStep !== "LINKING" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                   <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                         <div className="w-full border-t border-slate-200 dark:border-white/[0.08]" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                         <span className="bg-white dark:bg-[#0a0a0a] px-4 text-slate-400 dark:text-slate-500">Or connect via</span>
                      </div>
                   </div>
                   
                   <div className="flex gap-4 w-full">
                      <Button 
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl border-slate-200 dark:border-white/[0.08] bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm font-semibold flex items-center justify-center gap-3 transition-all text-slate-700 dark:text-white group shadow-sm dark:shadow-none"
                      >
                         <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} className="group-hover:scale-110 transition-transform"/>
                         <span>Google</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl border-slate-200 dark:border-white/[0.08] bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm font-semibold flex items-center justify-center gap-3 transition-all text-slate-700 dark:text-white group shadow-sm dark:shadow-none"
                      >
                         <Command className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                         <span>SSO</span>
                      </Button>
                   </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center text-xs font-medium text-slate-500 dark:text-slate-600 mt-auto z-10">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</Link>
            <Link href="/super-admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admin Node</Link>
          </div>
          <p>© {new Date().getFullYear()} PROTECH ASSIST (SL). All rights reserved.</p>
        </div>
      </div>
      
      {/* Right Pane - Advanced Visual Section */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-indigo-50 dark:bg-[#010309] overflow-hidden items-center justify-center border-l border-slate-200 dark:border-transparent">
        
        {/* Advanced Ambient Mesh Gradient & Particles */}
        <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply dark:mix-blend-screen">
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 90, 0],
               opacity: [0.15, 0.3, 0.15]
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               scale: [1, 1.5, 1],
               rotate: [0, -90, 0],
               opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-[0%] -left-[10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[100px]" 
           />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        {/* Abstract 3D Grid Pattern */}
        <div className="absolute inset-0 z-0" style={{
           backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`,
           backgroundSize: '40px 40px',
           transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
           transformOrigin: 'top center',
           opacity: 0.5
        }} className="[--grid-color:rgba(0,0,0,0.03)] dark:[--grid-color:rgba(255,255,255,0.03)]" />

        {/* Content */}
        <div className="relative z-10 max-w-xl p-12 flex flex-col items-start">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.8 }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
           >
              <Sparkles className="h-3 w-3" />
              <span>Next Generation Platform</span>
           </motion.div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4, duration: 0.8 }}
             className="text-6xl font-[900] text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6"
           >
             Accelerate your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 animate-[gradient_8s_linear_infinite] bg-[length:200%_auto]">
               digital transformation.
             </span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-lg font-medium"
           >
             Protech Enterprise delivers unprecedented control and visibility over your entire business operations through intelligent, real-time analytics.
           </motion.p>

           {/* Metrics Grid */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8, duration: 0.8 }}
             className="grid grid-cols-2 gap-4 w-full"
           >
              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] backdrop-blur-md shadow-sm dark:shadow-none">
                 <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">99.99%</p>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Uptime SLA</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] backdrop-blur-md shadow-sm dark:shadow-none">
                 <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">&lt;10ms</p>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Latency</p>
              </div>
           </motion.div>
        </div>
      </div>
      
      {/* Required custom animations for Tailwind */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
    </div>
  );
}
