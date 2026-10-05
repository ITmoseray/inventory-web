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
    const amount = Number(payoutAmount);
    const available = dashboardData?.kpis?.availableBalance || 0;
    const minThreshold = dashboardData?.kpis?.minPayout || 100;

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }

    if (amount < minThreshold) {
      toast.error(`Minimum withdrawal amount is NLe ${minThreshold}.`);
      return;
    }

    if (amount > available) {
      toast.error(`Requested amount exceeds available balance of NLe ${available.toFixed(2)}.`);
      return;
    }

    setRequesting(true);
    try {
      const res = await requestPayout({
        amount,
        method: paymentSettings.payoutMethod as any,
        accountDetails: paymentSettings,
      });

      if (res.success) {
        toast.success(res.message);
        setShowRequestModal(false);
        setPayoutAmount("");
        loadData();
      } else {
        toast.error(res.error || "Failed to submit payout request");
      }
    } catch (e: any) {
      toast.error("Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  const availableBalance = dashboardData?.kpis?.availableBalance || 0;
  const minPayout = dashboardData?.kpis?.minPayout || 100;
  const isApproved = dashboardData?.affiliate?.status === "APPROVED";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Payouts & Earnings Withdrawal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Withdraw your approved commission earnings directly to Orange Money, Afrimoney, or your commercial bank.
        </p>
      </div>

      {/* Balance Card & Quick Request */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-900/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Available Withdrawable Balance
            </span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="text-3xl sm:text-5xl font-black text-white">
            NLe {availableBalance.toFixed(2)}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 space-y-0.5">
              <p>Minimum payout threshold: <strong className="text-slate-200">NLe {minPayout}.00</strong></p>
              <p>Disbursement: Orange Money, Afrimoney, Bank, or Cash</p>
            </div>

            <button
              onClick={() => {
                if (!isApproved) {
                  toast.error("Your affiliate profile must be approved to request payouts.");
                  return;
                }
                if (availableBalance < minPayout) {
                  toast.error(`Minimum payout balance is NLe ${minPayout}. You currently have NLe ${availableBalance.toFixed(2)}.`);
                  return;
                }
                setPayoutAmount(String(availableBalance));
                setShowRequestModal(true);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Request Payout
            </button>
          </div>
        </div>

        {/* Lifetime Earnings Metric */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Lifetime Paid
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              NLe {(dashboardData?.kpis?.paidCommission || 0).toFixed(2)}
            </div>
          </div>

          <div className="space-y-1 border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="text-lg font-bold text-amber-400">
              NLe {(dashboardData?.kpis?.pendingCommission || 0).toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500">Subject to 14-day clearance terms</p>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Submit Payout Request</h2>
              <p className="text-xs text-slate-400">
                Specify the amount you wish to withdraw to your configured payment method.
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Withdrawal Amount (NLe)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm text-slate-500 font-semibold">NLe</span>
                  <input
                    type="number"
                    step="1"
                    min={minPayout}
                    max={availableBalance}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Min: NLe {minPayout}</span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(availableBalance))}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Withdraw All (NLe {availableBalance.toFixed(2)})
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-slate-400 block font-medium">Selected Destination:</span>
                <p className="font-bold text-white">
                  {paymentSettings.payoutMethod.replace("_", " ")}
                </p>
                {paymentSettings.payoutMethod === "ORANGE_MONEY" || paymentSettings.payoutMethod === "AFRIMONEY" ? (
                  <p className="text-slate-300 font-mono text-[11px]">
                    {paymentSettings.mobileMoneyNumber || "No number configured"} ({paymentSettings.mobileMoneyName || "Unspecified"})
                  </p>
                ) : (
                  <p className="text-slate-300 font-mono text-[11px]">
                    {paymentSettings.bankName} - {paymentSettings.bankAccountNumber}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition disabled:opacity-50"
                >
                  {requesting ? "Submitting..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Destination Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Payout Destination Details</h2>
            <p className="text-xs text-slate-400">Configure where your approved earnings will be sent</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
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
                onClick={() => setPaymentSettings({ ...paymentSettings, payoutMethod: m.id as any })}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                  paymentSettings.payoutMethod === m.id
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(paymentSettings.payoutMethod === "ORANGE_MONEY" || paymentSettings.payoutMethod === "AFRIMONEY") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Money Registered Number
                </label>
                <input
                  type="tel"
                  required
                  value={paymentSettings.mobileMoneyNumber}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, mobileMoneyNumber: e.target.value })
                  }
                  placeholder="e.g. 076 123456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {paymentSettings.payoutMethod === "BANK_TRANSFER" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Commercial Bank</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankName}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, bankName: e.target.value })
                  }
                  placeholder="e.g. Rokel Commercial Bank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Number (BBAN)</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankAccountNumber}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })
                  }
                  placeholder="e.g. 003001..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={paymentSettings.bankAccountName}
                  onChange={(e) =>
                    setPaymentSettings({ ...paymentSettings, bankAccountName: e.target.value })
                  }
                  placeholder="e.g. Mohamed Sesay"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={savingSettings}
              className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 transition inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              {savingSettings ? "Saving Settings..." : "Save Payout Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Payouts History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">Withdrawal History</h2>
          <p className="text-xs text-slate-400">All past withdrawal requests and disbursements</p>
        </div>

        {payouts.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No payout requests yet</p>
            <p className="text-xs text-slate-500">
              When you submit a withdrawal, the disbursement status and transaction reference will appear here.
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-base font-extrabold text-white">
                        NLe {p.amount.toFixed(2)}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {p.method.replace("_", " ")} &bull; {new Date(p.createdAt).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        p.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : p.status === "PROCESSING"
                          ? "bg-blue-950 text-blue-400 border-blue-800"
                          : p.status === "PENDING"
                          ? "bg-amber-950 text-amber-400 border-amber-800"
                          : "bg-rose-950 text-rose-400 border-rose-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    <span className="font-mono truncate max-w-[170px]">
                      Ref: {p.transactionRef || "Pending"}
                    </span>
                    <span>
                      {p.processedAt
                        ? `Paid: ${new Date(p.processedAt).toLocaleDateString()}`
                        : "Awaiting Finance"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date Requested</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference / Receipt</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        NLe {p.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200">
                          {p.method.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {p.transactionRef || "Pending confirmation"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.status === "COMPLETED"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : p.status === "PROCESSING"
                              ? "bg-blue-950 text-blue-400 border-blue-800"
                              : p.status === "PENDING"
                              ? "bg-amber-950 text-amber-400 border-amber-800"
                              : "bg-rose-950 text-rose-400 border-rose-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                        {p.processedAt
                          ? new Date(p.processedAt).toLocaleDateString()
                          : "Awaiting Finance"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
