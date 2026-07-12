import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Clock, Stethoscope, FlaskConical, FileText, Receipt, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  // Calculate MRN (mock or based on ID)
  const mrn = `EHR-${patient.id.substring(0, 6).toUpperCase()}-SK`;
  
  const totalBill = patient.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
  const currentBalance = patient.sales.filter(s => s.paymentStatus === 'PENDING').reduce((sum, sale) => sum + Number(sale.totalAmount), 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-foreground p-2 sm:p-6 min-h-[80vh]">
      {/* Top Profile Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-border">
         <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-brand-500 overflow-hidden relative shadow-[0_0_25px_-5px_#14b8a6] shrink-0 bg-muted">
             <img src={`https://ui-avatars.com/api/?name=${patient.name}&background=14b8a6&color=fff&size=256`} alt={patient.name} className="object-cover w-full h-full opacity-90" />
         </div>
         <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Patient Profile</p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">{patient.name}</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-mono">MRN: {mrn}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Demographics & Medical History) */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Demographics */}
           <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden relative shadow-lg">
             {/* Glow effect on the edges mimicking the mockup */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-blue-500 opacity-80"></div>
             <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-brand-400/50 to-transparent opacity-80"></div>
             <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-blue-500/50 to-transparent opacity-80"></div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400/20 to-blue-500/20 opacity-80"></div>

             <div className="p-6 relative z-10">
               <h2 className="text-2xl font-bold mb-6 tracking-tight">Demographics</h2>
               
               <div className="space-y-4 text-sm sm:text-base">
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Name</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.name}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">DOB</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "dd-MMM-yyyy") : "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Gender</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.gender || "Not specified"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Nationality</span>
                   <span className="col-span-2 font-medium text-foreground">Nigerian</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Address</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.address || "Lagos, Nigeria"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Contact</span>
                   <span className="col-span-2 font-medium text-foreground flex flex-col">
                     <span>{patient.phone || "+234 812 345 6789"}</span>
                     <span className="text-sm">{patient.email || "sarah.a@email.com"}</span>
                   </span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 mt-2">
                   <span className="text-muted-foreground font-medium">Emergency Contact</span>
                   <span className="col-span-2 font-medium text-muted-foreground/70 italic">Not specified</span>
                 </div>
               </div>
             </div>
           </div>

           {/* Medical History */}
           <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden">
             {/* Subtle glow border */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-muted to-muted-foreground/30 opacity-50"></div>
             
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Medical History</h2>
              
              <div className="space-y-4 text-sm sm:text-base">
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Allergy</span>
                   <span className="col-span-2 font-medium text-foreground">{patient.allergies || "Peanuts - Severe"}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Conditions</span>
                   <span className="col-span-2 font-medium text-foreground">
                     Type 2 Diabetes<br/>
                     Hypertension
                   </span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Past Procedures</span>
                   <span className="col-span-2 font-medium text-foreground">Appendectomy 2018</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 border-b border-border/50 pb-4">
                   <span className="text-muted-foreground font-medium">Current Medications</span>
                   <span className="col-span-2 font-medium text-foreground">
                     Metformin 1000mg<br/>
                     Lisinopril 20mg
                   </span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <span className="text-muted-foreground font-medium">Immunizations</span>
                   <span className="col-span-2 font-medium text-foreground">Updated</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Right Column (Billing Ledger) */}
        <div className="xl:col-span-8">
           <div className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-xl shadow-lg flex flex-col h-full overflow-hidden">
             
             <div className="p-6 sm:p-8 border-b border-border bg-muted/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">Billing & Payments Ledger</h2>
                  <div className="flex gap-3 shrink-0">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-[0_0_15px_-3px_#3b82f6] h-10 px-5 text-sm font-bold transition-all">New Payment</Button>
                    <Button variant="outline" className="rounded-xl border-border bg-card/50 h-10 px-5 text-sm font-bold hover:bg-muted transition-all">View Full Ledger</Button>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground">Current Balance: <span className="font-bold text-foreground">Le {currentBalance.toLocaleString()}</span></p>
             </div>

             <div className="flex-1 overflow-x-auto p-6 sm:p-8 pt-4">
                <table className="w-full text-sm sm:text-base text-left">
                  <thead className="text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-4 font-medium px-2">Date</th>
                      <th className="py-4 font-medium px-2">Description</th>
                      <th className="py-4 font-medium px-2">Invoice #</th>
                      <th className="py-4 font-medium px-2 text-right">Amount</th>
                      <th className="py-4 font-medium px-2 text-center">Status</th>
                      <th className="py-4 font-medium px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {patient.sales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">No billing records found for this patient.</td>
                      </tr>
                    ) : (
                      patient.sales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-4 px-2 whitespace-nowrap text-muted-foreground">{format(new Date(sale.createdAt), "dd-MMM-yyyy")}</td>
                          <td className="py-4 px-2 truncate max-w-[200px] font-medium">Clinical Services</td>
                          <td className="py-4 px-2 font-mono text-muted-foreground">{sale.invoiceNumber}</td>
                          <td className="py-4 px-2 font-medium text-right">Le {Number(sale.totalAmount).toLocaleString()}</td>
                          <td className="py-4 px-2 text-center">
                            {sale.paymentStatus === 'PAID' ? (
                               <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-wider">Paid</span>
                            ) : sale.paymentStatus === 'PENDING' ? (
                               <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-black border border-amber-500/20 uppercase tracking-wider">Pending</span>
                            ) : (
                               <span className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-xs font-black border border-brand-500/20 uppercase tracking-wider">{sale.paymentStatus}</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-right">
                             <button className="text-muted-foreground/50 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                               <Trash2 className="h-4 w-4" />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-bold">
                      <td colSpan={3} className="py-6 px-2 text-foreground text-base">Total Bill</td>
                      <td className="py-6 px-2 text-right text-foreground text-base">Le {totalBill.toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
             </div>

             <div className="p-6 border-t border-border bg-muted/20 flex flex-wrap items-center justify-end gap-6 text-sm font-medium text-muted-foreground">
               <button className="hover:text-foreground transition-colors flex items-center gap-2"><FileText className="h-4 w-4"/> View invoice</button>
               <button className="hover:text-foreground transition-colors flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Pay Now</button>
               <button className="hover:text-foreground transition-colors flex items-center gap-2"><Receipt className="h-4 w-4"/> Download Statement</button>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
}
