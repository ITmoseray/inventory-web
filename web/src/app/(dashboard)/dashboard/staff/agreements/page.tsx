"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  FileSignature, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  Send, 
  FileText, 
  UserCheck, 
  AlertCircle,
  RefreshCw,
  Eye,
  Building2,
  Calendar,
  Phone,
  Mail,
  Award,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { getTenantStaffAgreements, createStaffAgreement } from "@/lib/actions/staff-agreements";
import { getUsers } from "@/lib/actions/user";
import { format } from "date-fns";

export default function TenantStaffAgreementsPage() {
  const { data: session } = useSession();
  const businessId = (session?.user as any)?.businessId;

  const [agreements, setAgreements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New agreement form state
  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    jobTitle: "",
    department: "Operations",
    phone: "",
    email: "",
    nationalId: "",
    address: "",
    employmentType: "FULL_TIME",
    startDate: new Date().toISOString().split("T")[0],
    emergencyContactName: "",
    emergencyContactPhone: "",
    agreementType: "EMPLOYMENT_COMPLIANCE",
    customTerms: ""
  });

  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    if (!businessId) return;
    setLoading(true);
    try {
      const [agreementsData, usersData] = await Promise.all([
        getTenantStaffAgreements(),
        getUsers()
      ]);
      setAgreements(agreementsData || []);
      setUsers(usersData || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to load staff agreements");
    } finally {
      setLoading(false);
    }
  }

  function handleUserSelect(selectedUserId: string) {
    if (selectedUserId === "manual") {
      setFormData(prev => ({
        ...prev,
        userId: "",
        fullName: "",
        jobTitle: "",
        phone: "",
        email: ""
      }));
      return;
    }

    const u = users.find(x => x.id === selectedUserId);
    if (u) {
      setFormData(prev => ({
        ...prev,
        userId: u.id,
        fullName: u.name || "",
        jobTitle: u.jobTitle || u.role?.name || "Staff Associate",
        department: u.department || "Operations",
        phone: u.phone || "",
        email: u.email || ""
      }));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) {
      toast.error("Active business context not found");
      return;
    }
    if (!formData.fullName.trim() || !formData.jobTitle.trim() || !formData.phone.trim()) {
      toast.error("Please fill in Staff Name, Job Title, and Phone Number");
      return;
    }

    setCreating(true);
    try {
      const res = await createStaffAgreement({
        businessId,
        userId: formData.userId || undefined,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        department: formData.department,
        phone: formData.phone,
        email: formData.email || undefined,
        nationalId: formData.nationalId || undefined,
        address: formData.address || undefined,
        employmentType: formData.employmentType,
        startDate: formData.startDate,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        agreementType: formData.agreementType,
        termsContent: formData.customTerms || undefined
      });

      toast.success(`Agreement issued! Number: ${res.agreementNumber}`);
      setIsCreateOpen(false);
      setFormData({
        userId: "",
        fullName: "",
        jobTitle: "",
        department: "Operations",
        phone: "",
        email: "",
        nationalId: "",
        address: "",
        employmentType: "FULL_TIME",
        startDate: new Date().toISOString().split("T")[0],
        emergencyContactName: "",
        emergencyContactPhone: "",
        agreementType: "EMPLOYMENT_COMPLIANCE",
        customTerms: ""
      });
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to issue agreement");
    } finally {
      setCreating(false);
    }
  }

  function copySigningLink(agreement: any) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/agreements/${agreement.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Signing link copied to clipboard!", {
      description: "Send this link via WhatsApp, SMS, or Email to the staff member."
    });
  }

  function shareViaWhatsApp(agreement: any) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/agreements/${agreement.id}`;
    const text = encodeURIComponent(
      `Hello ${agreement.fullName}, please review and complete your official Staff Agreement & Code of Conduct form: ${url}`
    );
    window.open(`https://wa.me/${agreement.phone.replace(/[^0-9]/g, '')}?text=${text}`, "_blank");
  }

  const filtered = agreements.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.agreementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone && a.phone.includes(searchQuery));
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && a.status === statusFilter;
  });

  const totalCount = agreements.length;
  const signedCount = agreements.filter(a => a.status === "SIGNED" || a.status === "VERIFIED").length;
  const pendingCount = agreements.filter(a => a.status === "PENDING").length;
  const complianceRate = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Staff Legal & Compliance Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Staff Agreements &amp; Digital Signatures</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Issue employment contracts, code of conduct policies, and non-disclosure agreements. Staff can fill details and sign digitally from their mobile phone or PC.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10 shrink-0">
          <Button
            onClick={() => loadData()}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4 mr-2" /> Issue Agreement
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Agreements</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSignature className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Signed & Active</p>
              <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{signedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Awaiting Signature</p>
              <h3 className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compliance Rate</p>
              <h3 className="text-2xl font-black mt-1 text-indigo-600 dark:text-indigo-400">{complianceRate}%</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-card">
        <CardHeader className="p-5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-black">Staff Agreements Register</CardTitle>
              <CardDescription className="text-xs">
                Manage, copy signing links, and track compliance of your team members.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff, role, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SIGNED">Signed</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Loading staff agreements...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <FileSignature className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No staff agreements found</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL" 
                  ? "Try changing your search keywords or status filter." 
                  : "Issue your first staff compliance agreement to safeguard your business operations."}
              </p>
              {!searchQuery && statusFilter === "ALL" && (
                <Button onClick={() => setIsCreateOpen(true)} size="sm" className="rounded-xl mt-2 font-bold">
                  <Plus className="w-4 h-4 mr-1.5" /> Issue First Agreement
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[11px] font-black uppercase">Staff Member</TableHead>
                    <TableHead className="text-[11px] font-black uppercase">Agreement ID</TableHead>
                    <TableHead className="text-[11px] font-black uppercase">Type & Dept</TableHead>
                    <TableHead className="text-[11px] font-black uppercase">Status</TableHead>
                    <TableHead className="text-[11px] font-black uppercase">Signed At</TableHead>
                    <TableHead className="text-[11px] font-black uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((agreement) => (
                    <TableRow key={agreement.id} className="hover:bg-muted/30">
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {agreement.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">{agreement.jobTitle}</span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            {agreement.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {agreement.phone}</span>}
                            {agreement.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {agreement.email}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                          {agreement.agreementNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{agreement.employmentType.replace('_', ' ')}</span>
                          <span className="text-[11px] text-muted-foreground">{agreement.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agreement.status === "VERIFIED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : agreement.status === "SIGNED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Sign
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {agreement.signedAt ? format(new Date(agreement.signedAt), "dd MMM yyyy, HH:mm") : "—"}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copySigningLink(agreement)}
                            title="Copy Direct Signing Link"
                            className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" /> Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareViaWhatsApp(agreement)}
                            title="Send via WhatsApp"
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" /> WhatsApp
                          </Button>
                          <Link href={`/agreements/${agreement.id}`} target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                              title="Open Direct Portal"
                              className="h-8 px-2 text-xs font-bold rounded-lg"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
                            </Button>
                          </Link>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedAgreement(agreement)}
                            className="h-8 px-2.5 text-xs font-bold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue New Agreement Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-600" /> Issue Staff Agreement &amp; Compliance Form
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate a unique legal compliance agreement for a staff member. They can fill personal details and sign digitally.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            {/* Quick Staff Selection */}
            {users.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                <Label className="text-xs font-bold">Select from Existing Staff (Optional)</Label>
                <Select onValueChange={handleUserSelect}>
                  <SelectTrigger className="text-xs rounded-xl bg-background">
                    <SelectValue placeholder="Choose an active staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">+ Manual Entry / New Hire</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.jobTitle || u.role?.name || "Staff"}) - {u.phone || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Full Staff Name *</Label>
                <Input
                  required
                  placeholder="e.g. Samuel Koroma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Job Title / Role *</Label>
                <Input
                  required
                  placeholder="e.g. Head Cashier, Inventory Lead"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Phone Number *</Label>
                <Input
                  required
                  placeholder="e.g. +232 78 123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Staff Email</Label>
                <Input
                  type="email"
                  placeholder="e.g. staff@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Department</Label>
                <Input
                  placeholder="e.g. Sales, Warehouse, Kitchen"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(val) => setFormData({ ...formData, employmentType: val })}
                >
                  <SelectTrigger className="text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contractor</SelectItem>
                    <SelectItem value="INTERN">Intern / Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Start / Effective Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">National ID / NIN (Optional)</Label>
                <Input
                  placeholder="Staff National ID or Passport"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Custom Policies / Special Clauses (Optional)</Label>
              <Textarea
                placeholder="Add store-specific rules, cash handling limits, or branch-specific non-disclosure terms..."
                value={formData.customTerms}
                onChange={(e) => setFormData({ ...formData, customTerms: e.target.value })}
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {creating ? "Generating..." : "Issue & Generate Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Agreement Details & Certificate Dialog */}
      {selectedAgreement && (
        <Dialog open={!!selectedAgreement} onOpenChange={() => setSelectedAgreement(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-black">
                    Staff Agreement Dossier
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Reference: <span className="font-mono font-bold text-indigo-600">{selectedAgreement.agreementNumber}</span>
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  selectedAgreement.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                  selectedAgreement.status === 'SIGNED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedAgreement.status}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Staff Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Staff Name</span>
                  <span className="font-bold text-sm text-foreground">{selectedAgreement.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Job Role</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.jobTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">National ID / NIN</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.nationalId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Emergency Contact</span>
                  <span className="font-semibold text-foreground">
                    {selectedAgreement.emergencyContactName ? `${selectedAgreement.emergencyContactName} (${selectedAgreement.emergencyContactPhone || ''})` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Employment Type</span>
                  <span className="font-semibold text-foreground">{selectedAgreement.employmentType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Effective Date</span>
                  <span className="font-semibold text-foreground">
                    {selectedAgreement.startDate ? format(new Date(selectedAgreement.startDate), "dd MMM yyyy") : "N/A"}
                  </span>
                </div>
              </div>

              {/* Digital Signature Showcase */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Digital Signature on File</Label>
                {selectedAgreement.signatureData ? (
                  <div className="p-4 rounded-2xl bg-white border border-slate-300 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
                    <img
                      src={selectedAgreement.signatureData}
                      alt="Staff Digital Signature"
                      className="max-h-28 object-contain"
                    />
                    <div className="mt-3 pt-3 border-t border-slate-200 w-full flex items-center justify-between text-[11px] text-slate-500">
                      <span>Digitally Executed by: <strong>{selectedAgreement.fullName}</strong></span>
                      <span>Signed At: <strong>{selectedAgreement.signedAt ? format(new Date(selectedAgreement.signedAt), "dd MMM yyyy, HH:mm") : ""}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center text-xs text-amber-800 dark:text-amber-300">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                    Agreement is currently pending. Staff member has not signed yet.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copySigningLink(selectedAgreement)}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Signing URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareViaWhatsApp(selectedAgreement)}
                    className="rounded-xl text-xs font-bold text-emerald-600 border-emerald-500/30"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send WhatsApp Link
                  </Button>
                </div>
                <Link href={`/agreements/${selectedAgreement.id}`} target="_blank">
                  <Button size="sm" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Formal Certificate
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
