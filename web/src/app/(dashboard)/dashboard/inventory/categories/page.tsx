"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BackButton } from "@/components/layout/ModuleHeader";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category";

import { ResponsiveTable } from "@/components/shared/responsive-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Package } from "lucide-react";

export default function CategoriesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: any | null }>({
    open: false, category: null
  });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Cloud synchronization failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success("Category updated successfully.");
      } else {
        await createCategory(formData);
        toast.success("Category created successfully.");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      toast.error("Operation failed.");
    }
  }

  async function handleDelete(id: string) {
    if (!isAdmin) {
      toast.error("Unauthorized deletion.");
      return;
    }
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully.");
      fetchCategories();
      setDeleteDialog({ open: false, category: null });
    } catch (error) {
      toast.error("Unauthorized deletion.");
    }
  }

  function handleEdit(category: any) {
    if (!isAdmin) return;
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  }

  const columns = [
    {
      header: "Classification Name",
      isMain: true,
      accessor: (cat: any) => (
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
           </div>
           <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{cat.name}</span>
        </div>
      )
    },
    {
      header: "Strategic Description",
      accessor: (cat: any) => <span className="text-slate-500 font-bold text-xs">{cat.description || "No metadata provided."}</span>
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl sm:text-4xl font-[1000] tracking-tighter text-slate-900 dark:text-white uppercase italic">Categories</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
              Organize your products into categories.
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
          }
        }}>
          <DialogTrigger render={
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:scale-[1.02] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-900 dark:bg-slate-950 p-8 text-white shrink-0">
               <h3 className="text-2xl font-black uppercase tracking-tight">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Category Details</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electronics, Groceries"
                  className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 font-black text-sm uppercase tracking-widest shadow-inner dark:text-white dark:placeholder:text-slate-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of the category"
                  className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 font-bold dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-14 px-10 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-2xl font-[1000] text-[10px] uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-[1.02]">
                  {editingCategory ? "Save Changes" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ResponsiveTable 
        data={categories}
        columns={columns}
        loading={loading}
        onRowClick={isAdmin ? handleEdit : undefined}
        emptyState={
          <EmptyState 
            icon={Package}
            title="No Categories Found"
            description="Create your first category to organize your products."
            actionLabel="Add Category"
            onAction={() => setIsDialogOpen(true)}
          />
        }
        actions={isAdmin ? (cat) => (
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <MoreVertical className="h-5 w-5 text-slate-400" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800">
              <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800 mb-2">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Actions</p>
              </div>
              <DropdownMenuItem onClick={() => handleEdit(cat)} className="font-black text-[10px] uppercase tracking-widest gap-3 rounded-xl">
                <Pencil className="h-4 w-4 text-slate-400" /> Edit Category
              </DropdownMenuItem>
              <div className="h-px bg-slate-50 dark:bg-slate-800 my-2" />
              <DropdownMenuItem 
                className="text-rose-600 font-black text-[10px] uppercase tracking-widest gap-3 focus:bg-rose-50 focus:text-rose-700 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({ open: true, category: cat });
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-sm rounded-3xl dark:bg-slate-900 border-0 shadow-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" /> Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Are you sure you want to delete category{" "}
              <span className="font-black text-slate-900 dark:text-white">{deleteDialog.category?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, category: null })} className="rounded-xl">Cancel</Button>
            <Button onClick={() => deleteDialog.category && handleDelete(deleteDialog.category.id)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-6">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
