"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Search,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { getAffiliateCommissions } from "@/lib/actions/affiliate";

export default function AffiliateCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadCommissions();
  }, [statusFilter, page]);

  async function loadCommissions() {
    setLoading(true);
    try {
      const res = await getAffiliateCommissions({
        status: statusFilter,
        page,
        limit: 15,
      });
      if (res.success) {
        setCommissions(res.commissions || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.totalCount || 0);
      } else {
        toast.error(res.error || "Failed to load commissions ledger");
      }
    } catch (e) {
      toast.error("Network error fetching commissions");
    } finally {
      setLoading(false);
    }
  }

  const statusTabs = [
    { id: "ALL", label: "All Commissions" },
    { id: "PENDING", label: "Pending Verification" },
    { id: "APPROVED", label: "Approved" },
    { id: "PAID", label: "Paid Out" },
    { id: "CANCELLED", label: "Cancelled / Reversed" },
  ];

  return (
    <div className="space-y-8 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Transparent Earnings Breakdown
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Commissions Ledger & Statement
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Detailed financial audit of every customer conversion, recurring license subscription, or student cohort credited to your partner account.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === tab.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-bold text-slate-500">
            Showing {commissions.length} of {totalCount} records
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading commissions ledger...
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No commissions found matching this filter</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Share your referral link on WhatsApp or pitch in-person to retail stores to start recording earnings.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Date & ID</th>
                    <th className="py-3.5 px-4">Solution / Product</th>
                    <th className="py-3.5 px-4">Order Value</th>
                    <th className="py-3.5 px-4">Rate</th>
                    <th className="py-3.5 px-4 text-right">Commission</th>
                    <th className="py-3.5 px-4 text-center rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {new Date(comm.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {comm.id.slice(0, 12)}...
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {comm.conversion?.productName || "ProTech Solution"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Customer: {comm.conversion?.customerName || "Customer"}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                        NLe {(Number(comm.baseAmount) || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        {comm.rateApplied ? `${comm.rateApplied}%` : "Standard"}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                        +NLe {(Number(comm.amount) || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            comm.status === "PAID"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : comm.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : comm.status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {commissions.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {comm.conversion?.productName || "ProTech Solution"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        comm.status === "PAID"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : comm.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : comm.status === "PENDING"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {comm.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Commission Earned:</span>
                    <span className="font-black text-emerald-700 font-mono text-sm">
                      +NLe {(Number(comm.amount) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
