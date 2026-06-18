"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { useBusiness } from "@/components/providers/business-provider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProducts, deleteProduct } from "@/lib/actions/product";
import { toast } from "sonner";
import Link from "next/link";

export default function BusinessProductsPage() {
  const { activeBusinessId } = useBusiness();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (!activeBusinessId) return;
      try {
        setLoading(true);
        // Note: The existing getProducts action uses session, which handles the businessId check.
        // We ensure we only load if we have a valid business context.
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeBusinessId]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  }

  if (!activeBusinessId) return <div>Please select a business first.</div>;

  return (
    <div className="p-6 md:p-12 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">My Products</h1>
        <Link href="/business-hub/products/new">
            <Button><Plus className="mr-2 h-4 w-4"/> Add Product</Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-bold">{product.name}</TableCell>
                <TableCell>${product.unitPrice}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => handleDelete(product.id)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
