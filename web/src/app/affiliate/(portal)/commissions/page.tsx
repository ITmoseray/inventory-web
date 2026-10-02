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
    { id: "PENDING", label: "Pending" },
    { id: "APPROVED", label: "Approved" },
    { id: "PAID", label: "Paid Out" },
    { id: "CANCELLED", label: "Cancelled / Reversed" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Commissions Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed breakdown of all verified commissions earned through your referrals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold text-slate-400">
            Showing {commissions.length} of {totalCount} records
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading commissions ledger...
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              No commission records found in this category
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a referred customer completes a qualifying purchase, your commission will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product / Service</th>
                  <th className="py-3 px-4">Customer Ref</th>
                  <th className="py-3 px-4 text-right">Order Total</th>
                  <th className="py-3 px-4 text-center">Rate</th>
                  <th className="py-3 px-4 text-right">Commission Earned</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white uppercase text-xs">
                      {c.orderType?.replace("_", " ")}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {c.customerMasked}
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      NLe {c.orderAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 font-semibold">
                        {c.rateApplied}
                        {c.rateType === "PERCENTAGE" ? "%" : " NLe"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400 text-sm">
                      + NLe {c.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.status === "PAID"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : c.status === "APPROVED"
                            ? "bg-blue-950 text-blue-400 border-blue-800"
                            : c.status === "PENDING"
                            ? "bg-amber-950 text-amber-400 border-amber-800"
                            : "bg-rose-950 text-rose-400 border-rose-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
