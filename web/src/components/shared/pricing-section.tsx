"use client";
import React, { useState } from 'react';
import { Check, Star, Sparkles, HelpCircle, ChevronDown, ChevronUp, Shield, Zap, Info, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ManualPaymentModal } from './manual-payment-modal';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestSubscription } from '@/lib/actions/subscription';
import { FeatureComparisonTable } from './feature-comparison-table';

const plans = [
  {
    name: 'Basic',
    monthlyPrice: 200,
    annualPrice: 160,
    description: 'Perfect for small shops starting out.',
    features: ['1 User / Staff Member', 'Up to 500 Products', 'Stock Management', 'Sales Recording & Invoices', 'Basic Reports'],
    cta: 'Start Free Trial',
    popular: false,
    color: 'slate',
    tag: 'Shop Starter',
  },
  {
    name: 'Standard',
    monthlyPrice: 500,
    annualPrice: 400,
    description: 'For growing retail businesses.',
    features: ['Up to 5 Users / Staff', 'Up to 5,000 Products', 'Supplier Management', 'Purchase Orders & Receivables', 'Low Stock Smart Alerts', 'Sales & Inventory Reports'],
    cta: 'Start Free Trial',
    popular: false,
    color: 'blue',
    tag: 'Growth Business',
  },
  {
    name: 'Business',
    monthlyPrice: 1000,
    annualPrice: 800,
    description: 'Everything you need to scale.',
    features: ['Up to 15 Users / Staff', 'Unlimited Products', 'Customer CRM & Credits', 'Profit & Loss Dynamic Reports', 'Barcode scan & generator', 'Multi-Branch Reporting'],
    cta: 'Start Free Trial',
    popular: true,
    color: 'purple',
    tag: 'Scale Pro',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 2500,
    annualPrice: 2000,
    description: 'For large-scale operations.',
    features: ['Unlimited Users / Staff', 'Multi-Branch Management', 'Role-Based Access Control', 'Integrations & Developer APIs', 'Custom Feature Provision', '24/7 Dedicated Support Agent'],
    cta: 'Contact Sales',
    popular: false,
    color: 'indigo',
    tag: 'Enterprise OS',
  },
];

const faqs = [
  {
    q: 'How does the 7-day free trial work?',
    a: 'You can sign up and use all features of the selected plan free for 7 days. We do not require a card upfront. You can upgrade, downgrade, or cancel at any time during the trial.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any point. If you upgrade, the new features will be unlocked instantly. If you downgrade, your limits will adjust at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We support instant mobile wallet payments via Orange Money. For custom corporate solutions, bank transfers and yearly invoices can be requested via sales support.',
  },
  {
    q: 'Do you offer custom setups?',
    a: 'Yes! Our Enterprise plan includes custom feature development, database partitioning, multi-branch architecture audits, and dedicated implementation assistance.',
  },
];
const getCurrencyConfig = (code?: string) => {
  switch (code?.toLowerCase()) {
    case 'sl': return { symbol: 'NLe', rate: 1 };
    case 'ng': return { symbol: '₦', rate: 65 }; // Nigerian Naira
    case 'gh': return { symbol: 'GH₵', rate: 0.65 }; // Ghanaian Cedi
    case 'za': return { symbol: 'R', rate: 0.85 }; // South African Rand
    case 'ke': return { symbol: 'KSh', rate: 6 }; // Kenyan Shilling
    case 'lr': return { symbol: 'L$', rate: 9 }; // Liberian Dollar
    case 'gm': return { symbol: 'D', rate: 3 }; // Gambian Dalasi
    case 'gn': return { symbol: 'FG', rate: 400 }; // Guinean Franc
    default: return { symbol: '$', rate: 0.045 }; // USD default for others
  }
};

export function PricingSection({ selectedCountry }: { selectedCountry?: { code: string, name: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const currency = getCurrencyConfig(selectedCountry?.code || 'sl');

  const hasUsedTrial = !!session?.user?.trialEndDate;
  const isTrialExpired = hasUsedTrial && new Date(session?.user?.trialEndDate || 0) < new Date();

  return (
    <div className="py-32 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden" id="pricing">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Trial Banner & Headers */}
        <div className="mb-20 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-indigo-500" />
            <span>7-Day Free Trial available on all plans</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-[1000] tracking-tight text-slate-900 dark:text-white leading-tight sm:leading-none">
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">growth plan</span>
          </h2>
          <p className="text-slate-500 font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[10px] sm:text-xs leading-relaxed max-w-2xl mx-auto">
            Premium Enterprise Retail Intelligence
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-12 pb-16 px-2 sm:px-4">
          {plans.map((plan, idx) => {
            const basePrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const price = Math.round(basePrice * currency.rate);
            const savings = Math.round((plan.monthlyPrice * 12 - plan.annualPrice * 12) * currency.rate);

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="flex flex-col w-full h-full"
              >
                <Card 
                  className={cn(
                    "relative flex flex-col w-full h-full overflow-visible transition-all duration-300 rounded-[2rem] border-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl",
                    plan.popular 
                      ? "border-indigo-600 shadow-[0_20px_50px_rgba(99,102,241,0.15)] dark:shadow-[0_20px_50px_rgba(99,102,241,0.08)] lg:scale-105 z-10" 
                      : "border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-xl shadow-slate-100/50 dark:shadow-none"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-white animate-spin-slow" />
                      Most Popular
                    </div>
                  )}

                  <CardHeader className="p-6 sm:p-8 pb-4">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5 block">
                      {plan.tag}
                    </span>
                    <CardTitle className="text-3xl font-[1000] text-slate-900 dark:text-white tracking-tight">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-xs pt-1.5 leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-8 pb-6 flex-1 flex flex-col justify-between">
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
                          Billed annually (Save {currency.symbol} {savings.toLocaleString()}/yr)
                        </div>
                      )}

                      <div className="h-px bg-slate-100 dark:bg-white/5 mb-6" />

                      <ul className="space-y-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                            <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-semibold leading-normal">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-transparent border-t-0 p-8 pt-0">
                    <Button 
                      onClick={async () => {
                        if (!session) return router.push('/register');
                        try {
                          await requestSubscription(plan.name, billingPeriod);
                          setSelectedPlan(plan.name);
                        } catch (err: any) {
                          console.error("Subscription error:", err);
                          setSelectedPlan(plan.name);
                        }
                      }}
                      className={cn(
                        "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300",
                        plan.popular 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35" 
                          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700"
                      )}
                    >
                      {isTrialExpired || hasUsedTrial ? "Upgrade Now" : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Comparison Drawer */}
        <FeatureComparisonTable />

        {/* Premium FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto space-y-8">
          <h3 className="text-2xl font-[1000] text-center uppercase tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">{faq.q}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p className="px-6 pb-6 text-[10px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact/Support Info */}
        <div className="mt-32 border-t border-slate-200/80 dark:border-white/5 pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          <div>
            <h4 className="text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white mb-2">Need a custom node configuration?</h4>
            <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">
              If your enterprise runs unique multi-branch retail processes, custom APIs, or specialized warehouse systems, our architecture consultants can build a dedicated plan structure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
            <a 
              href="tel:034955581" 
              className="flex items-center gap-3 px-6 h-14 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm text-slate-900 dark:text-white"
            >
              <Phone className="h-4 w-4 text-indigo-500" />
              <span>Call: 034955581</span>
            </a>
            <a 
              href="mailto:protechassist36@gmail.com" 
              className="flex items-center gap-3 px-6 h-14 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm text-slate-900 dark:text-white"
            >
              <Mail className="h-4 w-4 text-indigo-500" />
              <span>Email Sales</span>
            </a>
          </div>
        </div>

      </div>

      <ManualPaymentModal 
         isOpen={!!selectedPlan} 
         onClose={() => setSelectedPlan(null)} 
         planName={selectedPlan || ""} 
      />
    </div>
  );
}
