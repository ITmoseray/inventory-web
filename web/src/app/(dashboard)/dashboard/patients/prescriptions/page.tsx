"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, User, Calendar, CheckCircle2, ShieldAlert, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
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
import { toast } from "sonner";
import { getPrescriptions, createPrescription, dispensePrescription, updatePrescription, deletePrescription } from "@/lib/actions/prescription";
import { getPatients } from "@/lib/actions/patient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any | null>(null);

  // Form State
  const [patientId, setPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  async function fetchPrescriptions() {
    try {
      setLoading(true);
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (e) {
      toast.error("Failed to load prescriptions ledger.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      console.error("Failed to fetch patients list:", e);
    }
  }

  const openAddDialog = () => {
    setEditingPrescription(null);
    setPatientId("");
    setDoctorName("");
    setNotes("");
    setInstructions("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (rx: any) => {
    setEditingPrescription(rx);
    setPatientId(rx.patientId);
    setDoctorName(rx.doctorName);
    setNotes(rx.notes || "");
    setInstructions(rx.instructions || "");
    setIsDialogOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) return toast.error("Please select a patient.");
    if (!doctorName) return toast.error("Doctor's name is required.");
    if (!notes) return toast.error("Please enter the medication notes.");

    try {
      setSubmitting(true);
      
      let res;
      if (editingPrescription) {
        res = await updatePrescription(editingPrescription.id, {
          patientId,
          doctorName,
          notes,
          instructions: instructions || undefined,
        });
      } else {
        res = await createPrescription({
          patientId,
          doctorName,
          notes,
          instructions: instructions || undefined,
        });
      }

      if (res.success) {
        toast.success(editingPrescription ? "Prescription updated successfully." : "Prescription registered successfully.");
        setIsDialogOpen(false);
        setPatientId("");
        setDoctorName("");
        setNotes("");
        setInstructions("");
        setEditingPrescription(null);
        fetchPrescriptions();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save prescription.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDispense(id: string) {
    try {
      const res = await dispensePrescription(id);
      if (res.success) {
        toast.success("Prescription dispensed and updated.");
        fetchPrescriptions();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispense prescription.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this prescription?")) return;
    try {
      const res = await deletePrescription(id);
      if (res.success) {
        toast.success("Prescription deleted successfully.");
        fetchPrescriptions();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete prescription.");
    }
  }


  const filteredPrescriptions = prescriptions.filter(p =>
    p.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Prescription <span className="text-indigo-650 dark:text-indigo-400">Terminal</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Dispense and monitor doctor medical authorizations.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingPrescription(null);
        }}>
          <Button onClick={openAddDialog} className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4" /> Add Prescription
          </Button>
          <DialogContent className="sm:max-w-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">
                {editingPrescription ? "Edit Doctor Prescription" : "Add Doctor Prescription"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                {editingPrescription ? "Modify patient dosage authorization and drug instructions." : "Record patient dosage authorization and drug instructions."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label htmlFor="patient" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Patient Name *</Label>
                <select id="patient" required value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="" className="bg-white dark:bg-slate-900">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">{p.name} {p.phone ? `(${p.phone})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="doctorName" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doctor Name *</Label>
                <Input id="doctorName" required value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="e.g. Dr. Lansana Conteh" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notes" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Medications & Dosages *</Label>
                <textarea id="notes" required value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Paracetamol 500mg - 2 tablets TDS x 5 days&#10;Amoxicillin 250mg - 1 capsule TDS x 7 days" className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="instructions" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Usage Instructions</Label>
                <Input id="instructions" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g. Take after meals, complete the antibiotics course" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white" />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setEditingPrescription(null);
                }} className="rounded-xl h-11 text-xs">Cancel</Button>
                <Button type="submit" disabled={submitting} className="rounded-xl h-11 bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-6 font-bold">
                  {submitting ? "Saving..." : editingPrescription ? "Update Rx" : "Save Rx"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Control Search Bar */}
      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-3xl">
        <div className="relative group max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
          <Input
            placeholder="Search prescriptions by Rx #, Patient, Doctor..."
            className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Directory Table */}
      <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-850">
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Rx Number</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Patient Name</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Doctor / Date</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Medications & Instructions</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="w-[120px] pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-850">
                  <TableCell colSpan={6} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                </TableRow>
              ))
            ) : filteredPrescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold italic">
                  No prescriptions recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredPrescriptions.map(rx => (
                <TableRow key={rx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-850 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="font-black text-slate-900 dark:text-white text-sm">{rx.prescriptionNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-slate-800 dark:text-white text-sm">{rx.patient.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-700 dark:text-slate-350">
                      <span className="font-bold">{rx.doctorName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {format(new Date(rx.dateIssued), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs max-w-md">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-pre-line">{rx.notes}</div>
                      {rx.instructions && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-wider uppercase">
                          Instruction: {rx.instructions}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      rx.status === "DISPENSED" 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}>
                      {rx.status}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                      {rx.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleDispense(rx.id)}
                          className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10"
                        >
                          Dispense
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(rx)}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-650 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 bg-transparent"
                            title="Edit Prescription"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(rx.id)}
                            className="h-8 w-8 p-0 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/20 bg-transparent"
                            title="Delete Prescription"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
