"use client";

import { useState, useEffect, useRef } from "react";
import { Search, RotateCcw, Package, AlertCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getRecentSales } from "@/lib/actions/sale";
import { processReturn } from "@/lib/actions/return";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ReturnsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    try {
      setLoading(true);
      const data = await getRecentSales();
      setSales(data);
    } catch (error) {
      toast.error("Failed to load recent sales.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectSale = (sale: any) => {
    setSelectedSale(sale);
    setReturnItems(sale.items.map((item: any) => ({
      ...item,
      returnQuantity: 0
    })));
    // Auto-scroll to the return form on mobile
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReturnQtyChange = (productId: string, qty: number) => {
    setReturnItems(returnItems.map(item => 
      item.productId === productId ? { ...item, returnQuantity: qty } : item
    ));
  };

  async function handleSubmitReturn() {
    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) return toast.error("Select items to return");

    try {
      await processReturn({
        saleId: selectedSale.id,
        items: itemsToReturn.map(item => ({
          productId: item.productId,
          quantity: item.returnQuantity
        })),
        reason: "Customer Return"
      });
      toast.success("Return processed. Inventory updated.");
      setSelectedSale(null);
      setReturnItems([]);
      fetchSales();
    } catch (error: any) {
      toast.error(error.message || "Failed to process return.");
    }
  }

  const filteredSales = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-[1000] tracking-tight text-slate-900 dark:text-white">Returns & RMA</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Handle product returns and restore inventory balances.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         {/* Search & Select Sale */}
         <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-3xl">
               <div className="relative group">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                     placeholder="Search by Invoice # (e.g. INV-2026...)" 
                     className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </Card>

            <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden overflow-x-auto custom-scrollbar w-full">
               <Table className="min-w-[400px]">
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                     <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-4 sm:pl-8">Invoice</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Customer</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-right pr-4 sm:pr-8">Value</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                       [1,2,3].map(i => <TableRow key={i} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/50 border-slate-50 dark:border-slate-800" />)
                     ) : filteredSales.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={3} className="h-32 text-center text-slate-400 dark:text-slate-500 font-bold italic">No matching sales found.</TableCell>
                        </TableRow>
                     ) : (
                        filteredSales.map((sale) => (
                           <TableRow 
                             key={sale.id} 
                             className={cn(
                               "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors",
                               selectedSale?.id === sale.id && "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
                             )}
                             onClick={() => handleSelectSale(sale)}
                           >
                              <TableCell className="pl-4 sm:pl-8 py-4">
                                 <div className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{sale.invoiceNumber}</div>
                                 <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{format(new Date(sale.createdAt), "MMM dd, yyyy")}</div>
                              </TableCell>
                              <TableCell>
                                 <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{sale.customer?.name || "Walk-in"}</div>
                              </TableCell>
                              <TableCell className="text-right pr-4 sm:pr-8">
                                 <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">Le {sale.totalAmount.toLocaleString()}</div>
                              </TableCell>
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

         {/* Return Processing Form */}
         <div className="space-y-6" ref={formRef}>
            {!selectedSale ? (
               <Card className="h-full border-dashed border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-[2rem] flex flex-col items-center justify-center p-6 sm:p-12 text-center min-h-[300px]">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm mb-6">
                     <RotateCcw className="h-12 w-12 text-slate-200 dark:text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 dark:text-slate-500">Select a transaction to begin return processing.</h3>
               </Card>
            ) : (
               <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-8 text-white">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500 rounded-lg">
                           <RotateCcw className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300">Inventory Restoration</span>
                     </div>
                     <h2 className="text-xl sm:text-2xl font-[1000] tracking-tight">Return for {selectedSale.invoiceNumber}</h2>
                  </div>

                  <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                     <div className="space-y-4">
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Select Items & Quantities</h3>
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto custom-scrollbar w-full">
                           <Table className="min-w-[300px] w-full">
                              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                 <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550">Product</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 text-center">Sold</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 text-right pr-6">Returning</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {returnItems.map((item) => (
                                    <TableRow key={item.productId} className="border-slate-50 dark:border-slate-800/50">
                                       <TableCell className="font-bold text-slate-700 dark:text-slate-300">{item.product?.name || "Product"}</TableCell>
                                       <TableCell className="text-center font-black text-slate-400 dark:text-slate-500">{item.quantity}</TableCell>
                                       <TableCell className="text-right pr-6">
                                          <Input 
                                             type="number"
                                             min="0"
                                             max={item.quantity}
                                             className="h-9 w-20 ml-auto rounded-lg text-right font-black border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white"
                                             value={item.returnQuantity}
                                             onChange={(e) => handleReturnQtyChange(item.productId, parseInt(e.target.value) || 0)}
                                          />
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </div>

                     <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                        <div className="flex gap-3">
                           <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                           <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
                              Proceeding will restore the selected quantities back to your inventory levels. This action will be logged in the stock movement ledger as a RETURN.
                           </p>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                           variant="outline" 
                           className="flex-1 h-12 rounded-xl font-bold border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                           onClick={() => setSelectedSale(null)}
                        >
                           Discard
                        </Button>
                        <Button 
                           className="flex-[2] h-12 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-200"
                           onClick={handleSubmitReturn}
                        >
                           Confirm Return
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            )}
         </div>
      </div>
    </div>
  );
}
