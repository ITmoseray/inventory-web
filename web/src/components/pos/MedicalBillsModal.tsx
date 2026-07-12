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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-2xl border-teal-200 dark:border-teal-900 bg-teal-50 dark:bg-teal-900/20 font-black text-[10px] uppercase tracking-widest gap-2 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40">
          <Receipt className="h-4 w-4" />
          Medical Bills
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-500" /> Pending Medical Bills
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <CheckCircle2 className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold">No pending medical bills</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-teal-400 transition-colors bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{bill.patient?.name}</h3>
                    <p className="text-xs text-slate-500">{bill.invoiceNumber} • {format(new Date(bill.createdAt), "MMM dd, hh:mm a")}</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                    PENDING
                  </Badge>
                </div>
                
                <div className="space-y-1 mb-4">
                  {bill.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>{item.productName}</span>
                      <span className="font-bold">Le {Number(item.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-black text-lg text-slate-900 dark:text-white">Le {Number(bill.totalAmount).toLocaleString()}</span>
                  <Button 
                    onClick={() => handlePay(bill.id, Number(bill.totalAmount))}
                    disabled={payingBillId === bill.id}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg shadow-md"
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
