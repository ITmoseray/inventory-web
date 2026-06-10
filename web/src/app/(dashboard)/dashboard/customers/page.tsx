"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Pencil, Trash2, MoreVertical, Users, Search, Phone, Mail, MapPin,
  ChevronDown, UserPlus, FileDown, Globe, Database, CreditCard, Clock,
  ArrowRight, CheckCircle2, MessageSquare, Briefcase, Zap, Info, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/actions/customer";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [viewSearch, setViewSearch] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const VIEWS = [
    { val: "all", label: "All Customers" },
    { val: "active", label: "Active Customers" },
    { val: "crm", label: "CRM Customers" },
    { val: "duplicate", label: "Duplicate Customers" },
    { val: "inactive", label: "Inactive Customers" },
    { val: "overdue", label: "Overdue Customers" },
    { val: "unpaid", label: "Unpaid Customers" },
    { val: "new", label: "New Customers" }
  ];

  const filteredViews = VIEWS.filter(v => 
    v.label.toLowerCase().includes(viewSearch.toLowerCase())
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error("Failed to load customer database.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        toast.success("Customer profile updated.");
      } else {
        await createCustomer(formData);
        toast.success("New customer registered.");
      }
      setIsDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to save customer details.");
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this customer record permanently?")) {
      try {
        await deleteCustomer(id);
        toast.success("Customer record removed.");
        fetchCustomers();
      } catch (error) {
        toast.error("Operation failed.");
      }
    }
  }

  function handleEdit(customer: any) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Header with View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4">
           <DropdownMenu onOpenChange={(open) => !open && setViewSearch("")}>
              <DropdownMenuTrigger asChild>
                 <button className="group flex items-center gap-3 outline-none focus:outline-none text-left">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                       <Users className="h-5 w-5" />
                    </div>
                    <div>
                       <h1 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none flex items-center gap-3">
                          {VIEWS.find(v => v.val === viewFilter)?.label}
                          <ChevronDown className="h-5 w-5 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
                       </h1>
                    </div>
                 </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-4 min-w-[320px] bg-white animate-in zoom-in-95 duration-200" sideOffset={20}>
                 <div className="relative mb-4 px-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <Input 
                      placeholder="Search views..." 
                      value={viewSearch}
                      onChange={(e) => setViewSearch(e.target.value)}
                      className="h-10 pl-10 rounded-xl border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-600/10 transition-all"
                    />
                 </div>
                 <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
                    {filteredViews.map(item => (
                      <DropdownMenuItem 
                        key={item.val} 
                        onClick={() => setViewFilter(item.val)}
                        className={cn(
                          "rounded-xl h-12 font-black uppercase tracking-widest text-[10px] px-5 cursor-pointer transition-all flex items-center justify-between",
                          viewFilter === item.val 
                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                            : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        )}
                      >
                         {item.label}
                         {viewFilter === item.val && <CheckCircle2 className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                    {filteredViews.length === 0 && (
                      <div className="p-10 text-center space-y-2">
                         <Info className="h-6 w-6 text-slate-200 mx-auto" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No matching views found</p>
                      </div>
                    )}
                 </div>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
           <Dialog open={isDialogOpen} onOpenChange={(open) => {
             setIsDialogOpen(open);
             if (!open) {
               setEditingCustomer(null);
               resetForm();
             }
           }}>
             <DialogTrigger render={
               <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                 <Plus className="h-5 w-5" /> New
               </Button>
             } />
             <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
               <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Users size={120} />
                  </div>
                  <div className="relative z-10 space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">CRM Intelligence</p>
                     <DialogTitle className="text-3xl font-[1000] tracking-tighter uppercase italic leading-none">
                       {editingCustomer ? "Edit Profile" : "Register Customer"}
                     </DialogTitle>
                  </div>
               </div>
               <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity / Company Name</Label>
                     <Input
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       placeholder="e.g. Tech Enterprise"
                       className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:ring-4 focus:ring-indigo-600/10 font-bold"
                       required
                     />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                       <Input
                         value={formData.phone}
                         onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                         placeholder="+232..."
                         className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Node</Label>
                       <Input
                         type="email"
                         value={formData.email}
                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                         placeholder="intelligence@nexus.com"
                         className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Node Address</Label>
                     <Input
                       value={formData.address}
                       onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                       placeholder="Location details..."
                       className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold"
                     />
                   </div>
                 </div>
                 <div className="flex gap-3 pt-8">
                   <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-slate-100" onClick={() => setIsDialogOpen(false)}>
                     Terminate
                   </Button>
                   <Button type="submit" className="flex-1 h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                     {editingCustomer ? "Update Profile" : "Initialize Link"}
                   </Button>
                 </div>
               </form>
             </DialogContent>
           </Dialog>
           <Button 
             variant="outline" 
             onClick={() => toast.info("Preparing data import bridge...")}
             className="h-12 px-6 rounded-xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all"
           >
              <FileDown className="h-4 w-4" /> Import
           </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-6 animate-pulse">
           <div className="h-20 w-20 bg-slate-100 rounded-[2rem] flex items-center justify-center">
              <Users className="h-10 w-10 text-slate-300" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing CRM Sync...</p>
        </div>
      ) : customers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-50 dark:border-slate-800 text-center space-y-16"
        >
           <div className="space-y-8">
              <div className="relative mx-auto w-32 h-32">
                 <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] rotate-12 opacity-10" />
                 <div className="relative h-full w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
                    <UserPlus className="h-12 w-12 text-indigo-600" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Every sales starts <span className="text-indigo-600 text-5xl">with a customer</span></h2>
                 <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto italic">Create and manage your customers and their contact persons, all in one place.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <Button 
                   onClick={() => setIsDialogOpen(true)}
                   className="h-18 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 group"
                 >
                    <Plus className="mr-4 h-6 w-6 group-hover:scale-125 transition-transform" />
                    New Customer
                 </Button>
                 <Button 
                   variant="outline"
                   onClick={() => toast.info("Initializing secure file import...")}
                   className="h-18 px-12 rounded-2xl border-slate-200 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                 >
                    <FileDown className="mr-4 h-6 w-6" />
                    Import File
                 </Button>
              </div>
           </div>

           <div className="space-y-8 w-full max-w-xl border-t border-slate-50 dark:border-slate-800 pt-16">
              <div className="flex items-center justify-center gap-6">
                 <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">or import using</span>
                 <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { name: "Protech CRM", icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
                   { name: "Google Node", icon: Globe, color: "text-rose-600", bg: "bg-rose-50" },
                   { name: "Nexus 365", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                 ].map(source => (
                   <button key={source.name} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent hover:border-slate-200 transition-all group">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", source.bg)}>
                         <source.icon className={cn("h-6 w-6", source.color)} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{source.name}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-slate-50 dark:border-slate-800">
              {[
                { title: "Stay connected", desc: "Manage multiple contact persons per company.", icon: MessageSquare },
                { title: "Node Mapping", desc: "Handle multiple addresses effortlessly.", icon: MapPin },
                { title: "Portal Access", desc: "Provide dedicated node access to customers.", icon: ShieldCheck },
                { title: "Multi-Currency", desc: "Initialize transactions in any global currency.", icon: CreditCard },
              ].map(benefit => (
                <div key={benefit.title} className="text-left space-y-3 group">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <benefit.icon className="h-5 w-5" />
                   </div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">{benefit.title}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
           </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Active Data List View */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-4 rounded-3xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                placeholder="Search across customer nodes..." 
                className="pl-12 h-12 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          <div className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden border border-slate-50 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-8 h-16">Client Intelligence Node</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-16">Contact Credentials</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-16">Deployment Location</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest text-center h-16">Sync Status</TableHead>
                  <TableHead className="w-[100px] pr-8 h-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 border-none group transition-all">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-[1000] text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase italic">{customer.name}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Established: {format(new Date(customer.createdAt), "MMM yyyy")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {customer.phone && (
                          <div className="text-xs font-black text-slate-600 dark:text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                             <Phone className="h-3 w-3 text-indigo-400" /> {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 lowercase tracking-tight">
                             <Mail className="h-3 w-3 text-slate-300" /> {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest italic">
                        <MapPin className="h-3.5 w-3.5 text-rose-400" />
                        {customer.address || "Zone Unmapped"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-500 text-[9px] font-[1000] uppercase tracking-widest">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Sync
                      </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-100">
                            <MoreVertical className="h-5 w-5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 w-48">
                          <DropdownMenuItem onClick={() => handleEdit(customer)} className="rounded-xl h-11 font-black uppercase tracking-widest text-[10px] gap-3">
                            <Pencil className="h-4 w-4 text-indigo-600" /> Edit Node
                          </DropdownMenuItem>
                          <div className="h-px bg-slate-50 my-1" />
                          <DropdownMenuItem 
                            className="rounded-xl h-11 font-black uppercase tracking-widest text-[10px] gap-3 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Terminate Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// Format date helper (simplified)
function format(date: Date, pattern: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  if (pattern === "MMM yyyy") return `${m} ${y}`;
  return date.toLocaleDateString();
}
