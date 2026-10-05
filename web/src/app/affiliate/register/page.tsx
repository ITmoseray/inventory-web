"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Share2,
  Users,
  Smartphone,
  Building,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  Award,
  MapPin,
  Check,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { registerAffiliate, AffiliateRegistrationInput } from "@/lib/actions/affiliate";

const MARKETING_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Status & Groups", icon: "💬" },
  { id: "facebook", label: "Facebook & Instagram Pages", icon: "📱" },
  { id: "tiktok", label: "TikTok & Video Content", icon: "🎬" },
  { id: "linkedin", label: "LinkedIn & Corporate B2B", icon: "💼" },
  { id: "word_of_mouth", label: "Direct In-Person Pitching (Retail Shops & Pharmacies)", icon: "🤝" },
  { id: "student_groups", label: "Universities, Colleges & Tech Hubs", icon: "🎓" },
  { id: "corporate", label: "Chamber of Commerce & SME Networks", icon: "🏢" },
];

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [formData, setFormData] = useState<AffiliateRegistrationInput>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    whatsappPhone: "",
    country: "Sierra Leone",
    city: "Freetown",
    marketingChannels: ["whatsapp", "facebook"],
    websiteOrSocial: "",
    preferredMethod: "Social Media & WhatsApp",
    experienceLevel: "Beginner",
    payoutMethod: "ORANGE_MONEY",
    mobileMoneyNumber: "",
    mobileMoneyName: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankSwiftOrBranch: "",
    agreedToTerms: false,
  });

  const toggleChannel = (channelId: string) => {
    const current = formData.marketingChannels || [];
    if (current.includes(channelId)) {
      setFormData({
        ...formData,
        marketingChannels: current.filter((c) => c !== channelId),
      });
    } else {
      setFormData({
        ...formData,
        marketingChannels: [...current, channelId],
      });
    }
  };

  const handleCopyCode = () => {
    if (!registeredCode) return;
    navigator.clipboard.writeText(registeredCode);
    setCopiedCode(true);
    toast.success("Affiliate code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required personal contact details.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error("You must review and agree to the ProTech Affiliate Agreement to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerAffiliate(formData);
      if (res.success && res.affiliateCode) {
        setRegisteredCode(res.affiliateCode);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (registeredCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-950/60 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Application Received
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to ProTech Assist SL!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Your affiliate partner profile has been registered in the ProTech core database.
            </p>
          </div>

          <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Your Permanent Partner Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-emerald-400">
                {registeredCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium">
              <Info className="w-3 h-3 shrink-0" /> Status: Pending Administrator Verification
            </div>
          </div>

          <p className="text-xs text-slate-400 text-left leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            Our partner review team verifies new applications within <strong>24 business hours</strong>. Once activated, you can sign in to your Partner Portal, generate tracked campaign links, download marketing flyers, and withdraw commissions.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
            >
              Sign In to Partner Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl transition text-xs border border-slate-700"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header / Brand Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold tracking-wide shadow-md shadow-emerald-950/40">
            <Award className="w-4 h-4" /> ProTech Assist SL Limited &bull; Official Partner Program
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Partner with Sierra Leone&apos;s <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Leading Technology Ecosystem
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Empower businesses and students across Sierra Leone with Enterprise OS inventory software, AI & Full-Stack masterclasses, and custom web development. Earn up to <strong>15% recurring single-tier commissions</strong> paid directly via Orange Money, Afrimoney, or Bank Transfer.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Strictly Single-Level (No MLM)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 30-Day Attribution Window
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Weekly Disbursements
            </span>
          </div>
        </div>

        {/* 3 Executive Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Up to 15% Commission</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn generous percentage payouts on monthly and annual SaaS software licenses, high-ticket training cohorts, and corporate contracts.
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Orange & Afrimoney Cashouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No overseas bank delays. Withdraw your approved earnings straight to your Orange Money or Afrimoney mobile phone, or local commercial banks.
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">30-Day Auto Attribution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When someone clicks your referral link, our server locks your tracking cookie for 30 full days. If they subscribe later, you get full credit.
            </p>
          </div>
        </div>

        {/* Main Application Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Affiliate Partner Application
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Please complete the form accurately. Information is verified before account activation.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                100% Free to Join
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Personal & Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Personal & Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Legal Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Mohamed Sesay"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. mohamed@example.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Portal Login Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Primary Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 076 123456"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp Number (for partner updates)
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={formData.whatsappPhone || ""}
                      onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                      placeholder="e.g. 078 654321"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Freetown, Bo, Kenema, Makeni"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Marketing Channels & Experience */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Marketing Channels & Promotion Plan
                </h3>
              </div>

              <p className="text-xs text-slate-400">
                Select the primary channels where you plan to share ProTech Assist solutions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MARKETING_CHANNELS.map((ch) => {
                  const isChecked = formData.marketingChannels?.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm shadow-emerald-950"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-base">{ch.icon}</span>
                      <span className="flex-1">{ch.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Website or Social Profile URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={formData.websiteOrSocial || ""}
                      onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Marketing Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel || "Beginner"}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="Beginner">Beginner (First time doing affiliate marketing)</option>
                    <option value="Intermediate">Intermediate (Experienced with tech & product referrals)</option>
                    <option value="Experienced">Experienced Marketer / Business Consultant / Agency</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Commission Payout Method */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Commission Payout Destination
                </h3>
              </div>

              <p className="text-xs text-slate-400">
                Choose how you want your commissions disbursed (can be changed anytime in portal):
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "ORANGE_MONEY", label: "Orange Money", badge: "Most Popular", color: "from-orange-500/20 to-orange-600/5" },
                  { id: "AFRIMONEY", label: "Afrimoney", badge: "Instant", color: "from-red-500/20 to-red-600/5" },
                  { id: "BANK_TRANSFER", label: "Bank Transfer", badge: "Commercial", color: "from-blue-500/20 to-blue-600/5" },
                  { id: "CASH", label: "Head Office Cash", badge: "Freetown", color: "from-emerald-500/20 to-emerald-600/5" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, payoutMethod: m.id as any })}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-2 ${
                      formData.payoutMethod === m.id
                        ? "bg-slate-900 border-emerald-500 text-white ring-2 ring-emerald-500/20 shadow-md shadow-emerald-950"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      {m.badge}
                    </span>
                    <span className="text-xs font-bold text-white">{m.label}</span>
                  </button>
                ))}
              </div>

              {(formData.payoutMethod === "ORANGE_MONEY" || formData.payoutMethod === "AFRIMONEY") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {formData.payoutMethod === "ORANGE_MONEY" ? "Orange Money" : "Afrimoney"} Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileMoneyNumber || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      placeholder="e.g. 076 123456"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.mobileMoneyName || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                      placeholder="e.g. Mohamed Sesay"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {formData.payoutMethod === "BANK_TRANSFER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Commercial Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. Rokel Commercial Bank, Ecobank, UBA"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Number (BBAN)</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 003001..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      placeholder="Full legal name on bank statement"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Terms Acceptance */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 shrink-0"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/affiliate/terms"
                    target="_blank"
                    className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    ProTech Assist Affiliate & Referral Partner Agreement <ExternalLink className="w-3 h-3" />
                  </Link>
                  . I confirm that commissions are credited only on verified customer sales, self-referrals are prohibited, and spamming or misleading advertising is strictly grounds for immediate termination.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? (
                  "Verifying & Submitting Application..."
                ) : (
                  <>
                    Submit Official Partner Application <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              Already registered as an approved partner?{" "}
              <Link href="/login" className="text-emerald-400 font-bold hover:underline">
                Sign in to Partner Portal
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
