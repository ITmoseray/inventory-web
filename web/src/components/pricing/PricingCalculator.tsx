"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ADD_ONS = [
  { name: 'Extra Staff Users', price: 7.5, unit: 'per staff / month' },
  { name: 'Extra Sales Invoices', price: 7.5, unit: 'per 500 invoices / month' },
  { name: 'Extra Store Branches', price: 10, unit: 'per branch / month' },
  { name: 'Barcode Scans', price: 8, unit: 'per 50 scans / month' },
  { name: 'Multiple Warehouses', price: 124.17, unit: 'per warehouse / month' },
];

export function PricingCalculator({ basePrice, currencySymbol = 'NLe', rate = 1 }: { basePrice: number, currencySymbol?: string, rate?: number }) {
  const [quantities, setQuantities] = useState(ADD_ONS.reduce((acc, addOn) => ({ ...acc, [addOn.name]: 0 }), {}));

  const calculateAddOnsTotal = () => {
    return ADD_ONS.reduce((total, addOn) => {
      return total + (quantities[addOn.name] || 0) * (addOn.price * rate);
    }, 0);
  };

  const total = basePrice + calculateAddOnsTotal();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-12">
      <CardHeader>
        <CardTitle>Customize your plan (Add-ons)</CardTitle>
      </CardHeader>
      <CardContent>
        {ADD_ONS.map((addOn) => (
          <div key={addOn.name} className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold">{addOn.name}</p>
              <p className="text-xs text-slate-500">{currencySymbol} {(addOn.price * rate).toFixed(2)} {addOn.unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuantities({ ...quantities, [addOn.name]: Math.max(0, quantities[addOn.name] - 1) })}>-</Button>
              <span className="w-8 text-center">{quantities[addOn.name]}</span>
              <Button variant="outline" size="sm" onClick={() => setQuantities({ ...quantities, [addOn.name]: quantities[addOn.name] + 1 })}>+</Button>
              <span className="w-20 text-right">{currencySymbol} {(quantities[addOn.name] * addOn.price * rate).toFixed(2)}</span>
            </div>
          </div>
        ))}
        <div className="border-t mt-4 pt-4 flex justify-between font-black text-lg">
          <span>Total</span>
          <span>{currencySymbol} {total.toFixed(2)} / month</span>
        </div>
      </CardContent>
    </Card>
  );
}
