"use client";

import { useEffect, useState } from "react";
import { getGlobalReferralStats, toggleReferralReward } from "@/lib/actions/referral";
import { Users, CheckCircle2, Clock, Crown, Trophy, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getGlobalReferralStats();
      if (res.success) {
        setStats(res.stats);
        setTopReferrers(res.topReferrers || []);
        setRecentReferrals(res.recentReferrals || []);
      } else {
        toast.error(res.error || "Failed to load admin stats");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred loading stats.");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleReward = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleReferralReward(id, !currentStatus);
      if (res.success) {
        toast.success(currentStatus ? "Reward revoked." : "Reward granted.");
        loadData();
      } else {
        toast.error(res.error || "Failed to update reward.");
      }
    } catch (e) {
      toast.error("Failed to process reward action.");
    }
  };

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Referral Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Global overview of all referrals across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Referrals</p>
            <p className="text-3xl font-black">{stats?.total || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Successful (Paid)</p>
            <p className="text-3xl font-black">{stats?.successful || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pending (Free Trial)</p>
            <p className="text-3xl font-black">{stats?.pending || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Referrers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Top Referrers</h2>
          </div>
          <div className="p-6 space-y-4">
             {topReferrers.length === 0 ? (
               <p className="text-sm text-slate-500">No successful referrals yet.</p>
             ) : (
               topReferrers.map((referrer, idx) => (
                 <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                       </div>
                       <div>
                          <p className="font-bold text-sm leading-tight">{referrer.businessName}</p>
                          <p className="text-[10px] text-slate-500">{referrer.email}</p>
                       </div>
                    </div>
                    <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                       {referrer.successfulCount}
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Recent Referrals Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold">Recent Referrals</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Referrer</th>
                  <th className="px-6 py-4">Referred Customer</th>
                  <th className="px-6 py-4">Status / Code</th>
                  <th className="px-6 py-4">Reward Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No recent referrals found.
                    </td>
                  </tr>
                ) : (
                  recentReferrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                         <p className="font-bold">{ref.referrer?.name || "Unknown"}</p>
                         <p className="text-[10px] text-slate-500">{ref.referrer?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                         <p className="font-medium">{ref.referred?.name || "Unknown"}</p>
                         <p className="text-[10px] text-slate-500">Plan: {ref.referred?.plan || "Unknown"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest block w-fit mb-1",
                          ref.status === "SUCCESSFUL" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                          ref.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                          "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                        )}>
                          {ref.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Code: {ref.codeUsed}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                           size="sm" 
                           variant={ref.rewardGranted ? "outline" : "default"}
                           className={cn("h-8 text-xs", ref.rewardGranted ? "border-emerald-500 text-emerald-600 hover:text-emerald-700" : "bg-indigo-600 hover:bg-indigo-700 text-white")}
                           onClick={() => handleToggleReward(ref.id, ref.rewardGranted)}
                           disabled={ref.status !== "SUCCESSFUL" && !ref.rewardGranted} // Cannot grant reward if not successful
                        >
                           {ref.rewardGranted ? "Revoke Reward" : "Grant Reward"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
