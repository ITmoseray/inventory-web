"use client";
 
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Mail, 
  Shield, 
  Trash2, 
  Edit2, 
  Lock,
  Sparkles,
  ArrowRight,
  Activity,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUsers, getRoles, createUser, deleteUser, updateUser } from "@/lib/actions/user";
import { getPermissions } from "@/lib/actions/role";
import { generateAIEmployeeProfile } from "@/lib/actions/ai";
import { format } from "date-fns";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ui/image-uploader";
import { uploadAvatar } from "@/lib/actions/upload";

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    roleId: "",
    specialization: "",
    phone: "",
    department: "",
    jobTitle: "",
    imageUrl: "",
    salary: "",
    hourlyRate: ""
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    specialization: "",
    phone: "",
    department: "",
    jobTitle: "",
    imageUrl: "",
    salary: "",
    hourlyRate: ""
  });
  const [aiLoading, setAiLoading] = useState(false);
  const AVATAR_SEEDS = ["Sarah", "Jessica", "Maria", "Sophia", "Chloe", "Felix", "Aneka", "Jocelyn", "Robert", "Bandit", "Tinkerbell", "Bella", "Snickers", "Garfield", "Peanut", "Socks", "Midnight"];

  const handleCustomUploadAdd = async (fd: FormData) => {
    const url = await uploadAvatar(fd);
    setFormData({...formData, imageUrl: url});
    return url;
  };

  const handleCustomUploadEdit = async (fd: FormData) => {
    const url = await uploadAvatar(fd);
    setEditFormData({...editFormData, imageUrl: url});
    return url;
  };

  async function handleAIAutofill() {
    try {
      setAiLoading(true);
      const res = await generateAIEmployeeProfile();
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          name: res.data.name,
          email: res.data.email,
          password: res.data.password
        }));
        toast.success("AI Profile generated!", {
          description: `Initialized profile for ${res.data.name}`
        });
      } else {
        toast.error("AI assistant was unable to generate profile.");
      }
    } catch (e: any) {
      toast.error("AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  }

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [userData, rolesData] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      setUsers(userData);
      setRoles(rolesData);
      
      const employeeRole = rolesData.find(r => r.name.toUpperCase() === "EMPLOYEE" || r.name === "Employee");
      if (employeeRole && !formData.roleId) {
        setFormData(prev => ({ ...prev, roleId: employeeRole.id }));
      }
    } catch (error) {
      toast.error("Failed to sync personnel data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId,
        specialization: formData.specialization || undefined,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        jobTitle: formData.jobTitle || undefined,
        imageUrl: formData.imageUrl || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
      });
      
      if (result && result.error) {
        throw new Error(result.error);
      }
      
      toast.success("Employee node initialized successfully.");
      setIsAddOpen(false);
      setFormData({ 
        name: "", 
        email: "", 
        password: "", 
        roleId: roles.find(r => r.name.toUpperCase() === "EMPLOYEE" || r.name === "Employee")?.id || "", 
        specialization: "",
        phone: "",
        department: "",
        jobTitle: "",
        imageUrl: "",
        salary: "",
        hourlyRate: ""
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize employee node.");
    }
  }

  function handleEditClick(user: any) {
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      roleId: user.roleId || "",
      specialization: user.specialization || "",
      phone: user.phone || "",
      department: user.department || "",
      jobTitle: user.jobTitle || "",
      imageUrl: user.imageUrl || "",
      salary: user.salary !== null && user.salary !== undefined ? user.salary.toString() : "",
      hourlyRate: user.hourlyRate !== null && user.hourlyRate !== undefined ? user.hourlyRate.toString() : ""
    });
    setEditingUserId(user.id);
    setIsEditOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUserId) return;
    try {
      await updateUser(editingUserId, {
        name: editFormData.name,
        email: editFormData.email,
        roleId: editFormData.roleId,
        specialization: editFormData.specialization || null,
        phone: editFormData.phone || null,
        department: editFormData.department || null,
        jobTitle: editFormData.jobTitle || null,
        imageUrl: editFormData.imageUrl || null,
        salary: editFormData.salary ? parseFloat(editFormData.salary) : null,
        hourlyRate: editFormData.hourlyRate ? parseFloat(editFormData.hourlyRate) : null
      });
      toast.success("Employee node updated successfully.");
      setIsEditOpen(false);
      setEditingUserId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update employee node.");
    }
  }

  // ... rest of the component (rest of the UI, excluding the permission checkbox logic) ...


  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to terminate this employee session?")) return;
    try {
      await deleteUser(id);
      toast.success("Employee node terminated.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to terminate node.");
    }
  }

  const filteredUsers = users.filter(u => {
     if (!u || typeof u !== 'object') return false;
     return (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (u.roleName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
  });

  console.log("DEBUG: filteredUsers before render:", filteredUsers);

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-xl text-white shadow-sm", colors.primary)}>
                 <Users className="h-5 w-5" />
              </div>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             Staff Directory
           </h1>
           <p className="text-slate-500 mt-1 text-sm">Manage your team, assign roles, and configure employee access policies.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
           <DialogTrigger render={
              <Button className={cn("rounded-xl text-white font-bold px-6 shadow-md transition-all", colors.primary)}>
                 <UserPlus className="h-4 w-4 mr-2" /> Add Employee
              </Button>
           } />
           <DialogContent className="rounded-2xl sm:rounded-3xl border-none shadow-2xl p-0 bg-white dark:bg-slate-950 w-[95vw] sm:w-auto sm:max-w-2xl md:max-w-3xl text-slate-900 dark:text-white overflow-hidden max-h-[95vh] flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                 <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Employee Profile</h3>
                    <p className="text-slate-500 text-sm mt-1">Register a new staff member and configure their access.</p>
                 </div>
                 <Button 
                   type="button" 
                   onClick={handleAIAutofill}
                   disabled={aiLoading}
                   variant="outline"
                   className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                 >
                   {aiLoading ? (
                     <Loader2 className="h-3 w-3 animate-spin" />
                   ) : (
                     <Sparkles className="h-3 w-3" />
                   )}
                   AI Autofill
                 </Button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6 overflow-y-scroll flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                       <Input required className="h-12 rounded-xl" value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                       <Input required type="email" className="h-12 rounded-xl" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Avatar (Optional)</Label>
                    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide mt-1">
                       {AVATAR_SEEDS.map(seed => {
                         const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`;
                         const isSelected = formData.imageUrl === url;
                         return (
                           <button
                             key={seed}
                             type="button"
                             onClick={() => setFormData({...formData, imageUrl: url})}
                             className={`relative h-16 w-16 rounded-2xl flex-shrink-0 transition-all border-4 overflow-hidden ${isSelected ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 opacity-70 hover:opacity-100 bg-slate-100 dark:bg-slate-800'}`}
                           >
                              <img src={url} alt={seed} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                                   <ShieldCheck className="h-2 w-2" />
                                </div>
                              )}
                           </button>
                         );
                       })}
                    </div>
                 </div>

                 <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium mb-2 mt-4">Or upload custom picture</p>
                    <ImageUploader 
                       value={formData.imageUrl || ""}
                       onChange={() => {}}
                       uploadAction={handleCustomUploadAdd}
                       label="Upload Custom Profile Picture"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</Label>
                       <Input required type="password" title="Set employee password"  className="h-12 rounded-xl" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">System Role</Label>
                       <Select value={formData.roleId || undefined} onValueChange={(v: string) => setFormData({...formData, roleId: v})}>
                          <SelectTrigger className="h-12 rounded-xl">
                             <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                             {roles.filter((r: any) => r.name !== 'SUPER_ADMIN' && r.name !== 'Super Admin').map((r: any) => (
                               <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 {roles.find((r: any) => r.id === formData.roleId)?.name?.toUpperCase() === "DOCTOR" && (
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Medical Specialization</Label>
                       <Input required className="h-12 rounded-xl" placeholder="e.g. Cardiology, Pediatrics" value={formData.specialization} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                  )}

                  {businessType === "OFFICE" && (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</Label>
                              <Select value={formData.department || undefined} onValueChange={(v: string) => setFormData({...formData, department: v})}>
                                 <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Department" />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                    {["Administration", "HR", "Finance", "IT / Engineering", "Sales & Marketing", "Operations"].map((d) => (
                                       <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title</Label>
                              <Input className="h-12 rounded-xl" placeholder="e.g. Accountant" value={formData.jobTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, jobTitle: e.target.value})} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</Label>
                              <Input type="tel" className="h-12 rounded-xl" placeholder="e.g. +232..." value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Salary (Monthly)</Label>
                              <Input type="number" step="0.01" className="h-12 rounded-xl" placeholder="Le 0.00" value={formData.salary} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, salary: e.target.value})} />
                           </div>
                        </div>
                     </>
                  )}
                 </div>
                 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                   <Button type="submit" className={cn("w-full h-12 rounded-xl text-white font-bold shadow-md transition-all", colors.primary)}>
                      Save Employee Profile
                   </Button>
                 </div>
              </form>
           </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
           <DialogContent className="rounded-2xl sm:rounded-3xl border-none shadow-2xl p-0 bg-white dark:bg-slate-950 w-[95vw] sm:max-w-2xl md:max-w-3xl text-slate-900 dark:text-white overflow-hidden max-h-[95vh] flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                 <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Employee Profile</h3>
                    <p className="text-slate-500 text-sm mt-1">Modify staff details and update access permissions.</p>
                 </div>
              </div>
              <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6 overflow-y-scroll flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                       <Input required className="h-12 rounded-xl" value={editFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                       <Input required type="email" className="h-12 rounded-xl" value={editFormData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, email: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Avatar (Optional)</Label>
                    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide mt-1">
                       {AVATAR_SEEDS.map(seed => {
                         const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=e2e8f0`;
                         const isSelected = editFormData.imageUrl === url;
                         return (
                           <button
                             key={seed}
                             type="button"
                             onClick={() => setEditFormData({...editFormData, imageUrl: url})}
                             className={`relative h-16 w-16 rounded-2xl flex-shrink-0 transition-all border-4 overflow-hidden ${isSelected ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 opacity-70 hover:opacity-100 bg-slate-100 dark:bg-slate-800'}`}
                           >
                              <img src={url} alt={seed} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                                   <ShieldCheck className="h-2 w-2" />
                                </div>
                              )}
                           </button>
                         );
                       })}
                    </div>
                 </div>
                 <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium mb-2 mt-4">Or upload custom picture</p>
                    <ImageUploader 
                       value={editFormData.imageUrl || ""}
                       onChange={() => {}}
                       uploadAction={handleCustomUploadEdit}
                       label="Upload Custom Profile Picture"
                    />
                 </div>
                 <div className="space-y-2 w-full md:w-1/2 md:pr-2">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">System Role</Label>
                    <Select value={editFormData.roleId || undefined} onValueChange={(v: string) => setEditFormData({...editFormData, roleId: v})}>
                       <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Select Role" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                          {roles.filter((r: any) => r.name !== 'SUPER_ADMIN' && r.name !== 'Super Admin').map((r: any) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>

                 {roles.find((r: any) => r.id === editFormData.roleId)?.name?.toUpperCase() === "DOCTOR" && (
                    <div className="space-y-2">
                       <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Medical Specialization</Label>
                       <Input required className="h-12 rounded-xl" placeholder="e.g. Cardiology, Pediatrics" value={editFormData.specialization} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, specialization: e.target.value})} />
                    </div>
                  )}

                  {businessType === "OFFICE" && (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</Label>
                              <Select value={editFormData.department || undefined} onValueChange={(v: string) => setEditFormData({...editFormData, department: v})}>
                                 <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder="Department" />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-xl">
                                    {["Administration", "HR", "Finance", "IT / Engineering", "Sales & Marketing", "Operations"].map((d) => (
                                       <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Job Title</Label>
                              <Input className="h-12 rounded-xl" placeholder="e.g. Accountant" value={editFormData.jobTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, jobTitle: e.target.value})} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</Label>
                              <Input type="tel" className="h-12 rounded-xl" placeholder="e.g. +232..." value={editFormData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, phone: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Salary (Monthly)</Label>
                              <Input type="number" step="0.01" className="h-12 rounded-xl" placeholder="Le 0.00" value={editFormData.salary} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, salary: e.target.value})} />
                           </div>
                        </div>
                     </>
                  )}
                 </div>
                 <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                   <Button type="submit" className={cn("w-full h-12 rounded-xl text-white font-bold shadow-md transition-all", colors.primary)}>
                      Save Configuration
                   </Button>
                 </div>
              </form>
           </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Active Nodes", value: users.length.toString().padStart(2, '0'), icon: Users, color: "text-blue-500" },
           { label: "Privileged Access", value: users.filter((u: any) => u.roleName === 'ADMIN').length.toString().padStart(2, '0'), icon: ShieldCheck, color: "text-emerald-500" },
           { label: "Connectivity", value: "99.8%", icon: Activity, color: "text-indigo-500" },
           { label: "Pending Logs", value: "00", icon: Mail, color: "text-slate-400" }
         ].map((stat, i) => (
           <Card key={i} className="border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
              <stat.icon className={cn("h-5 w-5 mb-4", stat.color)} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
              <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white tracking-tighter">{stat.value}</h2>
           </Card>
         ))}
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search staff or roles..." 
                className="h-10 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-10 w-10 rounded-xl border-slate-200 flex items-center justify-center">
              <Filter className="h-4 w-4 text-slate-400" />
           </Button>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto w-full">
              <Table className="min-w-[800px] sm:min-w-full">
                <TableHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-12 font-bold text-xs text-slate-500 px-6">Employee</TableHead>
                    {businessType === "OFFICE" && (
                      <>
                        <TableHead className="h-12 font-bold text-xs text-slate-500">Department</TableHead>
                        <TableHead className="h-12 font-bold text-xs text-slate-500">Phone</TableHead>
                        <TableHead className="h-12 font-bold text-xs text-slate-500">Salary</TableHead>
                      </>
                    )}
                    <TableHead className="h-12 font-bold text-xs text-slate-500">Role</TableHead>
                    <TableHead className="h-12 font-bold text-xs text-slate-500">Join Date</TableHead>
                    <TableHead className="h-12 font-bold text-xs text-slate-500 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
               {loading ? (
                 Array.from({ length: 3 }).map((_, i) => <TableRow key={i} className="h-20 border-b animate-pulse"><TableCell colSpan={6} /></TableRow>)
               ) : filteredUsers.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      No employees found matching your criteria.
                   </TableCell>
                 </TableRow>
               ) : (
                filteredUsers.map((u) => {
                  return (
                  <TableRow key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors h-20">
                    <TableCell className="px-6">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                             <AvatarImage src={u.imageUrl || undefined} alt={u.name || "User"} />
                             <AvatarFallback className="rounded-xl bg-transparent">{String(u.name || "U").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                             <div className="font-bold text-slate-900 dark:text-white">{String(u.name || "")}</div>
                             <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                {String(u.email || "")}
                                {u.jobTitle && (
                                  <>
                                    <span className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                    <span>{u.jobTitle}</span>
                                  </>
                                )}
                             </div>
                          </div>
                       </div>
                    </TableCell>
                    {businessType === "OFFICE" && (
                      <>
                        <TableCell>
                           <div className="text-sm text-slate-700 dark:text-slate-300">{u.department || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm text-slate-500">{u.phone || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm font-medium text-slate-900 dark:text-white">
                             {u.salary !== null && u.salary !== undefined ? `Le ${Number(u.salary).toLocaleString()}` : "N/A"}
                           </div>
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                       <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium", 
                          String(u.roleName || "") === 'ADMIN' ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}>
                          <Shield size={12} /> {String(u.roleName || "Staff")}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm text-slate-500">{u.createdAt ? format(new Date(u.createdAt), "MMM dd, yyyy") : ""}</div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(u)} className="h-8 rounded-lg">
                             <Edit2 size={14} className="mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(u.id)} className="h-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100">
                             <Trash2 size={14} />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                  )
                })
                )}
              </TableBody>
            </Table>
          </div>
         </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 shadow-sm relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-3 text-center md:text-left">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Analytics</h3>
               <p className="text-slate-500 text-sm max-w-lg">
                 Gain AI-driven insights into your team&apos;s performance, attendance, and contribution metrics.
               </p>
               <Button className="mt-2 h-10 px-6 rounded-xl font-bold shadow-sm transition-all group">
                  View Analytics <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
            <div className="w-full md:w-48 aspect-video bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4">
               <Activity className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
         </div>
      </Card>
    </div>
  );
}
