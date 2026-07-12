"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt, AlertCircle, CheckCircle2 } from "lucide-react";
import { getPendingMedicalBills, payMedicalBill } from "@/app/actions/clinic-billing";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MedicalBillsModalProps {
  onPaymentSuccess?: (receiptData: any) => void;
}

export function MedicalBillsModal({ onPaymentSuccess }: MedicalBillsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const fetchBills = async () => {
    setLoading(true);
    const res = await getPendingMedicalBills();
    if (res.success) {
      setBills(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchBills();
    }
  }, [isOpen]);

  const handlePay = async (billId: string, amount: number) => {
    setPayingBillId(billId);
    try {
      const res = await payMedicalBill(billId, "CASH", amount); // Defaults to cash for quick pay
      if (res.success) {
        toast.success("Medical bill paid successfully!");
        fetchBills();
        if (onPaymentSuccess && res.data) {
          onPaymentSuccess({
            id: res.data.id,
            transactionId: res.data.invoiceNumber,
            total: res.data.totalAmount,
            paid: res.data.totalAmount,
            paymentMethod: "CASH",
            customerName: res.data.patient?.name || "Walk-in Patient",
            items: res.data.items?.map((item: any) => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.total
            })) || [],
            cashierName: res.data.user?.name || "Cashier",
            businessName: res.data.business?.name || "Clinic",
            businessAddress: res.data.business?.address || "",
            businessPhone: res.data.business?.phone || ""
          });
        }
      } else {
        toast.error(res.error || "Failed to pay bill");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setPayingBillId(null);
    }
  };

  const getAvatar = (name: string) => {
     const initial = name ? name.charAt(0).toUpperCase() : '?';
     return (
        <div className="h-8 w-8 rounded-full bg-muted/80 border border-border text-muted-foreground flex items-center justify-center font-black text-xs shrink-0 overflow-hidden relative">
          <img src={`https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Avatar" />
        </div>
     );
  };

  const grandTotal = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-brand-500/50 bg-brand-500/10 font-black text-[10px] uppercase tracking-widest gap-2 text-brand-400 hover:bg-brand-500/30 hover:text-foreground transition-all shadow-[0_0_15px_-3px_#14b8a6]">
          <Receipt className="h-4 w-4" />
          Medical Bills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-card/95 backdrop-blur-3xl border border-border text-foreground shadow-2xl rounded-[2rem] p-6 sm:p-8">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none"></div>
        
        <DialogHeader className="relative z-10 mb-6">
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            Medical Bills
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 space-y-6">
          
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-brand-400 tracking-tight">Unpaid Medical Bills</h2>
            <div className="text-base font-medium">Total Due: <span className="font-bold">Le {grandTotal.toLocaleString()}</span></div>
          </div>

          {/* Table Container */}
          <div className="border border-border rounded-xl overflow-hidden bg-card/50">
            <Table>
              <TableHeader className="bg-muted/30 hover:bg-muted/30">
                <TableRow className="border-border">
                  <TableHead className="font-bold text-muted-foreground">Patient</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Date</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Description</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Amount</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-bold tracking-widest uppercase text-xs">
                      Loading bills...
                    </TableCell>
                  </TableRow>
                ) : bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                       <div className="flex flex-col items-center">
                         <CheckCircle2 className="h-12 w-12 text-brand-500/30 mb-3" />
                         <p className="text-muted-foreground font-bold text-sm">No unpaid medical bills.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((bill) => {
                    // Extract a short description from items (e.g. "Consultation & Lab Test")
                    const descriptions = bill.items?.map((i: any) => i.productName) || [];
                    let descriptionStr = descriptions.join(' & ');
                    if (descriptionStr.length > 30) descriptionStr = descriptionStr.substring(0, 27) + '...';
                    if (!descriptionStr) descriptionStr = "Medical Services";

                    // Determine if overdue (e.g. older than 3 days)
                    const isOverdue = (new Date().getTime() - new Date(bill.createdAt).getTime()) > 3 * 24 * 60 * 60 * 1000;

                    return (
                      <TableRow key={bill.id} className="border-border hover:bg-muted/30 transition-colors group">
                        <TableCell>
                           <div className="flex items-center gap-3">
                             {getAvatar(bill.patient?.name)}
                             <span className="font-bold text-sm text-foreground">{bill.patient?.name || 'Walk-in'}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(bill.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {descriptionStr}
                        </TableCell>
                        <TableCell>
                           {isOverdue ? (
                             <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 rounded-md px-2 py-0.5 text-xs font-semibold">
                               Overdue
                             </Badge>
                           ) : (
                             <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 rounded-md px-2 py-0.5 text-xs font-semibold">
                               Unpaid
                             </Badge>
                           )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Le {Number(bill.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={payingBillId === bill.id}
                            onClick={() => handlePay(bill.id, Number(bill.totalAmount))}
                            className="rounded-lg border-border bg-card hover:bg-muted text-xs h-8 px-4 font-medium transition-colors"
                          >
                            {payingBillId === bill.id ? "Paying..." : "View/Pay"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="text-lg font-medium">Total Due: <span className="font-bold">Le {grandTotal.toLocaleString()}</span></div>
            <Button 
              className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-[0_0_15px_-3px_#14b8a6] px-8 h-12 font-bold transition-all"
              onClick={() => {
                // If they click the generic proceed, maybe pay the oldest or prompt them.
                // For now, we will just show a toast instructing them to select a row if they haven't.
                if (bills.length > 0) {
                  toast.info("Please click 'View/Pay' on a specific bill to process it.");
                } else {
                  toast.success("All bills are settled!");
                }
              }}
            >
              Proceed to Payment
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
