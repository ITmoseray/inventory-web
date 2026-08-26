"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  Printer, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  Package,
  Layers,
  MapPin,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/super-admin/glass-card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { 
  getClientImplementations, 
  createOrGetClientImplementation,
  deleteClientImplementation
} from "@/lib/actions/client-implementation";
import { getAllBusinesses } from "@/lib/actions/super-admin";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientImplementationsHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [implementations, setImplementations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    registrationCompleted: 0,
    inventoryCompleted: 0,
    inventoryPending: 0,
    awaitingVerification: 0,
    awaitingSignatures: 0,
    completed: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // New Implementation Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [businessSearch, setBusinessSearch] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete / Archive Modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; impNumber: string }>({
    open: false,
    id: "",
    impNumber: ""
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, cityFilter]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await getClientImplementations({
        search: searchQuery,
        status: statusFilter,
        city: cityFilter
      });
      setImplementations(res.items);
      setStats(res.stats);
    } catch (err: any) {
      toast.error(err.message || "Failed to load implementations.");
    } finally {
      setLoading(false);
    }
  }

  async function openNewImplementationModal() {
    setIsNewModalOpen(true);
    try {
      const bList = await getAllBusinesses();
      setAllBusinesses(bList || []);
    } catch (e) {
      toast.error("Failed to load businesses.");
    }
  }

  async function handleStartImplementation() {
    if (!selectedBusinessId) {
      toast.error("Please select a business to start implementation.");
      return;
    }

    try {
      setIsCreating(true);
      const record = await createOrGetClientImplementation(selectedBusinessId);
      toast.success(`Implementation opened: ${record.implementationNumber}`);
      setIsNewModalOpen(false);
      router.push(`/super-admin/implementations/${record.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize implementation.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClientImplementation(id);
      toast.success("Implementation archived successfully.");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete implementation.");
    }
  }

  const getStatusBadge = (status: string, isLocked: boolean) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            Completed &amp; Locked
          </span>
        );
      case "AWAITING_CLIENT_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[10px] font-black uppercase tracking-wider">
            <UserCheck className="h-3 w-3" />
            Awaiting Signatures
          </span>
        );
      case "INVENTORY_VERIFICATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            In Verification
          </span>
        );
      case "INVENTORY_IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-wider">
            <Package className="h-3 w-3" />
            Inventory In Progress
          </span>
        );
      case "REGISTRATION_COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
            <Building2 className="h-3 w-3" />
            Registration Ready
          </span>
        );
      case "AMENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider">
            <AlertCircle className="h-3 w-3" />
            Amended / Unlocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            Registration Pending
          </span>
        );
    }
  };

  const filteredBusinesses = allBusinesses.filter(b => 
    b.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
    b.slug.toLowerCase().includes(businessSearch.toLowerCase()) ||
    (b.phone && b.phone.includes(businessSearch))
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              href="/super-admin"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" />
              <span>Implementation &amp; Audit Engine</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[1000] tracking-tight uppercase italic text-slate-900 dark:text-white">
            Client Implementation &amp; Inventory Verification
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Execute professional onboarding, live inventory auditing, dual digital signatures, tamper-proof record locking, and executive certification reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openNewImplementationModal}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Implementation</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Records</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Reg. Completed</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.registrationCompleted}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">Inventory Done</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.inventoryCompleted}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">In Verification</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.awaitingVerification}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">Needs Signature</p>
          <p className="text-2xl font-black text-violet-600 dark:text-violet-400">{stats.awaitingSignatures}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Completed &amp; Locked</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <GlassCard className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by client name, implementation ID (IMP-2026-XXXX), phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-bold"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[170px] rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="REGISTRATION_PENDING">Reg. Pending</SelectItem>
              <SelectItem value="REGISTRATION_COMPLETED">Reg. Completed</SelectItem>
              <SelectItem value="INVENTORY_IN_PROGRESS">Inventory In Progress</SelectItem>
              <SelectItem value="INVENTORY_VERIFICATION">In Verification</SelectItem>
              <SelectItem value="AWAITING_CLIENT_APPROVAL">Awaiting Signatures</SelectItem>
              <SelectItem value="COMPLETED">Completed &amp; Locked</SelectItem>
              <SelectItem value="AMENDED">Amended</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={fetchData}
            className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </GlassCard>

      {/* Main Implementation Table */}
      <GlassCard className="p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 pl-6">Implementation ID</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4">Client / Store</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4">Assigned Staff</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-center">Registration</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-center">Inventory</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-center">Verification</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-center">Signatures</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider py-4 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading implementation records...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : implementations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <ClipboardCheck className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No implementation records found.</p>
                    <Button 
                      onClick={openNewImplementationModal}
                      size="sm" 
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
                    >
                      Start First Implementation
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              implementations.map((imp) => {
                const checklist = (imp.verificationChecklist as any) || {};
                const verifiedCount = Object.values(checklist).filter(Boolean).length;
                const totalChecklistItems = 11;
                const hasStaffSig = !!imp.staffSignature;
                const hasClientSig = !!imp.clientSignature;

                return (
                  <TableRow key={imp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Implementation ID */}
                    <TableCell className="pl-6 py-4 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {imp.implementationNumber}
                    </TableCell>

                    {/* Client / Store */}
                    <TableCell className="py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                          {imp.clientName || imp.business?.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span>{imp.businessType || imp.business?.type}</span>
                          <span>•</span>
                          <span>{imp.city || "Freetown"}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Assigned Staff */}
                    <TableCell className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {imp.assignedStaffName || imp.assignedStaff?.name || "Implementation Lead"}
                    </TableCell>

                    {/* Registration Badge */}
                    <TableCell className="text-center py-4">
                      {imp.registrationCompleted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Pending</span>
                      )}
                    </TableCell>

                    {/* Inventory Badge */}
                    <TableCell className="text-center py-4">
                      {imp.inventoryCompleted ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          <Package className="h-3.5 w-3.5" /> {(imp.inventorySummary as any)?.totalProducts || 0} items
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">0 items</span>
                      )}
                    </TableCell>

                    {/* Verification Checklist */}
                    <TableCell className="text-center py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black",
                        imp.inventoryVerified 
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      )}>
                        {verifiedCount}/{totalChecklistItems}
                      </span>
                    </TableCell>

                    {/* Signatures */}
                    <TableCell className="text-center py-4">
                      {hasStaffSig && hasClientSig ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <ShieldCheck className="h-3.5 w-3.5" /> Both Signed
                        </span>
                      ) : hasStaffSig ? (
                        <span className="text-[10px] font-bold text-amber-500">Staff Only</span>
                      ) : hasClientSig ? (
                        <span className="text-[10px] font-bold text-amber-500">Client Only</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Unsigned</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center py-4">
                      {getStatusBadge(imp.status, imp.isLocked)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/super-admin/implementations/${imp.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Workspace</span>
                          </Button>
                        </Link>

                        <Link href={`/super-admin/implementations/${imp.id}/report`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            title="View Completion Report"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {!imp.isLocked && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteModal({ open: true, id: imp.id, impNumber: imp.implementationNumber })}
                            className="h-8 px-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                            title="Archive Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Start New Implementation Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Initialize Client Implementation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select an existing client store from the Protech Ecosystem to begin or resume its field implementation and inventory completion audit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search store name or slug..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredBusinesses.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400 font-medium">No stores match your search.</p>
              ) : (
                filteredBusinesses.map((b) => {
                  const isSelected = selectedBusinessId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBusinessId(b.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 dark:text-white">{b.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">{b.type} • {b.phone || "No phone"}</p>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                      )}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setIsNewModalOpen(false)}
              className="h-10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartImplementation}
              disabled={!selectedBusinessId || isCreating}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20"
            >
              {isCreating ? "Initializing..." : "Open Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete / Archive Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "", impNumber: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Archive Implementation Record"
        description={`Are you sure you want to archive ${deleteModal.impNumber}? The record will be hidden from the active dashboard.`}
        confirmText="Archive Record"
        variant="destructive"
      />
    </div>
  );
}
