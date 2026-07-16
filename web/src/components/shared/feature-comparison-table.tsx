import React, { useState } from 'react';
import { CheckCircle2, Minus, Columns, Smartphone, Laptop, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  { name: 'Product Limit', basic: 'Up to 500', standard: 'Up to 5,000', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Staff / Users', basic: '1 User', standard: '5 Users', business: '15 Users', enterprise: 'Unlimited' },
  { name: 'Stock Management', basic: 'Standard', standard: 'Advanced', business: 'Multi-Warehouse', enterprise: 'Custom Logic' },
  { name: 'Branches Connected', basic: '1 Store', standard: '1 Store', business: 'Multi-Branch Reports', enterprise: 'Full Sync Engine' },
  { name: 'Supplier POs', basic: false, standard: true, business: true, enterprise: 'Custom Integrations' },
  { name: 'Dynamic Reports', basic: 'Basic Sales', standard: 'Sales & Inventory', business: 'Profit & Loss (P&L)', enterprise: 'Real-time BI Sync' },
  { name: 'Invoicing', basic: '50 / month', standard: true, business: true, enterprise: true },
  { name: 'Expense Tracking', basic: 'Basic', standard: true, business: true, enterprise: true },
  { name: 'Quotes & Estimates', basic: false, standard: true, business: true, enterprise: true },
  { name: 'Point of Sale (POS)', basic: true, standard: true, business: true, enterprise: 'Custom Interface' },
  { name: 'Transaction Tagging', basic: false, standard: true, business: true, enterprise: true },
  { name: 'File Attachments', basic: false, standard: true, business: true, enterprise: true },
  { name: 'Multiple Currencies', basic: false, standard: false, business: true, enterprise: true },
  { name: 'Bank Reconciliation', basic: false, standard: false, business: true, enterprise: true },
  { name: 'Payroll', basic: false, standard: false, business: false, enterprise: true },
  { name: 'Access Control', basic: 'Admin only', standard: 'Standard roles', business: 'Standard roles', enterprise: 'Granular (RBAC)' },
];

const renderFeatureCell = (value: string | boolean) => {
  if (value === true) {
    return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-400 mx-auto" />;
  }
  if (value === false) {
    return <Minus className="h-4.5 w-4.5 text-slate-300 dark:text-slate-700 mx-auto" />;
  }
  return <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{value}</span>;
};

export function FeatureComparisonTable() {
  const [activeMobilePlan, setActiveMobilePlan] = useState<'basic' | 'standard' | 'business' | 'enterprise'>('business');

  const plans = [
    { id: 'basic', name: 'Basic', color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
    { id: 'standard', name: 'Standard', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' },
    { id: 'business', name: 'Business', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10', popular: true },
    { id: 'enterprise', name: 'Enterprise', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' }
  ] as const;

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white mb-3">
          Detailed Feature Comparison
        </h3>
        <p className="text-slate-500 font-medium text-sm">Compare plan capabilities side-by-side to find the right fit for your business.</p>
      </div>

      {/* Mobile & Tablet Plan Selector Tabs */}
      <div className="lg:hidden flex flex-wrap justify-center gap-2 mb-6 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveMobilePlan(p.id)}
            className={cn(
              "flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 relative",
              activeMobilePlan === p.id 
                ? "bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white border border-slate-200/50 dark:border-white/5" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {p.name}
            {p.popular && (
              <span className="absolute -top-2 -right-1 bg-purple-600 text-white text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                Pop
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet Card-based View */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Capability</span>
          <span className={cn(
            "text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1",
            plans.find(p => p.id === activeMobilePlan)?.color
          )}>
            <Sparkles className="h-3 w-3" />
            {plans.find(p => p.id === activeMobilePlan)?.name}
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {features.map((feature, idx) => (
            <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
              <span className="text-xs font-bold text-slate-900 dark:text-white w-1/2 pr-4">{feature.name}</span>
              <div className="w-1/2 text-right">
                {renderFeatureCell(feature[activeMobilePlan])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Side-by-Side Table View */}
      <div className="hidden lg:block bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-white/10">
                <th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[10px] w-1/4">
                  Capability
                </th>
                <th className="p-6 font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest text-[10px] text-center w-[18%]">
                  Basic
                </th>
                <th className="p-6 font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px] text-center w-[18%] bg-blue-50/50 dark:bg-blue-900/10">
                  Standard
                </th>
                <th className="p-6 font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest text-[10px] text-center w-[18%] bg-purple-50/50 dark:bg-purple-900/10 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-2 py-0.5 rounded-full text-[8px] tracking-widest uppercase shadow-sm">Popular</div>
                  Business
                </th>
                <th className="p-6 font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[10px] text-center w-[18%] bg-indigo-50/50 dark:bg-indigo-900/10">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium text-slate-700 dark:text-slate-300">
              {features.map((feature, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                    {feature.name}
                  </td>
                  <td className="p-4 sm:px-6 text-center text-slate-600 dark:text-slate-400">
                    {renderFeatureCell(feature.basic)}
                  </td>
                  <td className="p-4 sm:px-6 text-center bg-blue-50/20 dark:bg-blue-900/5 group-hover:bg-transparent">
                    {renderFeatureCell(feature.standard)}
                  </td>
                  <td className="p-4 sm:px-6 text-center bg-purple-50/30 dark:bg-purple-900/10 group-hover:bg-transparent text-purple-700 dark:text-purple-300">
                    {renderFeatureCell(feature.business)}
                  </td>
                  <td className="p-4 sm:px-6 text-center bg-indigo-50/20 dark:bg-indigo-900/5 group-hover:bg-transparent text-indigo-700 dark:text-indigo-300">
                    {renderFeatureCell(feature.enterprise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
