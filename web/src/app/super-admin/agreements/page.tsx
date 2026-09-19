"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, FileSignature, 
  Printer, User, Phone, Mail, Building2, MapPin, Calendar, 
  Clock, Award, Lock, FileText, ArrowRight, RefreshCw, Stamp,
  ExternalLink, Check, Search, Plus, Trash2, Copy,
  Share2, ArrowLeft, Eye, X, Filter, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  getAllStaffAgreements, 
  createStaffAgreement, 
  verifyStaffAgreement, 
  deleteStaffAgreement 
} from "@/lib/actions/staff-agreements";
import { getAllSystemUsers } from "@/lib/actions/super-admin";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

export default function SuperAdminAgreementsVault() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, verified: 0 });
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createBusinessId, setCreateBusinessId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newDepartment, setNewDepartment] = useState("Operations");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNationalId, setNewNationalId] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newEmploymentType, setNewEmploymentType] = useState("FULL_TIME");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Certificate Modal State
  const [selectedAgreementForCert, setSelectedAgreementForCert] = useState<any>(null);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, uList] = await Promise.all([
        getAllStaffAgreements({
          businessId: selectedBusiness,
          status: selectedStatus,
          search: searchQuery,
        }),
        getAllSystemUsers()
      ]);
      setAgreements(res.agreements);
      setStats(res.stats);
      setBusinesses(res.businesses);
      // Auto-select ProTech business as default
      const protechB = res.businesses.find((b: any) => b.name?.toLowerCase().includes("protech"));
      if (protechB && !createBusinessId) {
        setCreateBusinessId(protechB.id);
      }
      setSystemUsers(uList);
    } catch (err: any) {
      toast.error(err.message || "Failed to load staff agreements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusiness, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle auto-fill when existing user is picked
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (!userId || userId === "NEW_STAFF") return;

    const user = systemUsers.find(u => u.id === userId);
    if (user) {
      setNewFullName(user.name || "");
      setNewPhone(user.phone || "");
      setNewEmail(user.email || "");
      setNewJobTitle(user.jobTitle || user.role || "Staff Operator");
      setNewDepartment(user.department || "Operations");
      if (user.businessId) setCreateBusinessId(user.businessId);
    }
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBusinessId) {
      toast.error("Please select a store / business node.");
      return;
    }
    if (!newFullName.trim() || !newJobTitle.trim() || !newPhone.trim()) {
      toast.error("Staff name, job title, and phone number are required.");
      return;
    }

    try {
      setCreating(true);
      const res = await createStaffAgreement({
        businessId: createBusinessId,
        userId: selectedUserId !== "NEW_STAFF" ? selectedUserId : undefined,
        fullName: newFullName,
        jobTitle: newJobTitle,
        department: newDepartment,
        phone: newPhone,
        email: newEmail,
        nationalId: newNationalId,
        address: newAddress,
        employmentType: newEmploymentType,
        startDate: newStartDate,
      });

      if (res.success) {
        toast.success("Staff Agreement Created Successfully!", {
          description: `Agreement serial: ${res.agreementNumber}`
        });
        setIsCreateOpen(false);
        // Reset fields
        setNewFullName("");
        setNewJobTitle("");
        setNewPhone("");
        setNewEmail("");
        setNewNationalId("");
        setNewAddress("");
        setSelectedUserId("");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create staff agreement");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (agreement: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const signUrl = `${origin}/agreements/${agreement.id}`;
    navigator.clipboard.writeText(signUrl);
    toast.success("Direct Agreement Signing Link Copied!", {
      description: "You can send this via WhatsApp or SMS to the staff member."
    });
  };

  const handleWhatsAppShare = (agreement: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const signUrl = `${origin}/agreements/${agreement.id}`;
    const message = encodeURIComponent(
      `Hello ${agreement.fullName}, please review and sign your official Enterprise Staff Agreement for ${agreement.business?.name} using this link: ${signUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyStaffAgreement(id);
      toast.success("Staff Agreement marked as officially verified and approved.");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to verify agreement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke/delete this staff agreement record?")) return;
    try {
      await deleteStaffAgreement(id);
      toast.success("Agreement revoked successfully.");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to revoke agreement");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-8">
      
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/super-admin">
            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Enterprise OS Security &amp; Legal</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <Badge variant="outline" className="text-[9px] font-bold">HR Compliance Vault</Badge>
            </div>
            <h1 className="text-xl sm:text-3xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileSignature className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Staff Agreements &amp; Signatures Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Centralized register to issue, verify, track, and print binding staff contracts and code-of-conduct agreements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="h-11 px-4 rounded-xl text-xs font-bold gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Issue New Agreement</span>
          </Button>
        </div>
      </div>

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Agreements</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white font-mono">{stats.total}</p>
          <p className="text-[10px] text-slate-400">All registered enterprise contracts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Signed &amp; Active</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] text-emerald-600 dark:text-emerald-400 font-mono">{stats.signed}</p>
          <p className="text-[10px] text-slate-400">Digitally signed by staff</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Signatures</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] text-amber-600 dark:text-amber-400 font-mono">{stats.pending}</p>
          <p className="text-[10px] text-slate-400">Awaiting employee submission</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Verified Compliant</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-[1000] text-blue-600 dark:text-blue-400 font-mono">{stats.verified}</p>
          <p className="text-[10px] text-slate-400">Approved by Super Admin</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search name, phone, NIN, or serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
            <SelectTrigger className="h-10 rounded-xl text-xs font-bold w-full sm:w-48 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs font-bold">All Stores / Nodes</SelectItem>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10 rounded-xl text-xs font-bold w-full sm:w-36 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL" className="text-xs font-bold">All Status</SelectItem>
              <SelectItem value="SIGNED" className="text-xs font-bold text-emerald-600">Signed</SelectItem>
              <SelectItem value="PENDING" className="text-xs font-bold text-amber-600">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AGREEMENTS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-wider">Agreement Serial</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider">Staff Member</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider">Store &amp; Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider">Signed Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider text-center">Digital Signature</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                    <p className="text-xs text-slate-400 mt-2">Loading agreements vault...</p>
                  </TableCell>
                </TableRow>
              ) : agreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400 text-xs font-medium">
                    No staff agreements found matching your search criteria. Click &quot;Issue New Agreement&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                agreements.map((a) => (
                  <TableRow key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                    <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {a.agreementNumber}
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-bold text-slate-900 dark:text-white">{a.fullName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{a.phone}</span>
                        {a.nationalId && <span>• NIN: {a.nationalId}</span>}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{a.business?.name}</div>
                      <div className="text-[10px] text-slate-400">{a.jobTitle} ({a.department})</div>
                    </TableCell>

                    <TableCell className="text-slate-500 font-mono text-[11px]">
                      {a.signedAt ? format(new Date(a.signedAt), "MMM d, yyyy") : "Awaiting Sign"}
                    </TableCell>

                    <TableCell>
                      {a.status === "SIGNED" ? (
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                            Signed
                          </Badge>
                          {a.verifiedByAdmin && (
                            <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] font-bold">
                              Verified
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {a.signatureData ? (
                        <div 
                          onClick={() => setSelectedAgreementForCert(a)}
                          className="h-9 w-20 mx-auto rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center cursor-pointer hover:border-indigo-400 shadow-xs"
                          title="Click to view full certificate"
                        >
                          <img src={a.signatureData} alt="Signature" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No signature</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Certificate */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAgreementForCert(a)}
                          className="h-8 w-8 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                          title="View Official Certificate"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Copy Link */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(a)}
                          className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Copy Direct Signing Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        {/* WhatsApp Share */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWhatsAppShare(a)}
                          className="h-8 w-8 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                          title="Send to Staff on WhatsApp"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>

                        {/* Admin Verify Stamp */}
                        {!a.verifiedByAdmin && a.status === "SIGNED" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVerify(a.id)}
                            className="h-8 w-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600"
                            title="Verify & Authenticate"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete / Revoke */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a.id)}
                          className="h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500"
                          title="Revoke / Delete Agreement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* CREATE / ISSUE NEW AGREEMENT MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-indigo-600" />
              Issue New Staff Agreement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Generate an official legal compliance contract and signing link for a staff member.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAgreement} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Select Business */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Store / Business Node *</Label>
                <Select value={createBusinessId} onValueChange={setCreateBusinessId} required>
                  <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                    <SelectValue placeholder="Select Business" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="text-xs font-bold">
                        {b.name} ({b.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pre-fill from Existing User */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Auto-fill from User Profile (Optional)</Label>
                <Select value={selectedUserId} onValueChange={handleUserSelect}>
                  <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                    <SelectValue placeholder="New Employee (Manual)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="NEW_STAFF" className="text-xs font-bold">Manual Entry (New Staff)</SelectItem>
                    {systemUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.name || "User"} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Staff Full Legal Name *</Label>
                <Input
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Samuel Koroma"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Job Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Job Title / Designation *</Label>
                <Input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Head Cashier / Sales Executive"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Department</Label>
                <Input
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Sales &amp; POS Operations"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Phone Number *</Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +232 78 123456"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Email Address (Optional)</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. staff@gmail.com"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* National ID */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">National ID / NIN (Optional pre-fill)</Label>
                <Input
                  value={newNationalId}
                  onChange={(e) => setNewNationalId(e.target.value)}
                  placeholder="Staff will enter if blank"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Employment Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Employment Type</Label>
                <Select value={newEmploymentType} onValueChange={setNewEmploymentType}>
                  <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="FULL_TIME" className="text-xs">Full-Time Staff</SelectItem>
                    <SelectItem value="PART_TIME" className="text-xs">Part-Time Staff</SelectItem>
                    <SelectItem value="CONTRACT" className="text-xs">Contractor / Temp</SelectItem>
                    <SelectItem value="PROBATION" className="text-xs">Probationary Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Effective Start Date</Label>
                <Input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="h-11 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-11 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                {creating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Generate Agreement</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* FULL CERTIFICATE & AGREEMENT PREVIEW MODAL */}
      {selectedAgreementForCert && (
        <Dialog open={!!selectedAgreementForCert} onOpenChange={(open) => !open && setSelectedAgreementForCert(null)}>
          <DialogContent className="sm:max-w-3xl rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-lg font-[1000] uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Stamp className="h-5 w-5 text-indigo-600" />
                    Agreement Certificate &amp; Legal Audit
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono text-slate-500">
                    Serial: {selectedAgreementForCert.agreementNumber}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "";
                      window.open(`${origin}/agreements/${selectedAgreementForCert.id}`, "_blank");
                    }}
                    className="h-8 rounded-xl text-xs font-bold gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Full View
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-xs sm:text-sm">
              {/* Staff Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Staff Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAgreementForCert.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Store Node</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAgreementForCert.business?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Role &amp; Dept</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAgreementForCert.jobTitle} ({selectedAgreementForCert.department})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">National ID / NIN</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAgreementForCert.nationalId || "Not Entered"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                  <span className="font-mono text-slate-900 dark:text-white">{selectedAgreementForCert.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
                  <span className="text-slate-900 dark:text-white">{selectedAgreementForCert.emergencyContactName || "On File"}</span>
                </div>
              </div>

              {/* Digital Signature Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Affixed Hand-Drawn Digital Signature
                </span>
                
                {selectedAgreementForCert.signatureData ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[120px]">
                    <img
                      src={selectedAgreementForCert.signatureData}
                      alt="Digital Signature"
                      className="max-h-24 max-w-full object-contain"
                    />
                    <span className="font-mono text-[10px] text-slate-400 mt-2">
                      Signed: {selectedAgreementForCert.signedAt ? format(new Date(selectedAgreementForCert.signedAt), "PPP 'at' p") : "Recorded"}
                    </span>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-xl">
                    Signature has not been completed by the staff member yet.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyLink(selectedAgreementForCert)}
                  className="h-10 rounded-xl text-xs font-bold gap-2"
                >
                  <Copy className="h-4 w-4" /> Copy Direct Sign Link
                </Button>

                <div className="flex gap-2">
                  {!selectedAgreementForCert.verifiedByAdmin && selectedAgreementForCert.status === "SIGNED" && (
                    <Button
                      type="button"
                      onClick={() => handleVerify(selectedAgreementForCert.id)}
                      className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" /> Verify Compliance
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedAgreementForCert(null)}
                    className="h-10 rounded-xl text-xs font-bold"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
