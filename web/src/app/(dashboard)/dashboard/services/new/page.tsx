"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/lib/actions/services";
import { Briefcase, ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

export default function NewServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      return toast.error("Name and Price are required.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await createService({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price)
      });
      
      if (res.success) {
        toast.success("Service created successfully!");
        router.push("/dashboard/services");
      } else {
        toast.error(res.error || "Failed to create service");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => router.push("/dashboard/services")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Add New Service
          </h1>
          <p className="text-sm text-slate-500 font-medium">Create a billable service like "Key Cutting" or "Camera Installation"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Service Name <span className="text-rose-500">*</span></Label>
          <Input 
            id="name" 
            placeholder="e.g. Program Car Remote" 
            className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-slate-500">Standard Fee (Le) <span className="text-rose-500">*</span></Label>
          <Input 
            id="price" 
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00" 
            className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 font-bold"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-500">Description (Optional)</Label>
          <Textarea 
            id="description" 
            placeholder="Details about this service..." 
            className="min-h-[100px] resize-y bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            className="font-bold"
            onClick={() => router.push("/dashboard/services")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="font-bold shadow-lg shadow-primary/20 min-w-[120px]">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Service</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
