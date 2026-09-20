"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  RotateCcw, 
  Search, 
  Filter, 
  ArrowLeftRight, 
  Package, 
  Calendar, 
  User,
  History,
  Activity,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReturns } from "@/lib/actions/return";
import { format } from "date-fns";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SalesReturnsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    try {
      setLoading(true);
      const data = await getReturns();
      setReturns(data);
    } catch (error) {
      toast.error("Failed to load return logs.");
    } finally {
      setLoading(false);
    }
  }

  const filteredReturns = returns.filter(r => 
    r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Sales Returns
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Monitor reversed transactions, returned merchandise, and stock reinstatements
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/purchases/returns")}
          className="btn-primary flex items-center gap-2 text-xs font-semibold py-2.5 px-5"
        >
          <Plus size={15} /> Initialize Return
        </button>
      </div>

      {/* Toolbar: Search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            placeholder="Search product or return reason..."
            className="input-field pl-10 w-full text-xs font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Product</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Date</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Quantity</th>
                <th className="text-left text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Processor</th>
                <th className="text-right text-[11px] font-bold text-[var(--muted-foreground)] px-4 py-3 uppercase tracking-wider">Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td colSpan={5} className="px-4 py-6 text-center">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/3 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[var(--muted-foreground)]">
                    <RotateCcw size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No returns registered in log</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Returned merchandise will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="table-row-hover border-b border-[var(--border)] text-xs">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center shrink-0">
                          <Package size={15} className="text-[var(--muted-foreground)]" />
                        </div>
                        <span className="font-semibold text-[var(--foreground)]">{ret.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                      {format(new Date(ret.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold text-xs">
                        <ArrowLeftRight size={11} /> {ret.quantity} Units
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[var(--foreground)]">
                      {ret.userName}
                    </td>
                    <td className="px-4 py-3.5 text-right text-[var(--muted-foreground)] italic">
                      {ret.reason || "Manual Adjustment"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
