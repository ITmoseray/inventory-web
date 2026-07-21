"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Star, Sparkles, ArrowLeft, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';
import { ManualPaymentModal } from '@/components/shared/manual-payment-modal';
import { FeatureComparisonTable } from '@/components/shared/feature-comparison-table';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestSubscription } from '@/lib/actions/subscription';
import { getCurrencyConfig } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const shopPlans = [
  {
    name: 'Basic',
    monthlyPrice: 60,
    annualPrice: 50,
    description: 'Perfect for small shops starting out.',
    features: ['1 User / Staff Member', 'Up to 500 Products', 'Stock Management', 'Sales Recording & Invoices', 'Basic Reports'],
    popular: false,
    color: 'slate',
    tag: 'Shop Starter',
  },
  {
    name: 'Standard',
    monthlyPrice: 150,
    annualPrice: 125,
    description: 'For growing retail businesses.',
    features: ['Up to 5 Users / Staff', 'Up to 5,000 Products', 'Supplier Management', 'Purchase Orders & Receivables', 'Low Stock Smart Alerts', 'Sales & Inventory Reports'],
    popular: false,
    color: 'blue',
    tag: 'Growth Business',
  },
  {
    name: 'Premium',
    monthlyPrice: 300,
    annualPrice: 250,
    description: 'Everything you need to scale.',
    features: ['Unlimited Users / Staff', 'Unlimited Products', 'Customer CRM & Credits', 'Profit & Loss Dynamic Reports', 'Barcode scan & generator', 'Multi-Branch Reporting'],
    popular: true,
    color: 'purple',
    tag: 'Scale Pro',
  },
];

const officePlans = [
  {
    name: 'Basic Office',
    monthlyPrice: 60,
    annualPrice: 50,
    description: 'Perfect for small offices and clinics.',
    features: ['1 User / Admin', 'Basic Expense Tracking', 'Invoice & Quotation Generation', 'Client CRM', 'Basic Reports'],
    popular: false,
    color: 'slate',
    tag: 'Office Starter',
  },
  {
    name: 'Standard Office',
    monthlyPrice: 150,
    annualPrice: 125,
    description: 'For growing service-based businesses.',
    features: ['Up to 5 Users', 'Advanced Expense & Budgeting', 'Payroll & Employee Attendance', 'Multi-currency Support', 'Performance Reports'],
    popular: false,
    color: 'blue',
    tag: 'Corporate Growth',
  },
  {
    name: 'Premium Office',
    monthlyPrice: 300,
    annualPrice: 250,
    description: 'Everything you need to scale operations.',
    features: ['Unlimited Users', 'Full HR & Payroll System', 'Advanced Profit & Loss', 'Role-Based Access Control', 'Multi-Branch Support'],
    popular: true,
    color: 'purple',
    tag: 'Enterprise Office',
  },
];

const educationPlans = [
  {
    name: 'Basic School',
    monthlyPrice: 100,
    annualPrice: 83,
    description: 'Perfect for small schools and nurseries.',
    features: ['Up to 100 Students', 'Student Registration & CRM', 'Basic Fee Collection', 'Class Attendance'],
    popular: false,
    color: 'slate',
    tag: 'School Starter',
  },
  {
    name: 'Standard School',
    monthlyPrice: 250,
    annualPrice: 208,
    description: 'For growing educational institutions.',
    features: ['Up to 500 Students', 'Automated Fee Invoicing', 'Grading & Report Cards', 'Parent Communication (SMS/Email)'],
    popular: false,
    color: 'blue',
    tag: 'Academy Growth',
  },
  {
    name: 'Premium School',
    monthlyPrice: 500,
    annualPrice: 416,
    description: 'Complete management for large institutions.',
    features: ['Unlimited Students', 'Full Academic & Hostel Mgmt', 'Advanced Staff Payroll', 'Complete Financial Ledger & P&L'],
    popular: true,
    color: 'purple',
    tag: 'University Pro',
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const currency = getCurrencyConfig('sl');
  const [selectedPlanForCalculator, setSelectedPlanForCalculator] = useState(shopPlans[1]);
  const [activePaymentPlan, setActivePaymentPlan] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  const selectedCalculatorBasePrice = billingPeriod === 'monthly' ? selectedPlanForCalculator.monthlyPrice : selectedPlanForCalculator.annualPrice;

  const renderPlanGrid = (plansToRender: typeof shopPlans) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 pb-12 max-w-6xl mx-auto">
      {plansToRender.map((plan, idx) => {
        const basePrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
        const price = Math.round(basePrice * currency.rate);
        const savings = Math.round((plan.monthlyPrice * 12 - plan.annualPrice * 12) * currency.rate);

        return (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="flex flex-col h-full"
          >
            <Card 
              className={cn(
                "relative flex flex-col h-full overflow-hidden transition-all duration-300 rounded-[2rem]",
                plan.popular 
                  ? "border-2 border-indigo-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] bg-white dark:bg-slate-900" 
                  : "border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              )}
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Popular
                </div>
              )}

              <CardHeader className="p-8 pb-4">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{plan.tag}</span>
                <CardTitle className="text-2xl font-[1000] text-slate-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="px-6 sm:px-8 pb-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-1 mb-6 mt-2">
                    <span className="text-sm font-black text-slate-400 dark:text-slate-500 mr-0.5">{currency.symbol}</span>
                    <span className="text-5xl font-[1000] text-slate-900 dark:text-white tracking-tighter">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/mo</span>
                  </div>

                  {billingPeriod === 'annual' && savings > 0 && (
                    <div className="mb-4 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-lg w-fit">
                      Billed annually (Save {currency.symbol}{savings.toLocaleString()}/yr)
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-white/5 mb-6" />

                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>
                        <span className="font-semibold leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 bg-transparent border-t-0 p-6 sm:p-8 pt-0">
                <Button 
                  onClick={async () => {
                    try {
                      await requestSubscription(plan.name, billingPeriod);
                      setActivePaymentPlan(plan.name);
                    } catch (err) {
                      console.error("Subscription error:", err);
                      setActivePaymentPlan(plan.name);
                    }
                  }}
                  className={cn(
                    "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300",
                    plan.popular 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35" 
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700"
                  )}
                >
                  {isTrialExpired || hasUsedTrial ? "Upgrade Now" : "Subscribe Now"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600" 
                  onClick={() => setSelectedPlanForCalculator(plan)}
                >
                  Customize Limits
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 relative overflow-y-auto">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Back Link */}
        <Link 
          href={session ? "/dashboard" : "/"} 
          className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>{session ? "Back to Dashboard" : "Back to Home"}</span>
        </Link>

        {/* Headers */}
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-[1000] tracking-tight text-slate-900 dark:text-white">
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">growth plan</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            {isTrialExpired ? "Your trial has ended. Upgrade to continue." : "Premium Enterprise Retail Intelligence"}
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex justify-center items-center gap-3">
            <span className={cn("text-xs font-black uppercase tracking-wider transition-colors", billingPeriod === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400")}>Monthly</span>
            <button 
              onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="h-7 w-14 rounded-full bg-slate-200 dark:bg-slate-800 p-1 transition-all duration-300 relative focus:outline-none"
            >
              <div 
                className={cn(
                  "h-5 w-5 rounded-full bg-indigo-600 shadow-md transition-all duration-300 transform",
                  billingPeriod === 'annual' ? "translate-x-7" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5", billingPeriod === 'annual' ? "text-slate-900 dark:text-white" : "text-slate-400")}>
              Annually 
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest animate-bounce">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Sector Tabs */}
        <Tabs defaultValue="shop" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
              <TabsTrigger value="shop" className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">Retail / Shop</TabsTrigger>
              <TabsTrigger value="office" className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Office / Corporate</TabsTrigger>
              <TabsTrigger value="education" className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">School / Education</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="shop" className="mt-0 outline-none">
            {renderPlanGrid(shopPlans)}
          </TabsContent>

          <TabsContent value="office" className="mt-0 outline-none">
            {renderPlanGrid(officePlans)}
          </TabsContent>

          <TabsContent value="education" className="mt-0 outline-none">
            {renderPlanGrid(educationPlans)}
          </TabsContent>
        </Tabs>

        {/* Dynamic Comparison Drawer */}
        <FeatureComparisonTable />

        {/* Dynamic Pricing Calculator with matching base price */}
        <div className="mt-24">
          <PricingCalculator 
            basePrice={selectedCalculatorBasePrice * currency.rate}
            currencySymbol={currency.symbol}
            rate={currency.rate}
          />
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
