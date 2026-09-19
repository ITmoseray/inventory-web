"use client";

import { useState } from "react";
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, FileSignature, 
  Printer, User, Phone, Mail, Building2, MapPin, Calendar, 
  Clock, Award, Lock, FileText, ArrowRight, RefreshCw, Stamp,
  ExternalLink, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DigitalSignaturePad } from "@/components/shared/digital-signature-pad";
import { submitStaffSignature } from "@/lib/actions/staff-agreements";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface StaffAgreementSignClientProps {
  agreement: any;
}

export function StaffAgreementSignClient({ agreement: initialAgreement }: StaffAgreementSignClientProps) {
  const [agreement, setAgreement] = useState(initialAgreement);
  const [isSigned, setIsSigned] = useState(initialAgreement.status === "SIGNED");
  
  // Form State for Signing
  const [fullName, setFullName] = useState(initialAgreement.fullName || "");
  const [nationalId, setNationalId] = useState(initialAgreement.nationalId || "");
  const [phone, setPhone] = useState(initialAgreement.phone || "");
  const [email, setEmail] = useState(initialAgreement.email || "");
  const [address, setAddress] = useState(initialAgreement.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialAgreement.dateOfBirth ? initialAgreement.dateOfBirth.split("T")[0] : ""
  );
  const [emergencyContactName, setEmergencyContactName] = useState(initialAgreement.emergencyContactName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialAgreement.emergencyContactPhone || "");
  
  // Signature and Compliance Checkboxes
  const [signatureData, setSignatureData] = useState(initialAgreement.signatureData || "");
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [confirmPolicies, setConfirmPolicies] = useState(false);
  const [confirmBinding, setConfirmBinding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignatureSave = (base64: string) => {
    setSignatureData(base64);
    toast.success("Signature captured successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureData) {
      toast.error("Please draw and save your digital signature on the signature pad.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Full legal name is required.");
      return;
    }
    if (!nationalId.trim()) {
      toast.error("National ID / NIN / Passport number is required for legal identification.");
      return;
    }
    if (!confirmAccurate || !confirmPolicies || !confirmBinding) {
      toast.error("Please review and tick all mandatory agreement check-boxes below.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitStaffSignature({
        id: agreement.id,
        fullName,
        nationalId,
        phone,
        email,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        emergencyContactName,
        emergencyContactPhone,
        signatureData,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined
      });

      if (res.success) {
        toast.success("Staff Agreement & Digital Signature Recorded Successfully!", {
          description: "Your official verified compliance certificate is now active."
        });
        setAgreement((prev: any) => ({
          ...prev,
          status: "SIGNED",
          fullName,
          signerFullName: fullName,
          nationalId,
          phone,
          email,
          address,
          signatureData,
          signedAt: res.signedAt || new Date().toISOString()
        }));
        setIsSigned(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-12 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">ProTech Enterprise Compliance</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="font-mono text-xs font-bold text-slate-500">{agreement.agreementNumber}</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-white truncate">
                {agreement.business?.name || "Enterprise Operations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isSigned ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black uppercase tracking-wider px-3 py-1 gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Officially Signed
              </Badge>
            ) : (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-black uppercase tracking-wider px-3 py-1 gap-1.5">
                <Clock className="h-3.5 w-3.5 animate-pulse" /> Pending Staff Signature
              </Badge>
            )}

            {isSigned && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            )}
          </div>
        </div>

        {/* OFFICIAL AGREEMENT DOCUMENT CONTAINER */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
          
          {/* Official Letterhead Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 relative overflow-hidden print:bg-none print:text-black print:p-0 print:border-b-2 print:border-black print:pb-4">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-[0.25em] print:text-black">
                  <Stamp className="h-4 w-4" /> Legal Employment &amp; Staff Compliance Record
                </div>
                <h1 className="text-2xl sm:text-4xl font-[1000] tracking-tight uppercase print:text-2xl">
                  Staff Agreement &amp; Code of Conduct
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed print:text-slate-600">
                  Official operational engagement, cashier fiduciary accountability, inventory custody, and non-disclosure agreement for {agreement.business?.name}.
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-1 font-mono text-xs text-slate-300 print:text-black shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 print:text-black">Agreement Serial ID</span>
                <span className="text-base sm:text-lg font-black text-white print:text-black">{agreement.agreementNumber}</span>
                <span className="text-[10px] text-slate-400">Effective: {agreement.startDate ? format(new Date(agreement.startDate), "PPP") : "Immediate"}</span>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
          </div>

          {/* DOCUMENT BODY */}
          <div className="p-6 sm:p-10 space-y-8 print:p-0 print:pt-6">
            
            {/* 1. Engagement & Assignment Details */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 print:border-black">
                <Building2 className="h-4 w-4" /> Section 1: Enterprise Organization &amp; Role Details
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Assigned Store / Node</span>
                  <span className="font-black text-slate-800 dark:text-white">{agreement.business?.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Job Designation</span>
                  <span className="font-black text-slate-800 dark:text-white">{agreement.jobTitle}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Department</span>
                  <span className="font-black text-slate-800 dark:text-white">{agreement.department || "Retail Operations"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Employment Type</span>
                  <span className="font-black text-slate-800 dark:text-white">{agreement.employmentType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* 2. Staff Member Profile Information */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 print:border-black">
                <User className="h-4 w-4" /> Section 2: Staff Identification &amp; Contact Record
              </h3>

              {!isSigned ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Full Legal Name *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John K. Kamara"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">National ID / NIN / Passport No. *</Label>
                    <Input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="e.g. SL-NIN-99482710"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Primary Phone Number *</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +232 78 123456"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. staff@enterprise.com"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Residential Physical Address</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Wilkinson Road, Freetown"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Date of Birth</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="rounded-xl h-11 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Emergency Contact Person</Label>
                    <Input
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Mary Kamara (Spouse/Parent)"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Emergency Contact Phone</Label>
                    <Input
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. +232 76 987654"
                      className="rounded-xl h-11 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Staff Full Name</span>
                    <span className="font-black text-slate-900 dark:text-white">{agreement.fullName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">National ID / NIN</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{agreement.nationalId || "Verified on File"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{agreement.phone}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate block">{agreement.email || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Residential Address</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate block">{agreement.address || "On File"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Emergency Contact</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate block">
                      {agreement.emergencyContactName ? `${agreement.emergencyContactName} (${agreement.emergencyContactPhone || ""})` : "On File"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Operational Policies, Code of Conduct & Fiduciary Rules */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 print:border-black">
                <FileText className="h-4 w-4" /> Section 3: ProTech Policy Articles &amp; Fiduciary Obligations
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Article I — ProTech Professional Integrity &amp; Operational Conduct
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The ProTech staff member agrees to uphold the highest standard of honesty, punctuality, and diligence in all duties. Staff must execute assigned duties faithfully and adhere strictly to ProTech Assist SL standard operating procedures.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Article II — Cash Register, POS Terminal &amp; Monetary Custody
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Staff operating cash registers, POS systems, or handling physical money, mobile money (Orange Money / AfriMoney), or card payments are strictly accountable for all tenders received. Every transaction must be entered directly into the system. Cash drawers must reconcile exactly against shift settlement ledgers. Under-rings, unauthorized credits, and unreported cash shortages will be treated as serious breaches of duty.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Article III — Inventory Custody &amp; Zero Shrinkage Policy
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    All merchandise, raw materials, supplies, and tools within the business premises are the exclusive property of the enterprise. No item may be taken, consumed, transferred, or marked down without explicit managerial sign-off. Theft, product diversion, or intentional tampering with inventory levels constitutes gross misconduct and grounds for instant termination and police report.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Article IV — Confidentiality, Trade Secrets &amp; Non-Disclosure (NDA)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Staff shall not disclose or transmit any proprietary business figures, sales totals, supplier pricing, customer contact books, trade formulas, or system passwords to third parties, competitors, or external entities during or after employment.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">
                    Article V — System Monitoring, Audit Trails &amp; Legal Enforcement
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The staff member consents to the recording of all terminal actions, POS sales, stock movements, and system logs under their operator profile. This agreement is legally binding under applicable labor and civil laws.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. DIGITAL SIGNATURE SECTION */}
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 print:border-black">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <FileSignature className="h-4 w-4" /> Section 4: Digital Signature &amp; Binding Agreement
              </h3>

              {!isSigned ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Digital Signature Pad */}
                  <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border-2 border-indigo-500/30 dark:border-indigo-500/20 space-y-4">
                    <DigitalSignaturePad
                      label="Staff Member Hand-Drawn Signature"
                      description="Use your finger, touchscreen stylus pen, or mouse to draw your official signature in the box below."
                      initialSignature={signatureData}
                      signerName={fullName}
                      signerRole={agreement.jobTitle}
                      onSaveSignature={handleSignatureSave}
                    />
                  </div>

                  {/* Mandatory Checkboxes */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-3 text-xs sm:text-sm">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmAccurate}
                        onChange={(e) => setConfirmAccurate(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        I hereby certify that all my personal information, National ID, and contact records entered above are accurate, valid, and truthful.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmPolicies}
                        onChange={(e) => setConfirmPolicies(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        I have thoroughly read and voluntarily agree to adhere to Articles I through V above, including cashier reconciliation, inventory protection, and confidentiality.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmBinding}
                        onChange={(e) => setConfirmBinding(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        I acknowledge and accept that my digital hand-drawn signature affixed to this form carries full legal validity and is binding upon me.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !signatureData || !confirmAccurate || !confirmPolicies || !confirmBinding}
                    className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-emerald-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-[1000] uppercase text-xs sm:text-sm tracking-widest shadow-xl shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Verifying &amp; Recording Signature...</span>
                      </>
                    ) : (
                      <>
                        
                        <span>Sign &amp; Formally Accept Enterprise Agreement</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* OFFICIAL SIGNED SIGNATURE DISPLAY */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/30 text-xs sm:text-sm">
                  {/* Staff Signature Box */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Signed Staff Signature
                    </span>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                      {agreement.signatureData ? (
                        <img 
                          src={agreement.signatureData} 
                          alt="Staff Hand-Drawn Signature" 
                          className="max-h-24 max-w-full object-contain"
                        />
                      ) : (
                        <p className="text-xs text-slate-400 italic">Signature recorded</p>
                      )}
                    </div>
                    <div className="text-center font-mono text-[11px] text-slate-500">
                      Signer: <span className="font-bold text-slate-800 dark:text-slate-200">{agreement.fullName}</span> ({agreement.jobTitle})
                    </div>
                  </div>

                  {/* Verification Record Seal */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-emerald-500" /> Official Authentication Stamp
                      </span>
                      <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[10px] uppercase">Status:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">VERIFIED &amp; EXECUTED</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[10px] uppercase">Signed Date:</span>
                          <span className="font-mono">{agreement.signedAt ? format(new Date(agreement.signedAt), "PPP 'at' p") : "Verified"}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[10px] uppercase">Agreement Code:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{agreement.agreementNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[10px] uppercase">Audit Ledger:</span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Immutable Hash Recorded</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold text-center">
                      ✓ This document is an active, legally recognized staff contract under the Enterprise OS.
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
