"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Search, Trash2, Package, CalendarDays, AlertTriangle,
  CheckCircle2, Loader2, X, FlaskConical, Edit2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/layout/ModuleHeader";
import {
  getBatches, getProductsForBatch,
  createBatch, deleteBatch,
} from "@/lib/actions/batch";

type Batch = {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string | null;
  manufacturingDate: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string | null } | null;
};

type Product = { id: string; name: string; sku: string | null };

function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) return "none";
  const d = new Date(expiryDate);
  if (isPast(d)) return "expired";
  const daysLeft = differenceInDays(d, new Date());
  if (daysLeft <= 30) return "soon";
  return "ok";
}

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  const status = getExpiryStatus(expiryDate);
  if (!expiryDate) return <span className="text-slate-400 text-sm">—</span>;

  const formatted = format(new Date(expiryDate), "dd MMM yyyy");
  const daysLeft = differenceInDays(new Date(expiryDate), new Date());

  if (status === "expired") return (
    <div className="flex flex-col gap-0.5">
      <Badge className="bg-rose-100 text-rose-700 border-0 gap-1 w-fit"><AlertTriangle className="h-3 w-3" /> Expired</Badge>
      <span className="text-xs text-slate-500">{formatted}</span>
    </div>
  );
  if (status === "soon") return (
    <div className="flex flex-col gap-0.5">
      <Badge className="bg-amber-100 text-amber-700 border-0 gap-1 w-fit"><AlertTriangle className="h-3 w-3" /> {daysLeft}d left</Badge>
      <span className="text-xs text-slate-500">{formatted}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-0.5">
      <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1 w-fit"><CheckCircle2 className="h-3 w-3" /> {daysLeft}d left</Badge>
      <span className="text-xs text-slate-500">{formatted}</span>
    </div>
  );
}

export default function BatchesPage() {
  const [batches, setBatches]   = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [open, setOpen]         = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; batch: Batch | null }>({
    open: false, batch: null
  });
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    batchNumber: "", productId: "", quantity: "",
    expiryDate: "", manufacturingDate: "",
  });

  async function load() {
    try {
      const [batchData, productData] = await Promise.all([
        getBatches(), getProductsForBatch(),
      ]);
      setBatches(batchData as Batch[]);
      setProducts(productData);
    } catch {
      toast.error("Failed to load batch data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = batches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setForm({ batchNumber: "", productId: "", quantity: "", expiryDate: "", manufacturingDate: "" });
  }

  function validateDates(): boolean {
    if (form.manufacturingDate && form.expiryDate) {
      const mfg    = new Date(form.manufacturingDate);
      const expiry = new Date(form.expiryDate);
      if (mfg >= expiry) {
        toast.error("Manufacturing date must be before expiry date.");
        return false;
      }
    }
    return true;
  }

  function handleAdd() {
    if (!form.batchNumber.trim()) { toast.error("Batch number is required"); return; }
    if (!form.productId) { toast.error("Please select a product"); return; }
    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty) || qty <= 0) { toast.error("Please enter a valid quantity"); return; }
    if (!validateDates()) return;

    startTransition(async () => {
      try {
        await createBatch({
          batchNumber: form.batchNumber.trim(),
          productId: form.productId,
          quantity: qty,
          expiryDate: form.expiryDate || undefined,
          manufacturingDate: form.manufacturingDate || undefined,
        });
        toast.success(`Batch ${form.batchNumber} added successfully`);
        setOpen(false);
        resetForm();
        setLoading(true);
        await load();
      } catch (err: any) {
        toast.error(err?.message || "Failed to add batch");
      }
    });
  }

  function confirmDelete(batch: Batch) {
    setDeleteDialog({ open: true, batch });
  }

  function handleDelete() {
    const batch = deleteDialog.batch;
    if (!batch) return;
    setDeleteDialog({ open: false, batch: null });
    setDeletingId(batch.id);
    startTransition(async () => {
      try {
        await deleteBatch(batch.id);
        toast.success(`Batch ${batch.batchNumber} deleted`);
        setBatches((prev) => prev.filter((b) => b.id !== batch.id));
      } catch {
        toast.error("Failed to delete batch");
      } finally {
        setDeletingId(null);
      }
    });
  }

  const expiredCount = batches.filter((b) => b.expiryDate && isPast(new Date(b.expiryDate))).length;
  const soonCount    = batches.filter((b) => {
    if (!b.expiryDate || isPast(new Date(b.expiryDate))) return false;
    return differenceInDays(new Date(b.expiryDate), new Date()) <= 30;
  }).length;

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-[900] tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <FlaskConical className="h-6 w-6 text-indigo-600" />
              </div>
              Batch Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Track product batches, quantities, and expiry dates</p>
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setOpen(true); }}
          className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Batch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40"><Package className="h-5 w-5 text-indigo-600" /></div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{batches.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Batches</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/40"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{expiredCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expired Batches</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-white dark:bg-slate-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40"><CalendarDays className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{soonCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Expiring Soon (30d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-3xl border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search batch or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mr-3" /> Loading batches…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Package className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">
              {search ? "No batches match your search" : "No batches yet. Click \"Add Batch\" to get started."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/60">
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Batch #</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Product</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Quantity</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Mfg. Date</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Expiry Date</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-300">Added</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((batch) => (
                <TableRow
                  key={batch.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
                    getExpiryStatus(batch.expiryDate) === "expired" && "bg-rose-50/50 dark:bg-rose-900/10"
                  )}
                >
                  <TableCell><span className="font-black text-indigo-700 dark:text-indigo-400 tracking-wide">{batch.batchNumber}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">{batch.product?.name ?? "—"}</span>
                      {batch.product?.sku && <span className="text-xs text-slate-400">SKU: {batch.product.sku}</span>}
                    </div>
                  </TableCell>
                  <TableCell><span className="font-bold text-slate-800 dark:text-slate-200">{batch.quantity.toLocaleString()}</span></TableCell>
                  <TableCell>
                    {batch.manufacturingDate ? (
                      <span className="text-sm text-slate-600 dark:text-slate-400">{format(new Date(batch.manufacturingDate), "dd MMM yyyy")}</span>
                    ) : <span className="text-slate-400 text-sm">—</span>}
                  </TableCell>
                  <TableCell><ExpiryBadge expiryDate={batch.expiryDate} /></TableCell>
                  <TableCell className="text-sm text-slate-400">{format(new Date(batch.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                      disabled={deletingId === batch.id}
                      onClick={() => confirmDelete(batch)}
                    >
                      {deletingId === batch.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Batch Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-indigo-500" /> Add New Batch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="batchNumber" className="font-semibold text-slate-700 dark:text-slate-300">Batch Number <span className="text-rose-500">*</span></Label>
              <Input id="batchNumber" placeholder="e.g. B103" value={form.batchNumber}
                onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))}
                className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 dark:text-slate-300">Product <span className="text-rose-500">*</span></Label>
              <Select value={form.productId} onValueChange={(val) => setForm((f) => ({ ...f, productId: val }))}>
                <SelectTrigger className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select a product…" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl dark:bg-slate-900">
                  {products.length === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-400">No products found</div>
                  ) : (
                    products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="font-medium">{p.name}</span>
                        {p.sku && <span className="text-slate-400 ml-2 text-xs">({p.sku})</span>}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="font-semibold text-slate-700 dark:text-slate-300">Quantity <span className="text-rose-500">*</span></Label>
              <Input id="quantity" type="number" min={1} placeholder="e.g. 100" value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mfgDate" className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Mfg. Date</Label>
                <Input id="mfgDate" type="date" value={form.manufacturingDate}
                  onChange={(e) => setForm((f) => ({ ...f, manufacturingDate: e.target.value }))}
                  className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expiryDate" className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Expiry Date</Label>
                <Input id="expiryDate" type="date" value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={isPending} className="rounded-xl">
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isPending}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Plus className="mr-2 h-4 w-4" /> Add Batch</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-sm rounded-3xl dark:bg-slate-900 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Are you sure you want to delete batch{" "}
              <span className="font-black text-slate-900 dark:text-white">{deleteDialog.batch?.batchNumber}</span>?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, batch: null })} className="rounded-xl">Cancel</Button>
            <Button onClick={handleDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
