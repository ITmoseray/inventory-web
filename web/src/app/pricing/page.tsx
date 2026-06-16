"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PricingClientButton } from '@/components/pricing/PricingClientButton';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';
import { ManualPaymentModal } from '@/components/shared/manual-payment-modal';
import { useSession } from 'next-auth/react';

const plans = [
  {
    name: 'Basic',
    price: 200,
    description: 'Perfect for small shops starting out.',
    features: ['1 User', 'Up to 500 Products', 'Stock Management', 'Sales Recording', 'Basic Reports'],
    popular: false,
  },
  {
    name: 'Standard',
    price: 500,
    description: 'For growing businesses.',
    features: ['Up to 5 Users', 'Up to 5,000 Products', 'Supplier Management', 'Purchase Orders', 'Low Stock Alerts', 'Sales & Inventory Reports'],
    popular: false,
  },
  {
    name: 'Business',
    price: 1000,
    description: 'Everything you need to scale.',
    features: ['Up to 15 Users', 'Unlimited Products', 'Customer Management', 'Profit & Loss Reports', 'Barcode Support', 'Branch Reporting'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 2500,
    description: 'For large-scale operations.',
    features: ['Unlimited Users', 'Multi-Branch Management', 'Role-Based Access Control', 'API Integration', 'Custom Features', 'Dedicated Support'],
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [selectedPlanForCalculator, setSelectedPlanForCalculator] = useState(plans[1]);
  const [activePaymentPlan, setActivePaymentPlan] = useState<string | null>(null);

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="mb-6 -ml-4 inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
          ← Back
        </Link>
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">Choose your growth plan</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {isTrialExpired ? "Your trial has ended. Upgrade to continue." : "Premium Enterprise Retail Intelligence"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn("relative flex flex-col transition-all duration-300 border-2", plan.popular ? "border-indigo-600 shadow-xl scale-105 z-10" : "border-slate-200 shadow-sm")}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs uppercase tracking-tight">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-4xl font-black mb-6">NLe {plan.price === 2500 ? "2,500+" : plan.price.toLocaleString()}<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                <Button 
                  className={cn("w-full h-12 font-black uppercase tracking-widest text-xs", plan.popular ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" : "bg-slate-900")} 
                  onClick={() => setActivePaymentPlan(plan.name)}
                >
                  {isTrialExpired || hasUsedTrial ? "Upgrade Now" : "Subscribe Now"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600" 
                  onClick={() => setSelectedPlanForCalculator(plan)}
                >
                  Configure Nodes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20">
          <PricingCalculator basePrice={selectedPlanForCalculator.price} />
        </div>

        <ManualPaymentModal 
           isOpen={!!activePaymentPlan} 
           onClose={() => setActivePaymentPlan(null)} 
           planName={activePaymentPlan || ""} 
        />
      </div>
    </div>
  );
}
