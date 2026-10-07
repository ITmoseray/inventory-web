"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  DollarSign,
  Smartphone,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Save,
  Send,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAffiliateDashboardStats,
  getAffiliatePayouts,
  requestPayout,
  updateAffiliatePayoutSettings,
} from "@/lib/actions/affiliate";

export default function AffiliatePayoutsPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Request Payout State
  const [payoutAmount, setPayoutAmount] = useState<string>("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Payment Settings Form
  const [paymentSettings, setPaymentSettings] = useState({
    payoutMethod: "ORANGE_MONEY",
    mobileMoneyNumber: "",
    mobileMoneyName: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankSwiftOrBranch: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dashRes, payoutsRes] = await Promise.all([
        getAffiliateDashboardStats(),
        getAffiliatePayouts(),
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes);
        const aff = dashRes.affiliate;
        setPaymentSettings({
          payoutMethod: aff.payoutMethod || "ORANGE_MONEY",
          mobileMoneyNumber: aff.mobileMoneyNumber || "",
          mobileMoneyName: aff.mobileMoneyName || "",
          bankName: aff.bankName || "",
          bankAccountNumber: aff.bankAccountNumber || "",
          bankAccountName: aff.bankAccountName || "",
          bankSwiftOrBranch: aff.bankSwiftOrBranch || "",
        });
      }

      if (payoutsRes.success) {
        setPayouts(payoutsRes.payouts || []);
      }
    } catch (e) {
      toast.error("Failed to load payout details");
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateAffiliatePayoutSettings(paymentSettings as any);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (e: any) {
      toast.error("Failed to update payout settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount to withdraw");
      return;
    }

    setRequesting(true);
    try {
      const res = await requestPayout(amount);
      if (res.success) {
        toast.success(res.message);
        setShowRequestModal(false);
        setPayoutAmount("");
        loadData();
      } else {
        toast.error(res.error || "Payout request failed");
      }
    } catch (e: any) {
      toast.error("Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  const availableBalance = dashboardData?.kpis?.availableBalance || 0;
  const pendingAmount = dashboardData?.kpis?.pendingAmount || 0;
  const paidAmount = dashboardData?.kpis?.paidAmount || 0;

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Fast Local Withdrawals
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Earnings Payouts & Banking Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Request commission withdrawals directly to your Orange Money, Afrimoney, or Commercial Bank BBAN account. Payouts are verified and disbursed promptly.
        </p>
      </div>

      {/* 3 Financial Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available for Withdrawal */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available to Withdraw
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            NLe {availableBalance.toFixed(2)}
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            disabled={availableBalance <= 0}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Request Cashout
          </button>
        </div>

        {/* Pending Verification */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Admin Verification
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            NLe {pendingAmount.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Lock-in period for order verification
          </p>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Withdrawn (All-Time)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            NLe {paidAmount.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Successfully disbursed to your mobile/bank
          </p>
        </div>
      </div>

      {/* Payment Destination Setup Form */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Payout Destination Account Settings
            </h2>
            <p className="text-xs text-slate-500">
              Update where your requested earnings are sent across Sierra Leone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "ORANGE_MONEY", label: "Orange Money", badge: "Most Popular" },
              { id: "AFRIMONEY", label: "Afrimoney", badge: "Instant" },
              { id: "BANK_TRANSFER", label: "Bank Transfer", badge: "Commercial Bank" },
              { id: "CASH", label: "Head Office Cash", badge: "Freetown" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentSettings({ ...paymentSettings, payoutMethod: m.id as any })}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-between gap-2 cursor-pointer ${
                  paymentSettings.payoutMethod === m.id
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

          {(paymentSettings.payoutMethod === "ORANGE_MONEY" ||
            paymentSettings.payoutMethod === "AFRIMONEY") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {paymentSettings.payoutMethod === "ORANGE_MONEY" ? "Orange Money" : "Afrimoney"} Number
                </label>
                <input
                  type="tel"
                  required
                  value={paymentSettings.mobileMoneyNumber}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, mobileMoneyNumber: e.target.value })
                  }
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
                  required
                  value={paymentSettings.mobileMoneyName}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, mobileMoneyName: e.target.value })
                  }
                  placeholder="e.g. Mohamed Sesay"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>
          )}

          {paymentSettings.payoutMethod === "BANK_TRANSFER" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Commercial Bank Name</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankName}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                  placeholder="e.g. Rokel Commercial Bank, Ecobank, UBA"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Number (BBAN)</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankAccountNumber}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })
                  }
                  placeholder="e.g. 003001..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankAccountName}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, bankAccountName: e.target.value })
                  }
                  placeholder="Full legal name on bank statement"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {savingSettings ? "Saving..." : "Save Payout Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
          Withdrawal Requests History
        </h2>

        {payouts.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
            <Wallet className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No withdrawal requests yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Once your commissions are approved and exceed the minimum threshold, click &quot;Request Cashout&quot; above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Request Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-slate-900 text-sm">
                      NLe {(Number(p.amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600 uppercase">
                      {p.method}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      {p.transactionRef || "—"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : p.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cashout Request Modal in White */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Request Commission Cashout</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available Balance: <strong className="text-emerald-700 font-mono">NLe {availableBalance.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Withdrawal Amount (NLe)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={availableBalance}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={`Max: ${availableBalance.toFixed(0)}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Payout Destination:</span>
                <p className="text-slate-600 font-mono font-semibold">
                  {paymentSettings.payoutMethod} &bull; {paymentSettings.mobileMoneyNumber || paymentSettings.bankAccountNumber || "Saved Account"}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  {requesting ? "Submitting..." : "Confirm Cashout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
