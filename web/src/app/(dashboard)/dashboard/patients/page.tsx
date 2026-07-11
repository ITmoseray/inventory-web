"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, ShieldCheck, Heart, Phone, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPatients, createPatient } from "@/lib/actions/patient";
import { format } from "date-fns";
import Link from "next/link";

export default function PatientsRegistryPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      toast.error("Failed to load patient registry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return toast.error("Patient name is required.");

    try {
      setSubmitting(true);
      const res = await createPatient({
        name,
        dateOfBirth: dob || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        allergies: allergies || undefined,
        medicalNotes: medicalNotes || undefined,
      });

      if (res.success) {
        toast.success(`Patient "${name}" registered successfully.`);
        setIsDialogOpen(false);
        // Reset form
        setName("");
        setDob("");
        setGender("");
        setPhone("");
        setEmail("");
        setAddress("");
        setAllergies("");
        setMedicalNotes("");
        fetchPatients();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register patient.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Patient <span className="text-indigo-650 dark:text-indigo-400">Registry</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage client health profiles and drug summaries.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-indigo-500/25">
              <Plus className="h-4 w-4" /> Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-[1000] tracking-tight uppercase text-slate-900 dark:text-white">Register Patient Profile</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">Create a secure medical record card for checkups and prescriptions.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Patient Name *</Label>
                  <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fatmata Kamara" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dob" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Date of Birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Gender</Label>
                  <select id="gender" value={gender} onChange={e => setGender(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm">
                    <option value="">Select Gender</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 23277123456" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. fatmata@example.com" className="rounded-xl" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Home Address</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 45 Siaka Stevens St, Freetown" className="rounded-xl" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="allergies" className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Known Allergies / Contraindications</Label>
                  <Input id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Sulfa drugs" className="rounded-xl border-rose-200 focus:border-rose-500" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="medicalNotes" className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider">Medical Notes</Label>
                  <Input id="medicalNotes" value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="e.g. Diabetic, hypertensive under treatment" className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 text-xs">Cancel</Button>
                <Button type="submit" disabled={submitting} className="rounded-xl h-11 bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-6 font-bold">{submitting ? "Registering..." : "Save Profile"}</Button>
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
            placeholder="Search patients by name or phone..."
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
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Patient Name</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">DOB / Gender</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Contact Info</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-rose-500">Allergies</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Prescriptions</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-850">
                  <TableCell colSpan={6} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50" />
                </TableRow>
              ))
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold italic">
                  No patient profiles registered yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map(patient => (
                <TableRow key={patient.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-850 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{patient.name}</span>
                        {patient.medicalNotes && (
                          <span className="text-[10px] text-slate-400 font-bold max-w-xs truncate">{patient.medicalNotes}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-700 dark:text-slate-350">
                      <span className="font-bold">
                        {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy") : "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">
                        {patient.gender || "UNSPECIFIED"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      {patient.phone ? (
                        <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {patient.phone}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No phone</span>
                      )}
                      {patient.address && (
                        <span className="text-[10px] text-slate-400 truncate max-w-xs">{patient.address}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.allergies ? (
                      <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-tight">
                        {patient.allergies}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">None noted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-350">
                      <FileText className="h-4 w-4 text-slate-400" /> {patient.prescriptions?.length || 0} Prescribed
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link href={`/dashboard/patients/${patient.id}`}>
                       <Button variant="outline" size="sm" className="rounded-xl shadow-sm text-xs h-8">
                          View Profile
                       </Button>
                    </Link>
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
