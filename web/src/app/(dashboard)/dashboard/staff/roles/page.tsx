"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getRoles, deleteRole, createRole, updateRole, getPermissions } from "@/lib/actions/role";

// Helper to format keys like "menu:intelligence:hub" into "Intelligence Hub"
const formatPermissionName = (key: string) => {
  const parts = key.replace("menu:", "").split(":");
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

export default function RolesPage() {
  const { update } = useSession();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] as string[] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (err) {
      toast.error("Failed to load roles configuration.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(id);
      toast.success("Role deleted successfully.");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        toast.success("Role updated successfully.");
      } else {
        await createRole(formData);
        toast.success("Role created successfully.");
      }
      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", permissions: [] });
      fetchData();
      
      // Force session refresh so sidebar updates immediately
      await update();
    } catch {
      toast.error("Operation failed.");
    }
  }

  // Group permissions logically by their prefix (e.g. "inventory", "sales")
  const groupedPermissions = permissions.reduce((acc, p) => {
    const groupName = p.key.replace("menu:", "").split(":")[0].toUpperCase();
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(p);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-slate-500 mt-1">Configure access control policies and define exactly what your staff can see.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="rounded-xl shadow-md font-bold px-6 bg-primary hover:bg-primary/90 text-white transition-all"><Plus className="mr-2 h-4 w-4" /> Create New Role</Button>}>
          </DialogTrigger>
          <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
             <DialogHeader className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <DialogTitle className="text-xl font-bold">{editingRole ? 'Edit Access Policy' : 'Create New Access Policy'}</DialogTitle>
               <DialogDescription>Define the role name and select the specific modules this role can access.</DialogDescription>
             </DialogHeader>
             
             <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
               <div className="px-6 py-6 overflow-y-scroll flex-1 space-y-8 bg-white dark:bg-slate-950">
                 <div className="space-y-3">
                   <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Role Designation</Label>
                   <Input 
                     value={formData.name} 
                     onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                     placeholder="e.g., SENIOR_MANAGER, CASHIER" 
                     className="font-mono uppercase text-lg border-2 border-slate-200 dark:border-slate-800 h-12 rounded-xl text-slate-900 dark:text-white"
                     required 
                   />
                 </div>
                 
                 <div className="space-y-6">
                   <Label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center justify-between">
                     <span>Module Access Control</span>
                     <Badge variant="outline" className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">{formData.permissions.length} Selected</Badge>
                   </Label>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {Object.entries(groupedPermissions).map(([group, perms]) => (
                       <Card key={group} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                         <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">{group}</h4>
                         </div>
                         <div className="p-4 space-y-3">
                           {perms.map(p => {
                              const isChecked = formData.permissions.includes(p.id);
                              return (
                               <div key={p.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => {
                                  const newPerms = isChecked ? formData.permissions.filter(id => id !== p.id) : [...formData.permissions, p.id];
                                  setFormData(prev => ({ ...prev, permissions: newPerms }));
                               }}>
                                 <Checkbox 
                                    checked={isChecked}
                                    className="mt-0.5 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary"
                                 />
                                 <div className="grid gap-1.5 leading-none flex-1">
                                   <label className="text-sm font-bold leading-none cursor-pointer text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                     {formatPermissionName(p.key)}
                                   </label>
                                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{p.key}</p>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </Card>
                     ))}
                   </div>
                 </div>
               </div>
               
               <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                 <Button type="submit" className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90 px-8 shadow-md">
                   <CheckCircle2 className="mr-2 h-4 w-4" /> Save Policy
                 </Button>
               </DialogFooter>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] font-black uppercase text-xs tracking-wider">Designation</TableHead>
                <TableHead className="font-black uppercase text-xs tracking-wider">Access Scope</TableHead>
                <TableHead className="text-right font-black uppercase text-xs tracking-wider">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 && !isLoading && (
                 <TableRow>
                   <TableCell colSpan={3} className="text-center py-10 text-slate-500">No roles configured yet.</TableCell>
                 </TableRow>
              )}
              {roles.map(r => (
                <TableRow key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {r.name.charAt(0)}
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 dark:text-white tracking-tight">{r.name}</div>
                         <div className="text-xs text-slate-500">System ID: {r.id.substring(0,8)}...</div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                       {r.permissions.slice(0, 4).map((p: any) => (
                         <Badge key={p.id} variant="secondary" className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                           {formatPermissionName(p.key)}
                         </Badge>
                       ))}
                       {r.permissions.length > 4 && (
                         <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">+ {r.permissions.length - 4} more</Badge>
                       )}
                       {r.permissions.length === 0 && (
                         <Badge variant="outline" className="text-[10px] text-rose-500 border-rose-200 bg-rose-50">No Access</Badge>
                       )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="rounded-lg h-8" onClick={() => { 
                         setEditingRole(r); 
                         setFormData({name: r.name, permissions: r.permissions.map((p:any) => p.id)}); 
                         setIsDialogOpen(true); 
                      }}>
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
