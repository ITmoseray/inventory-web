import React from 'react';
import { CheckCircle2, Minus } from 'lucide-react';
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
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mx-auto" />;
  }
  if (value === false) {
    return <Minus className="h-4 w-4 text-slate-300 dark:text-slate-700 mx-auto" />;
  }
  return <span className="font-semibold">{value}</span>;
};

export function FeatureComparisonTable() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-20">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white mb-3">
          Detailed Feature Comparison
        </h3>
        <p className="text-slate-500 font-medium text-sm">Compare plan capabilities side-by-side to find the right fit for your business.</p>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
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
