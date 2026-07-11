import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Clock, Stethoscope, FlaskConical, FileText } from "lucide-react";
import { format } from "date-fns";

export default async function PatientProfilePage({ params }: { params: { id: string } }) {
  const patientId = params.id;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        include: { doctor: true },
        orderBy: { appointmentDate: "desc" },
      },
      consultations: {
        include: { doctor: true },
        orderBy: { createdAt: "desc" },
      },
      labTests: {
        include: { doctor: true, labTechnician: true },
        orderBy: { createdAt: "desc" },
      },
      prescriptions: {
        orderBy: { dateIssued: "desc" },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Patient Electronic Health Record</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Demographics */}
        <div className="space-y-6">
           <Card className="rounded-2xl border-slate-100 shadow-sm">
             <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                   <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-3xl mb-4">
                     {patient.name.charAt(0)}
                   </div>
                   <h2 className="text-xl font-bold">{patient.name}</h2>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">{patient.gender || "Unknown Gender"}</p>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-sm">
                     <Phone className="h-4 w-4 text-slate-400" />
                     <span className="font-medium text-slate-700">{patient.phone || "No phone"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <MapPin className="h-4 w-4 text-slate-400" />
                     <span className="font-medium text-slate-700">{patient.address || "No address"}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                     <Calendar className="h-4 w-4 text-slate-400" />
                     <span className="font-medium text-slate-700">
                       {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy") : "Unknown DOB"}
                     </span>
                   </div>
                </div>

                {patient.allergies && (
                  <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100">
                     <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1">Allergies</h3>
                     <p className="text-sm font-bold text-rose-700">{patient.allergies}</p>
                  </div>
                )}
                
                {patient.medicalNotes && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                     <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Medical Notes</h3>
                     <p className="text-sm font-medium text-amber-800">{patient.medicalNotes}</p>
                  </div>
                )}
             </CardContent>
           </Card>
        </div>

        {/* Right Column - Clinical History */}
        <div className="md:col-span-2 space-y-6">
           
           {/* Consultations */}
           <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-black flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-indigo-600" /> Medical History (Consultations)
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                   {patient.consultations.length === 0 ? (
                     <div className="p-6 text-center text-sm text-slate-500">No consultations recorded.</div>
                   ) : (
                     patient.consultations.map(cons => (
                       <div key={cons.id} className="p-6 space-y-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500">
                              {format(new Date(cons.createdAt), "MMM dd, yyyy - hh:mm a")} • Dr. {cons.doctor?.name}
                            </p>
                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Visit Record</span>
                          </div>
                          {cons.diagnosis && (
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis</p>
                               <p className="font-bold text-slate-900">{cons.diagnosis}</p>
                            </div>
                          )}
                          {cons.doctorNotes && (
                            <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                               <p className="text-sm text-slate-700 whitespace-pre-wrap">{cons.doctorNotes}</p>
                            </div>
                          )}
                       </div>
                     ))
                   )}
                </div>
             </CardContent>
           </Card>

           {/* Lab Tests */}
           <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm uppercase tracking-widest text-slate-500 font-black flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-emerald-600" /> Lab Results
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                   {patient.labTests.length === 0 ? (
                     <div className="p-6 text-center text-sm text-slate-500">No lab tests recorded.</div>
                   ) : (
                     patient.labTests.map(test => (
                       <div key={test.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-bold text-sm text-slate-900">{test.testName}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {format(new Date(test.createdAt), "MMM dd, yyyy")} • Ordered by Dr. {test.doctor?.name}
                            </p>
                          </div>
                          <div className="flex-1 max-w-sm">
                             {test.status === 'COMPLETED' ? (
                               <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm text-emerald-800">
                                  {test.results}
                               </div>
                             ) : (
                               <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>
                             )}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}
