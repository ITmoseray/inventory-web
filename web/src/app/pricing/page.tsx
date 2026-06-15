"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PricingClientButton } from '@/components/pricing/PricingClientButton';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';

const plans = [
  { name: 'Free', price: 0, orders: '50 orders', users: '1 user', locations: '2 locations', features: ['Composite items', 'Dropshipment', 'Backordering', 'Item groups'], popular: false },
  { name: 'Standard', price: 29, orders: '500 orders', users: '2 users', locations: '2 locations', features: ['Composite items', 'Dropshipment', 'Backordering', 'Item groups', 'Customer portal'], popular: false },
  { name: 'Professional', price: 79, orders: '3000 orders', users: '2 users', locations: '4 locations', features: ['Everything in Standard +', 'Serial number tracking', 'Batch tracking', 'Vendor portal'], popular: true },
  { name: 'Premium', price: 129, orders: '7500 orders', users: '2 users', locations: '6 locations', features: ['Everything in Professional +', 'Contextual chat', 'UoM conversion', 'Customization & Automation'], popular: false },
  { name: 'Enterprise', price: 249, orders: '15000 orders', users: '7 users', locations: '10 locations', features: ['Everything in Premium +', 'Zoho Analytics', 'Multi-currency'], popular: false },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Standard

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="mb-6 -ml-4 inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          ← Back
        </Link>
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">Choose your growth plan</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn("relative flex flex-col transition-all duration-300 border-2", plan.popular ? "border-indigo-600 shadow-xl" : "border-slate-200")}>
              <CardHeader>
                <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-4xl font-black mb-4">NLe {plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <div className="text-xs font-bold text-slate-900 space-y-1 mb-4">
                    <p>{plan.orders}</p>
                    <p>{plan.users}</p>
                    <p>{plan.locations}</p>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-1 text-[10px] text-slate-700">
                      <Check className="h-3 w-3 text-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => setSelectedPlan(plan)}>Select</Button>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setSelectedPlan(plan)}>Customize</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <PricingCalculator basePrice={selectedPlan.price} />
      </div>
    </div>
  );
}
