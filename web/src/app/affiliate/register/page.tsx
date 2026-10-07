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
    toast.success("Affiliate code copied to clipboard!");
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

  // Success View on White Background
  if (registeredCode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-md shadow-emerald-100 ring-8 ring-emerald-50/80">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Application Received
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome to ProTech Assist SL!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your affiliate partner profile has been registered in the ProTech core database.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 shadow-inner">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Your Permanent Partner Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-emerald-700">
                {registeredCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition border border-slate-200 shadow-sm"
                title="Copy Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Status: Pending Administrator Verification
            </div>
          </div>

          <p className="text-xs text-slate-600 text-left leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            Our partner review team verifies new applications within <strong>24 business hours</strong>. Once activated, you will receive a notification email and can sign in to your Partner Portal, generate tracked campaign links, and withdraw earnings.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              Sign In to Partner Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition text-xs border border-slate-200 shadow-sm"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header / Brand Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide shadow-sm">
            <Award className="w-4 h-4 text-emerald-600" /> ProTech Assist SL Limited &bull; Official Partner Program
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Partner with Sierra Leone&apos;s <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              Leading Technology Ecosystem
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            Empower businesses and students across Sierra Leone with Enterprise OS inventory software, AI & Full-Stack masterclasses, and custom web development. Earn up to <strong>15% recurring single-tier commissions</strong> paid directly via Orange Money, Afrimoney, or Bank Transfer.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
              Strictly Single-Level (No MLM)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
              30-Day Attribution Window
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
              Weekly Disbursements
            </span>
          </div>
        </div>

        {/* 3 Executive Benefit Cards in White */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Up to 15% Commission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn generous percentage payouts on monthly and annual SaaS software licenses, high-ticket training cohorts, and corporate contracts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Orange & Afrimoney Cashouts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No overseas bank delays. Withdraw your approved earnings straight to your Orange Money or Afrimoney mobile phone, or local commercial banks.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">30-Day Auto Attribution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When someone clicks your referral link, our server locks your tracking cookie for 30 full days. If they subscribe later, you get full credit.
            </p>
          </div>
        </div>

        {/* Main Application Container - Clean White Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 space-y-8">
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Affiliate Partner Application
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please complete the form accurately. Information is verified before account activation.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                100% Free to Join
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Personal & Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-emerald-600/20">
                  1
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Personal & Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Legal Name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Mohamed Sesay"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. mohamed@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Portal Login Password <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Phone Number <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 076 123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    WhatsApp Number (for partner updates)
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={formData.whatsappPhone || ""}
                      onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                      placeholder="e.g. 078 654321"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Freetown, Bo, Kenema, Makeni"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Marketing Channels & Experience */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-emerald-600/20">
                  2
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Marketing Channels & Promotion Plan
                </h3>
              </div>

              <p className="text-xs text-slate-500">
                Select the primary channels where you plan to share ProTech Assist solutions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MARKETING_CHANNELS.map((ch) => {
                  const isChecked = formData.marketingChannels?.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-emerald-50/80 border-emerald-600 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className="text-base">{ch.icon}</span>
                      <span className="flex-1">{ch.label}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Website or Social Profile URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={formData.websiteOrSocial || ""}
                      onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Marketing Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel || "Beginner"}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition shadow-sm"
                  >
                    <option value="Beginner">Beginner (First time doing affiliate marketing)</option>
                    <option value="Intermediate">Intermediate (Experienced with tech & product referrals)</option>
                    <option value="Experienced">Experienced Marketer / Business Consultant / Agency</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Commission Payout Method */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-emerald-600/20">
                  3
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Commission Payout Destination
                </h3>
              </div>

              <p className="text-xs text-slate-500">
                Choose how you want your commissions disbursed (can be changed anytime in portal):
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "ORANGE_MONEY", label: "Orange Money", badge: "Most Popular" },
                  { id: "AFRIMONEY", label: "Afrimoney", badge: "Instant" },
                  { id: "BANK_TRANSFER", label: "Bank Transfer", badge: "Commercial" },
                  { id: "CASH", label: "Head Office Cash", badge: "Freetown" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, payoutMethod: m.id as any })}
                    className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-2 ${
                      formData.payoutMethod === m.id
                        ? "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                      {m.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{m.label}</span>
                  </button>
                ))}
              </div>

              {(formData.payoutMethod === "ORANGE_MONEY" || formData.payoutMethod === "AFRIMONEY") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {formData.payoutMethod === "ORANGE_MONEY" ? "Orange Money" : "Afrimoney"} Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileMoneyNumber || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      placeholder="e.g. 076 123456"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.mobileMoneyName || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                      placeholder="e.g. Mohamed Sesay"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>
              )}

              {formData.payoutMethod === "BANK_TRANSFER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Commercial Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. Rokel Commercial Bank, Ecobank, UBA"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Number (BBAN)</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 003001..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      placeholder="Full legal name on bank statement"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Terms Acceptance */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white shrink-0"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/affiliate/terms"
                    target="_blank"
                    className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 cursor-pointer"
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

            <p className="text-center text-xs text-slate-500">
              Already registered as an approved partner?{" "}
              <Link href="/login" className="text-emerald-700 font-bold hover:underline">
                Sign in to Partner Portal
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
