"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ShoppingCart, Plus, RefreshCw, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSimpleDailyEntries, recordSimpleDailyEntry } from "@/lib/actions/simple-sales";

export default function SimplePurchasesPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    totalPurchases: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getSimpleDailyEntries();
      setEntries(res || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recordSimpleDailyEntry({
        date: formData.date,
        totalSales: 0,
        totalPurchases: Number(formData.totalPurchases) || 0,
        expenses: 0,
        notes: formData.notes
      });
      toast.success("Stock purchase recorded!");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to record purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPurchasesAllTime = entries.reduce((acc, curr) => acc + Number(curr.totalPurchases || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingCart className="w-3.5 h-3.5" /> Stock Purchases &amp; Inflow
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Stock Purchases Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily wholesale purchases and goods restock expenditures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm" className="rounded-xl border-white/20 text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5">
            <Plus className="w-4 h-4" /> Record Purchase
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border bg-card p-5">
        <span className="text-[10px] font-black uppercase text-muted-foreground">Total Stock Purchases</span>
        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
          Le {totalPurchasesAllTime.toLocaleString()}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">Across {entries.length} daily entries</p>
      </Card>

      <Card className="rounded-2xl border bg-card overflow-hidden">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base font-black">Recorded Stock Purchases</CardTitle>
          <CardDescription className="text-xs">Summary of stock inventory purchases by date</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">No purchase entries recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 uppercase text-[10px] font-black border-b">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total Stock/Purchases</th>
                    <th className="p-4">Recorded By</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="p-4 font-bold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {format(new Date(e.date), "dd MMM yyyy")}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        Le {Number(e.totalPurchases).toLocaleString()}
                      </td>
                      <td className="p-4 text-muted-foreground">{e.user?.name || "Admin"}</td>
                      <td className="p-4 text-muted-foreground">{e.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" /> Record Stock Purchase
            </DialogTitle>
            <DialogDescription className="text-xs">
              Log total wholesale money spent on restocking stock/inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Date *</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Total Purchases Amount *</Label>
              <Input
                type="number"
                min="0"
                step="any"
                required
                placeholder="0.00"
                value={formData.totalPurchases}
                onChange={e => setFormData({ ...formData, totalPurchases: e.target.value })}
                className="rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold">Notes / Supplier (Optional)</Label>
              <Input
                placeholder="e.g. Restock from wholesale depot..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white">
                {submitting ? "Saving..." : "Save Purchase"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
