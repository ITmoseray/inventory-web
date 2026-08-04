"use client";

import { useState, useEffect } from "react";
import { CreditCard, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCurrentSubscription, getInvoices } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sub, inv] = await Promise.all([getCurrentSubscription(), getInvoices()]);
        setSubscription(sub);
        setInvoices(inv);
      } catch (error) {
        toast.error("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Please enter a voucher code");
      return;
    }
    
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/business/redeem-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode.trim() })
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to redeem voucher");
      }

      toast.success("Voucher redeemed successfully!");
      setVoucherCode("");
      
      // Reload subscription data
      const sub = await getCurrentSubscription();
      setSubscription(sub);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Error redeeming voucher");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) return <div className="p-8">Loading billing details...</div>;

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-slate-500 font-medium">Manage your subscription plan and view invoice history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-xl bg-white dark:bg-slate-900/80 rounded-3xl p-6 backdrop-blur-xl">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase">{subscription.plan}</div>
                        <div className="text-xs font-bold text-slate-400">
                          {subscription.status === 'active'
                            ? `Active until ${format(new Date(subscription.endDate), "PPP")}`
                            : `Expires ${format(new Date(subscription.endDate), "PPP")}`}
                        </div>
                    </div>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                        subscription.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                        {subscription.status}
                    </span>
                </div>
              </div>
            ) : (
                <div className="text-slate-500 font-medium text-sm">
                  No active subscription found. <a href="/pricing" className="text-indigo-500 font-bold hover:underline">Browse plans →</a>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900/80 rounded-3xl p-6 backdrop-blur-xl">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Redeem Voucher</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-sm">Have a promotion or activation key? Enter it here to upgrade your plan.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 pt-2">
               <div className="flex gap-2">
                 <Input 
                   placeholder="e.g. PRO-ABCD-1234"
                   value={voucherCode}
                   onChange={(e) => setVoucherCode(e.target.value)}
                   className="font-mono uppercase bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl"
                 />
                 <Button 
                   onClick={handleRedeemVoucher}
                   disabled={isRedeeming || !voucherCode.trim()}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6"
                 >
                   {isRedeeming ? "Redeeming..." : "Redeem"}
                 </Button>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-xl bg-white dark:bg-slate-900/80 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
          <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Invoice History</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-bold text-slate-700 dark:text-slate-300">{format(new Date(invoice.createdAt), "PPP")}</TableCell>
                <TableCell className="font-black text-slate-900 dark:text-white">Le {Math.round(Number(invoice.amount)).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-black uppercase",
                    invoice.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {invoice.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
