"use client";

import { useState, useEffect } from "react";
import { Search, CreditCard, Calendar, User, DollarSign, History, CheckCircle2, AlertCircle, MessageSquare, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getDebts, createDebtPayment } from "@/lib/actions/debt";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [ageFilter, setAgeFilter] = useState<"ALL" | "0-30" | "31-60" | "61-90" | "90+">("ALL");

  // Message Dialog State
  const [isMsgDialogOpen, setIsMsgDialogOpen] = useState(false);
  const [msgMode, setMsgMode] = useState<"whatsapp" | "sms">("whatsapp");
  const [msgDebt, setMsgDebt] = useState<any>(null);
  const [msgPhone, setMsgPhone] = useState("");
  const [msgText, setMsgText] = useState("");

  useEffect(() => {
    fetchDebts();
  }, []);

  async function fetchDebts() {
    try {
      setLoading(true);
      const data = await getDebts();
      setDebts(data);
    } catch (error) {
      toast.error("Failed to load debt records.");
    } finally {
      setLoading(false);
    }
  }

  const getDebtAgeInDays = (createdAtStr: string) => {
    const createdDate = new Date(createdAtStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredDebts = debts.filter(d => {
    const matchesSearch = d.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.sale?.invoiceNumber && d.sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (ageFilter === "ALL") return matchesSearch;
    const age = getDebtAgeInDays(d.createdAt);
    if (ageFilter === "0-30") return matchesSearch && age <= 30 && d.status !== "PAID";
    if (ageFilter === "31-60") return matchesSearch && age > 30 && age <= 60 && d.status !== "PAID";
    if (ageFilter === "61-90") return matchesSearch && age > 60 && age <= 90 && d.status !== "PAID";
    if (ageFilter === "90+") return matchesSearch && age > 90 && d.status !== "PAID";
    return matchesSearch;
  });

  const totalOutstanding = debts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const bucketCurrent = debts
    .filter(d => d.status !== "PAID" && getDebtAgeInDays(d.createdAt) <= 30)
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const bucketMild = debts
    .filter(d => {
      const age = getDebtAgeInDays(d.createdAt);
      return d.status !== "PAID" && age > 30 && age <= 60;
    })
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const bucketCritical = debts
    .filter(d => {
      const age = getDebtAgeInDays(d.createdAt);
      return d.status !== "PAID" && age > 60 && age <= 90;
    })
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  const bucketBad = debts
    .filter(d => d.status !== "PAID" && getDebtAgeInDays(d.createdAt) > 90)
    .reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);

  async function handlePayment() {
    if (paymentAmount <= 0) return toast.error("Enter a valid amount");
    if (paymentAmount > (selectedDebt.totalAmount - selectedDebt.paidAmount)) {
       return toast.error("Payment exceeds outstanding balance");
    }

    try {
      const result = await createDebtPayment(selectedDebt.id, paymentAmount, "CASH", paymentNote);
      if (result.success) {
        toast.success("Payment recorded successfully.");
        setIsPaymentDialogOpen(false);
        setPaymentAmount(0);
        setPaymentNote("");
        setSelectedDebt(null);
        fetchDebts();
      }
    } catch (error) {
      toast.error("Failed to record payment.");
    }
  }

  const openMessageDialog = (debt: any, mode: "whatsapp" | "sms") => {
    const customerPhone = debt.customer.phone || "";
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    
    const savedTemplates = localStorage.getItem("comm_templates");
    let template = "Dear {customer_name}, this is a friendly reminder from {business_name} that you have an outstanding balance of Le {outstanding_amount} due on {due_date}. Please contact us to settle. Thank you!";
    if (savedTemplates) {
      try {
        template = JSON.parse(savedTemplates).debt;
      } catch (e) {}
    }

    const businessName = "Protech Enterprise";
    const dueDateText = debt.dueDate ? format(new Date(debt.dueDate), "MMM dd, yyyy") : "immediate settlement";
    const formattedMessage = template
      .replaceAll("{customer_name}", debt.customer.name)
      .replaceAll("{business_name}", businessName)
      .replaceAll("{outstanding_amount}", Math.round(debt.totalAmount - debt.paidAmount).toLocaleString())
      .replaceAll("{due_date}", dueDateText);

    setMsgDebt(debt);
    setMsgMode(mode);
    setMsgPhone(cleanPhone || "232");
    setMsgText(formattedMessage);
    setIsMsgDialogOpen(true);
  };

  const executeMessageSend = () => {
    if (!msgDebt) return;
    
    // WhatsApp API strictly requires no plus signs, brackets, or dashes.
    const finalPhone = msgPhone.replace(/[^0-9]/g, "");
    
    if (msgMode === "whatsapp") {
      // api.whatsapp.com/send handles the handoff to native/web seamlessly and preserves the text parameter
      const waLink = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msgText)}`;
      window.open(waLink, "_blank");
      toast.success("WhatsApp redirection opened!");
    } else {
      const smsLink = `sms:${finalPhone}?body=${encodeURIComponent(msgText)}`;
      window.open(smsLink, "_self");
      toast.success("SMS app opened!");
    }
    
    setIsMsgDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-[1000]">Credit & Debt Ledger</h1>
          <p className="text-slate-500 font-medium">Track customer balances and manage account receivables.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-xl shadow-slate-100/50 bg-slate-900 text-white rounded-3xl overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <CardContent className="p-6">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Outstanding</div>
              <div className="text-3xl font-[1000] tracking-tighter">Le {Math.round(totalOutstanding).toLocaleString()}</div>
              <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Receivable from {debts.filter(d => d.status !== 'PAID').length} clients</p>
           </CardContent>
        </Card>
        <Card className="border-none shadow-xl shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
           <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settled This Month</div>
                 <div className="text-2xl font-black text-slate-900 dark:text-white">Le {Math.round(debts.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.paidAmount, 0)).toLocaleString()}</div>
              </div>
           </CardContent>
        </Card>
        <Card className="border-none shadow-xl shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
           <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                 <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue Accounts</div>
                 <div className="text-2xl font-black text-slate-900 dark:text-white">{debts.filter(d => d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'PAID').length}</div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Aging Portfolio Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <div 
          onClick={() => setAgeFilter(ageFilter === "0-30" ? "ALL" : "0-30")}
          className={cn(
            "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] duration-300",
            ageFilter === "0-30" 
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" 
              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
          )}
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Current (0-30 Days)</span>
          <span className="text-xl font-[1000] text-slate-900 dark:text-white mt-1 block">Le {Math.round(bucketCurrent).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-indigo-550 dark:text-indigo-400 mt-2 block uppercase">Standard Receivables</span>
        </div>
        <div 
          onClick={() => setAgeFilter(ageFilter === "31-60" ? "ALL" : "31-60")}
          className={cn(
            "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] duration-300",
            ageFilter === "31-60" 
              ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" 
              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
          )}
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mild Overdue (31-60 Days)</span>
          <span className="text-xl font-[1000] text-amber-600 dark:text-amber-400 mt-1 block">Le {Math.round(bucketMild).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-amber-550 dark:text-amber-400 mt-2 block uppercase">Follow-up Required</span>
        </div>
        <div 
          onClick={() => setAgeFilter(ageFilter === "61-90" ? "ALL" : "61-90")}
          className={cn(
            "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] duration-300",
            ageFilter === "61-90" 
              ? "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400" 
              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
          )}
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Critical (61-90 Days)</span>
          <span className="text-xl font-[1000] text-orange-600 dark:text-orange-400 mt-1 block">Le {Math.round(bucketCritical).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-orange-550 dark:text-orange-400 mt-2 block uppercase">High Collection Priority</span>
        </div>
        <div 
          onClick={() => setAgeFilter(ageFilter === "90+" ? "ALL" : "90+")}
          className={cn(
            "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] duration-300",
            ageFilter === "90+" 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455" 
              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
          )}
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Bad Debts (90+ Days)</span>
          <span className="text-xl font-[1000] text-rose-600 dark:text-rose-400 mt-1 block">Le {Math.round(bucketBad).toLocaleString()}</span>
          <span className="text-[9px] font-bold text-rose-550 dark:text-rose-400 mt-2 block uppercase">Write-off Warning</span>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-3xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full lg:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by customer name or invoice..." 
            className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {(["ALL", "0-30", "31-60", "61-90", "90+"] as const).map(item => (
            <Button
              key={item}
              variant={ageFilter === item ? "default" : "outline"}
              onClick={() => setAgeFilter(item)}
              className="h-9 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase"
            >
              {item === "ALL" ? "All Aging" : `${item} Days`}
            </Button>
          ))}
        </div>
      </Card>

      <div className="rounded-[2rem] border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800/50">
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-6">Customer & Transaction</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Balance Details</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Due Date</TableHead>
              <TableHead className="w-[120px] pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1,2,3].map(i => (
                <TableRow key={i} className="border-slate-50 dark:border-slate-800/50">
                  <TableCell colSpan={5} className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/50 first:rounded-l-[2rem] last:rounded-r-[2rem]" />
                </TableRow>
              ))
            ) : filteredDebts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold italic">
                  No debt records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDebts.map((debt) => (
                <TableRow key={debt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-50 dark:border-slate-800/50 group transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 dark:text-white text-sm">{debt.customer.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{debt.sale?.invoiceNumber || "Opening Balance"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-black text-slate-900 dark:text-white">Le {Math.round(debt.totalAmount - debt.paidAmount).toLocaleString()} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Left</span></div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total: Le {Math.round(debt.totalAmount).toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      debt.status === 'PAID' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                      debt.status === 'PARTIAL' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}>
                      {debt.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className={cn(
                        "text-xs font-bold",
                        debt.dueDate && new Date(debt.dueDate) < new Date() && debt.status !== 'PAID' ? "text-rose-500" : "text-slate-600 dark:text-slate-400"
                      )}>
                        {debt.dueDate ? format(new Date(debt.dueDate), "MMM dd, yyyy") : "No limit"}
                      </div>
                      {debt.status !== 'PAID' && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          Age: {getDebtAgeInDays(debt.createdAt)} Days
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                        {debt.status !== 'PAID' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 rounded-lg border-emerald-100 dark:border-emerald-900/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                              title="WhatsApp Reminder"
                              onClick={() => openMessageDialog(debt, "whatsapp")}
                            >
                              <MessageSquare size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 rounded-lg border-blue-100 dark:border-blue-900/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              title="SMS Reminder"
                              onClick={() => openMessageDialog(debt, "sms")}
                            >
                              <Smartphone size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-lg border-slate-100 dark:border-slate-800 font-bold text-xs dark:text-slate-300 dark:hover:bg-slate-800/50"
                              onClick={() => {
                                setSelectedDebt(debt);
                                setPaymentAmount(debt.totalAmount - debt.paidAmount);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              Record Payment
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black dark:text-white">Settle Debt</DialogTitle>
            <p className="text-slate-400 font-bold text-sm">Recording payment for {selectedDebt?.customer.name}</p>
          </DialogHeader>
          <div className="space-y-6 pt-6">
             <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Outstanding Balance</span>
                <span className="text-xl font-black text-primary">Le {selectedDebt ? Math.round(selectedDebt.totalAmount - selectedDebt.paidAmount).toLocaleString() : 0}</span>
             </div>
             <div className="space-y-2">
                <Label className="font-bold text-slate-700 dark:text-slate-300">Payment Amount (Le)</Label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                   <Input 
                     type="number"
                     value={paymentAmount}
                     onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                     className="h-12 pl-10 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <Label className="font-bold text-slate-700 dark:text-slate-300">Payment Note</Label>
                <Input 
                   type="text"
                   value={paymentNote}
                   placeholder="e.g. Paid via bank transfer"
                   onChange={(e) => setPaymentNote(e.target.value)}
                   className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
             </div>
             <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                <Button variant="ghost" className="font-bold text-slate-400" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                <Button className="rounded-xl px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black" onClick={handlePayment}>Confirm Payment</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMsgDialogOpen} onOpenChange={setIsMsgDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black dark:text-white">
              {msgMode === "whatsapp" ? "WhatsApp Reminder" : "SMS Reminder"}
            </DialogTitle>
            <p className="text-slate-400 font-bold text-sm">Review & send to {msgDebt?.customer.name}</p>
          </DialogHeader>
          <div className="space-y-6 pt-4">
             <div className="space-y-2">
                <Label className="font-bold text-slate-700 dark:text-slate-300">Customer Phone Number (with Country Code)</Label>
                <Input 
                   type="text"
                   value={msgPhone}
                   placeholder="e.g. 23277123456"
                   onChange={(e) => setMsgPhone(e.target.value)}
                   className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
             </div>
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Message Content</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(msgText);
                      toast.success("Message copied to clipboard!");
                    }}
                  >
                    Copy Message
                  </Button>
                </div>
                <Textarea 
                   value={msgText}
                   onChange={(e) => setMsgText(e.target.value)}
                   className="min-h-[120px] rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                />
             </div>
             <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                <Button variant="ghost" className="font-bold text-slate-400" onClick={() => setIsMsgDialogOpen(false)}>Cancel</Button>
                <a 
                   href={msgMode === "whatsapp" 
                     ? `https://wa.me/${msgPhone.replace(/[^0-9]/g, "")}/?text=${encodeURIComponent(msgText)}` 
                     : `sms:${msgPhone.replace(/[^0-9]/g, "")}?body=${encodeURIComponent(msgText)}`}
                   target={msgMode === "whatsapp" ? "_blank" : "_self"}
                   rel="noopener noreferrer"
                   className={cn(
                     "inline-flex items-center justify-center rounded-xl px-8 h-12 font-black text-white",
                     msgMode === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                   )} 
                   onClick={() => setIsMsgDialogOpen(false)}
                >
                   {msgMode === "whatsapp" ? "Send WhatsApp" : "Send SMS"}
                </a>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
