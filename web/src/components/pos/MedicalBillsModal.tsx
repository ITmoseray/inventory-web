"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt, AlertCircle, CheckCircle2 } from "lucide-react";
import { getPendingMedicalBills, payMedicalBill } from "@/app/actions/clinic-billing";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
        <div className="h-10 w-10 rounded-full bg-muted/80 border border-border text-muted-foreground flex items-center justify-center font-black text-sm shrink-0 overflow-hidden relative shadow-[0_0_10px_-2px_#14b8a6]">
          <img src={`https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Avatar" />
        </div>
     );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-teal-500/50 bg-teal-500/10 font-black text-[10px] uppercase tracking-widest gap-2 text-teal-400 hover:bg-teal-500/30 hover:text-foreground transition-all shadow-[0_0_15px_-3px_#14b8a6]">
          <Receipt className="h-4 w-4" />
          Medical Bills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] bg-card/95 backdrop-blur-3xl border border-border text-foreground shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none"></div>
        <DialogHeader className="relative z-10 border-b border-border pb-4">
          <DialogTitle className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30">
               <Receipt className="h-6 w-6 text-teal-400" /> 
            </div>
            Pending Medical Bills
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-teal-500/30 mb-4" />
              <p className="text-muted-foreground font-black uppercase tracking-widest text-sm">No pending medical bills</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="border border-white/5 rounded-2xl p-5 hover:border-teal-500/50 transition-all duration-300 bg-muted/50 backdrop-blur-xl group hover:shadow-[0_0_20px_-5px_#14b8a6]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    {getAvatar(bill.patient?.name)}
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{bill.patient?.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{bill.invoiceNumber} • {format(new Date(bill.createdAt), "MMM dd, hh:mm a")}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 rounded-full px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                    PENDING
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-5 bg-card/50 p-4 rounded-xl border border-white/5">
                  {bill.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-muted-foreground items-center">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                        {item.productName}
                      </span>
                      <span className="font-black font-mono">Le {Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-black text-2xl text-foreground font-mono tracking-tight"><span className="text-teal-500 text-lg">Le</span> {Number(bill.totalAmount).toLocaleString()}</span>
                  <Button 
                    onClick={() => handlePay(bill.id, Number(bill.totalAmount))}
                    disabled={payingBillId === bill.id}
                    className="bg-brand-500 hover:bg-brand-600 text-foreground rounded-full shadow-[0_0_15px_-3px_#14b8a6] px-8 h-12 font-black uppercase tracking-widest text-xs transition-all"
                  >
                    {payingBillId === bill.id ? "Processing..." : "Quick Pay (CASH)"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
