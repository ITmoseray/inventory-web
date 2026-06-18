"use client";

import { useEffect, useState } from "react";
import { getPublicProducts } from "@/lib/actions/marketplace";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Store, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getPublicProducts();
      setProducts(data);
    }
    load();
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-black mb-4">Sierra Leone Marketplace</h1>
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
                className="pl-10 h-12 rounded-xl"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </header>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((product) => (
          <Card key={product.id} className="rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            <CardContent className="p-0">
              <div className="h-48 bg-slate-200 flex items-center justify-center">
                 <ShoppingBag className="h-16 w-16 text-slate-400" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                    <Store className="h-3 w-3" /> {product.businessName}
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="font-black text-xl">${product.unitPrice}</span>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Add to Order</button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
