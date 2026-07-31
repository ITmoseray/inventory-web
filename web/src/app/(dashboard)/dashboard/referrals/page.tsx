"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getOrCreateReferralCode, getReferralStats } from "@/lib/actions/referral";
import { Copy, Gift, Link as LinkIcon, Share2, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReferralsPage() {
  const { data: session } = useSession();
  const businessId = session?.user?.businessId;
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  async function loadData() {
    setLoading(true);
    try {
      const codeRes = await getOrCreateReferralCode(businessId!);
      if (codeRes.success) setCode(codeRes.code!);

      const statsRes = await getReferralStats(businessId!);
      if (statsRes.success) {
        setStats(statsRes.stats);
        setHistory(statsRes.history ?? []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const text = `Join Protech Assist Enterprise OS! Use my referral link to sign up: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = "Invitation to join Protech Assist";
    const body = `Hi there,\n\nI invite you to try Protech Assist Enterprise OS. Use my link to register: ${referralLink}\n\nThanks!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return <div className="p-6 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Referral Program</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Invite other businesses to Protech Assist and earn rewards when they subscribe.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all">
              {referralLink}
            </div>
            <Button onClick={() => handleCopy(referralLink)} className="h-14 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>

          <h2 className="text-lg font-bold mb-4">Your Referral Code</h2>
          <div className="flex items-center gap-2 mb-8">
             <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-lg font-bold tracking-widest text-slate-900 dark:text-white">
                {code}
             </div>
             <Button variant="outline" onClick={() => handleCopy(code!)} className="h-[52px]">
               <Copy className="h-4 w-4" />
             </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleShareWhatsApp} variant="outline" className="flex-1 min-w-[140px] bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/20">
              Share via WhatsApp
            </Button>
            <Button onClick={handleShareEmail} variant="outline" className="flex-1 min-w-[140px]">
              Share via Email
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-4">
          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-600/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold opacity-90">Rewards Earned</h3>
              <Gift className="h-6 w-6 opacity-75" />
            </div>
            <p className="text-4xl font-black">{stats?.rewardsEarned || 0}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Users className="h-5 w-5 text-indigo-600 mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-black">{stats?.total || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Successful</p>
              <p className="text-2xl font-black">{stats?.successful || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 col-span-2">
              <Clock className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pending (Awaiting Subscription)</p>
              <p className="text-2xl font-black">{stats?.pending || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold">Referral History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No referrals yet. Share your link to get started!
                  </td>
                </tr>
              ) : (
                history.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{ref.referred.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        ref.status === "SUCCESSFUL" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                        ref.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                      )}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ref.rewardGranted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Granted
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
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
