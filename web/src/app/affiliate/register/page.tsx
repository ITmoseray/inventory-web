"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Brain,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Share2,
  Users,
  Smartphone,
  Building,
  HelpCircle,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { registerAffiliate, AffiliateRegistrationInput } from "@/lib/actions/affiliate";

const MARKETING_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Status & Groups" },
  { id: "facebook", label: "Facebook & Instagram" },
  { id: "tiktok", label: "TikTok & YouTube" },
  { id: "linkedin", label: "LinkedIn & Professional Networks" },
  { id: "word_of_mouth", label: "In-Person Word-of-Mouth & Retail Clients" },
  { id: "student_groups", label: "University, Colleges & Tech Hubs" },
  { id: "corporate", label: "Corporate & SME Business Networking" },
];

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);

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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
              Application Submitted
            </span>
            <h2 className="text-2xl font-extrabold text-white">Welcome to ProTech Assist!</h2>
            <p className="text-sm text-slate-300">
              Your affiliate application has been securely recorded.
            </p>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
            <p className="text-xs text-slate-400 font-medium">Assigned Permanent Affiliate Code</p>
            <div className="text-2xl font-mono font-bold tracking-wider text-emerald-400">
              {registeredCode}
            </div>
            <p className="text-xs text-amber-400/90 font-medium pt-1">
              Status: <span className="underline">Pending Admin Review</span>
            </p>
          </div>

          <p className="text-xs text-slate-400 text-left leading-relaxed">
            Our administration team will review your application within 24 business hours. Once approved, you can log in to your Affiliate Dashboard to generate referral links, access marketing materials, and begin earning commissions.
          </p>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              Go to Account Login <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Return to ProTech Assist Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header / Brand Banner */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold tracking-wide">
            <Award className="w-4 h-4" /> ProTech Assist SL Limited &bull; Affiliate Program
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Earn by Sharing <span className="text-emerald-400">Sierra Leone&apos;s Best Tech</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300">
            Promote our Enterprise OS inventory software, AI Masterclasses, Full-Stack engineering training, website development, and mobile apps. Earn up to 15% commissions on verified customer sales.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Up to 15% Commission</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn generous recurring percentage commissions on software subscriptions and high-ticket training cohorts.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Orange & Afrimoney Payouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Withdraw your earnings directly to your Orange Money, Afrimoney, or local commercial bank account.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">30-Day Attribution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-side cookie tracking ensures you receive commission even if the customer completes payment up to 30 days later.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-5">
            <h2 className="text-xl font-bold text-white">Affiliate Partner Application</h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete the form below to apply. ProTech Assist SL strictly operates a professional, single-level referral network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal & Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Legal Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Mohamed Sesay"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. mohamed@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Portal Login Password <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +232 76 000 000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Number (for affiliate updates)
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappPhone || ""}
                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                    placeholder="e.g. +232 78 000 000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Freetown, Bo, Kenema, Makeni"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Marketing Channels & Experience */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> 2. Marketing Methods & Channels
              </h3>
              <p className="text-xs text-slate-400">
                Where and how do you plan to promote ProTech Assist software and services?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MARKETING_CHANNELS.map((ch) => {
                  const isChecked = formData.marketingChannels?.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? "bg-emerald-950/40 border-emerald-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                      />
                      {ch.label}
                    </label>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Website or Social Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.websiteOrSocial || ""}
                    onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Marketing Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel || "Beginner"}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner (First time doing affiliate marketing)</option>
                    <option value="Intermediate">Intermediate (Have referred tech products or courses before)</option>
                    <option value="Experienced">Experienced Marketer / Agency / Influencer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Payout Setup */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> 3. Preferred Commission Payout Method
              </h3>
              <p className="text-xs text-slate-400">
                You can change this later in your Affiliate Portal settings at any time.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "ORANGE_MONEY", label: "Orange Money" },
                  { id: "AFRIMONEY", label: "Afrimoney" },
                  { id: "BANK_TRANSFER", label: "Bank Transfer" },
                  { id: "CASH", label: "Head Office Cash" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, payoutMethod: m.id as any })}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                      formData.payoutMethod === m.id
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {(formData.payoutMethod === "ORANGE_MONEY" || formData.payoutMethod === "AFRIMONEY") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {formData.payoutMethod === "ORANGE_MONEY" ? "Orange Money" : "Afrimoney"} Number
                    </label>
                    <input
                      type="tel"
                      value={formData.mobileMoneyNumber || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                      placeholder="e.g. 076 123456"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Account Registered Name
                    </label>
                    <input
                      type="text"
                      value={formData.mobileMoneyName || ""}
                      onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                      placeholder="e.g. Mohamed Sesay"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {formData.payoutMethod === "BANK_TRANSFER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Commercial Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. Rokel Commercial Bank, Ecobank, UBA"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Number (BBAN)</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 003001..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName || ""}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      placeholder="Full name as it appears on bank statement"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Terms Acceptance */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I have read, understood, and agree to the{" "}
                  <Link
                    href="/affiliate/terms"
                    target="_blank"
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    ProTech Assist Affiliate & Referral Partner Agreement
                  </Link>
                  . I understand that commissions are earned only on verified qualifying customer purchases, self-referrals are prohibited, and spamming is grounds for immediate deactivation.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-950/50 transition flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {loading ? (
                  "Submitting Application..."
                ) : (
                  <>
                    Submit Affiliate Application <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              Already registered as an approved affiliate?{" "}
              <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign in to Affiliate Portal
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
