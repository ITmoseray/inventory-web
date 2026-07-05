"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Search, X, Building, Users, ShieldCheck, 
  Globe, CreditCard, Layout, Zap, Bell, FileText, 
  ShoppingCart, Package, Truck, MessageSquare, Database, 
  Smartphone, Share2, Code2, Calculator, Percent, Clock,
  ArrowRight, Landmark, Briefcase, Plus, Menu, Sparkles,
  MapPin, Coins, Hash, Mail, Tag, Play, History, Box, 
  Wallet, Activity, Edit, Undo, Layers, Terminal, Calendar,
  CheckCircle2, AlertCircle, Copy, FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const SETTINGS_GROUPS = [
  {
    title: "Organization Settings",
    icon: Building,
    items: [
      { name: "Organization Profile", icon: Building, url: "/dashboard/system/settings/business" },
      { name: "Branding", icon: Sparkles },
      { name: "Locations", icon: MapPin },
      { name: "AI Integration", icon: Zap },
      { name: "Manage Subscription", icon: CreditCard, url: "/dashboard/billing" }
    ]
  },
  {
    title: "Users & Roles",
    icon: Users,
    items: [
      { name: "Users", icon: Users, url: "/dashboard/staff/employees" },
      { name: "Roles", icon: ShieldCheck, url: "/dashboard/staff/roles" },
      { name: "User Preferences", icon: Settings, url: "/dashboard/system/profile" }
    ]
  },
  {
    title: "Taxes & Compliance",
    icon: Calculator,
    items: [
      { name: "Taxes", icon: Percent }
    ]
  },
  {
    title: "Setup & Configurations",
    icon: Layout,
    items: [
      { name: "General", icon: Globe },
      { name: "Currencies", icon: Coins },
      { name: "Payment Terms New", icon: Clock },
      { name: "Reminders", icon: Bell },
      { name: "Customer Portal", icon: Users },
      { name: "Vendor Portal", icon: Truck }
    ]
  },
  {
    title: "Customization",
    icon: Edit,
    items: [
      { name: "Transaction Number Series", icon: Hash },
      { name: "PDF Templates", icon: FileText },
      { name: "Email Notifications", icon: Mail },
      { name: "Reporting Tags", icon: Tag },
      { name: "Web Tabs", icon: Globe }
    ]
  },
  {
    title: "Automation",
    icon: Zap,
    items: [
      { name: "Workflow Rules", icon: Settings },
      { name: "Workflow Actions", icon: Play },
      { name: "Workflow Logs", icon: History },
      { name: "Schedules", icon: Calendar }
    ]
  },
  {
    title: "Module Settings",
    icon: Box,
    items: [
      { name: "Customers and Vendors", icon: Users, url: "/dashboard/customers" },
      { name: "Items & Inventory", icon: Package, url: "/dashboard/inventory/products" },
      { name: "Units of Measurement", icon: Layers },
      { name: "Inventory Adjustments", icon: Edit },
      { name: "Packages & Shipments", icon: Truck, url: "/dashboard/inventory/packages" },
      { name: "Online Payments", icon: CreditCard },
      { name: "Sales Orders & Invoices", icon: ShoppingCart, url: "/dashboard/sales/orders" },
      { name: "Sales Returns & Credits", icon: Undo, url: "/dashboard/sales/returns" },
      { name: "Purchases & Expenses", icon: Wallet, url: "/dashboard/purchases" },
      { name: "Custom Modules", icon: Layout }
    ]
  },
  {
    title: "Integrations & Marketplace",
    icon: Share2,
    items: [
      { name: "WhatsApp & SMS", icon: MessageSquare, url: "/dashboard/system/settings/communication" },
      { name: "Shipping Partners", icon: Truck },
      { name: "eCommerce & Shopping Cart", icon: ShoppingCart },
      { name: "Accounting Apps", icon: Calculator },
      { name: "Marketplace", icon: Globe }
    ]
  },
  {
    title: "Developer Space",
    icon: Code2,
    items: [
      { name: "Widgets & SDK", icon: Code2 },
      { name: "Incoming Webhooks", icon: Zap },
      { name: "API Usage", icon: Activity },
      { name: "Signals", icon: Bell }
    ]
  },
  {
    title: "Data Management",
    icon: Database,
    items: [
      { name: "Deluge Components Usage", icon: Terminal },
      { name: "Web Forms", icon: FileSpreadsheet },
      { name: "Audit Trail", icon: History, url: "/dashboard/system/logs" },
      { name: "Backup & Recovery", icon: Database }
    ]
  }
];

// Helper to define dynamic fields for settings
const getSettingFields = (name: string) => {
  switch (name) {
    case "Branding":
      return [
        { key: "logoUrl", label: "Logo URL", type: "text", placeholder: "https://your-logo-url.png" },
        { key: "primaryColor", label: "Primary Theme Color", type: "select", options: ["Indigo Theme (#4f46e5)", "Emerald Green (#10b981)", "Teal Business (#06b6d4)", "Classic Slate (#334155)"] },
        { key: "fontFamily", label: "Global Typography", type: "select", options: ["Outfit (Premium)", "Inter (Modern Sans)", "Roboto (Structured)"] },
        { key: "darkLogo", label: "Invert Logo in Dark Mode", type: "boolean" }
      ];
    case "Locations":
      return [
        { key: "locationName", label: "Branch Name", type: "text", placeholder: "Freetown HQ" },
        { key: "address", label: "Street Address", type: "text", placeholder: "34 Wilkinson Road" },
        { key: "locType", label: "Facility Type", type: "select", options: ["Retail Store & POS", "Wholesale Warehouse", "Admin HQ Office"] },
        { key: "enableSync", label: "Sync Inventory Across Branches", type: "boolean" }
      ];
    case "AI Integration":
      return [
        { key: "enableCopilot", label: "Enable AI Copilot Widget", type: "boolean" },
        { key: "modelType", label: "AI Prediction Engine", type: "select", options: ["Gemini 1.5 Pro (Recommended)", "Gemini 1.5 Flash (Performance)", "ChatGPT-4o (Standard)"] },
        { key: "salesForecasting", label: "Use AI Sales Forecasting", type: "boolean" },
        { key: "apiTokenLimit", label: "Daily Enterprise Token Limit", type: "number", placeholder: "10000" }
      ];
    case "Taxes":
      return [
        { key: "taxName", label: "Default Tax Label", type: "text", placeholder: "GST" },
        { key: "taxRate", label: "Tax Percentage (%)", type: "number", placeholder: "15" },
        { key: "inclusive", label: "Prices Include Taxes", type: "boolean" },
        { key: "allowTaxExempt", label: "Support Tax-Exempt Customers", type: "boolean" }
      ];
    case "General":
      return [
        { key: "businessName", label: "Corporate Entity Name", type: "text", placeholder: "Protech Enterprise Ltd" },
        { key: "fiscalYear", label: "Fiscal Year Starting Month", type: "select", options: ["January", "April", "July", "October"] },
        { key: "timezone", label: "Default Timezone", type: "select", options: ["UTC", "GMT", "EST"] },
        { key: "decimalPlaces", label: "Decimal Precision for Quantities", type: "select", options: ["0 (e.g. 12)", "2 (e.g. 12.00)"] }
      ];
    case "Currencies":
      return [
        { key: "baseCurrency", label: "Primary Currency", type: "select", options: ["SLL (Leone)", "SLE (New Leone)", "USD (Dollar)", "EUR (Euro)"] },
        { key: "multiCurrency", label: "Enable Multi-Currency Settlements", type: "boolean" },
        { key: "autoExchange", label: "Fetch Exchange Rates Automatically", type: "boolean" }
      ];
    case "Payment Terms New":
      return [
        { key: "netDays", label: "Default Invoice Payment Window", type: "select", options: ["Due On Receipt", "Net 15 Days", "Net 30 Days", "Net 60 Days"] },
        { key: "partialPayments", label: "Accept Partial Invoice Settlements", type: "boolean" },
        { key: "lateFee", label: "Apply Interest on Overdue Balances", type: "boolean" }
      ];
    case "Reminders":
      return [
        { key: "autoSms", label: "Automated SMS Debt Reminders", type: "boolean" },
        { key: "autoWhatsapp", label: "Automated WhatsApp Reminders", type: "boolean" },
        { key: "remDays", label: "Days Before Due Date to Alert", type: "number", placeholder: "3" },
        { key: "gracePeriod", label: "Grace Period for Payments (Days)", type: "number", placeholder: "2" }
      ];
    case "Customer Portal":
      return [
        { key: "enablePortal", label: "Enable Client Self-Service Portal", type: "boolean" },
        { key: "allowOnlineReceipts", label: "Clients Can Download receipts", type: "boolean" },
        { key: "portalTerms", label: "Custom Disclaimer Text", type: "text", placeholder: "Thank you for banking with Protech." }
      ];
    case "Vendor Portal":
      return [
        { key: "enableVendor", label: "Enable Supplier Management Node", type: "boolean" },
        { key: "allowPurchaseOrders", label: "Suppliers Can View Purchase Orders", type: "boolean" }
      ];
    case "Transaction Number Series":
      return [
        { key: "salePrefix", label: "POS Invoices Prefix", type: "text", placeholder: "INV-" },
        { key: "purchasePrefix", label: "Purchase Orders Prefix", type: "text", placeholder: "PO-" },
        { key: "sequenceLength", label: "Numeric Sequence Padding", type: "select", options: ["4 Digits (0001)", "6 Digits (000001)"] }
      ];
    case "PDF Templates":
      return [
        { key: "templateStyle", label: "Receipt Sheet Layout", type: "select", options: ["Compact Receipt (Thermal)", "A4 Commercial Invoice", "Classic Minimalist Layout"] },
        { key: "showBusinessLogo", label: "Render Corporate Logo on Print", type: "boolean" },
        { key: "termsNote", label: "Custom Terms & Conditions", type: "text", placeholder: "Goods sold are not returnable." }
      ];
    case "Email Notifications":
      return [
        { key: "sendWelcome", label: "Email Welcome Note to New Clients", type: "boolean" },
        { key: "sendSalesAlert", label: "Dispatch Receipts via Email", type: "boolean" },
        { key: "smtpServer", label: "Custom SMTP Node Host", type: "text", placeholder: "smtp.yourcompany.com" }
      ];
    case "Workflow Rules":
      return [
        { key: "triggerCondition", label: "Workflow Event Trigger", type: "select", options: ["Stock Drops Below Min Threshold", "Invoice Overdue by 7 Days", "New Debt Record Initialized"] },
        { key: "actionDispatch", label: "Workflow Triggered Action", type: "select", options: ["Send Priority System Notification", "Execute Local Webhook Push", "Email Store Manager Log"] }
      ];
    case "Units of Measurement":
      return [
        { key: "defaultUnit", label: "Global Base Unit", type: "text", placeholder: "Pcs" },
        { key: "enablePackaging", label: "Support Cases & Cartons", type: "boolean" },
        { key: "packConversion", label: "Default Package Conversion Count", type: "number", placeholder: "12" }
      ];
    case "Inventory Adjustments":
      return [
        { key: "requireApproval", label: "Require Audit Approval for Adjustments", type: "boolean" },
        { key: "reasonCodes", label: "Require Loss/Damage Reason Code", type: "boolean" }
      ];
    case "Online Payments":
      return [
        { key: "enablePay", label: "Activate Digital Payment Integrations", type: "boolean" },
        { key: "flutterwaveKey", label: "Flutterwave Public API Key", type: "text", placeholder: "FLWPUBK_TEST-..." },
        { key: "allowCard", label: "Accept Cards & Orange/Africell Mobile Money", type: "boolean" }
      ];
    case "API Usage":
      return [
        { key: "enableApi", label: "Activate REST API Endpoint Gateway", type: "boolean" },
        { key: "apiKey", label: "Access Token", type: "text", value: "pt_live_920fbc89a71bd65f49cc0", readOnly: true }
      ];
    case "Backup & Recovery":
      return [
        { key: "autoBackup", label: "Automated Daily Database Cloud Backups", type: "boolean" },
        { key: "retentionPeriod", label: "Backup History Retention", type: "select", options: ["7 Days Cycle", "30 Days Archive", "90 Days Extended"] }
      ];
    default:
      return [
        { key: "enabled", label: "Enable Integration Module", type: "boolean" },
        { key: "debugMode", label: "Log Internal Development Operations", type: "boolean" }
      ];
  }
};

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ name: string; group: string } | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});

  // Load configured setting when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      const savedConfig = localStorage.getItem(`settings_${selectedItem.name}`);
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          setConfig({});
        }
      } else {
        setConfig({});
      }
    }
  }, [selectedItem]);

  const handleSave = () => {
    if (!selectedItem) return;
    localStorage.setItem(`settings_${selectedItem.name}`, JSON.stringify(config));
    toast.success(`Settings saved: ${selectedItem.name}`);
    setSelectedItem(null);
  };

  const filteredGroups = SETTINGS_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      
      {/* Settings Top Bar */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-[50] backdrop-blur-md bg-white/80">
         <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Settings className="h-5 w-5 text-white" />
               </div>
               <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.4em] text-indigo-600">All Settings</h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Enterprise Node</p>
               </div>
            </div>

            <div className="relative w-full max-w-xl group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search settings ( / )" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 transition-all text-slate-900 dark:text-white"
               />
            </div>
         </div>

         <div className="flex items-center gap-6">
            <Link href="/dashboard">
               <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-50 transition-all dark:text-slate-350 dark:hover:bg-slate-800">
                  <X className="h-4 w-4" /> Close Settings
               </Button>
            </Link>
         </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12">
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
            {filteredGroups.map((group, groupIdx) => (
              <motion.div 
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.05 }}
                className="space-y-8"
              >
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 border border-indigo-100/50 dark:border-slate-800">
                       <group.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{group.title}</h3>
                 </div>

                 <div className="flex flex-col gap-1 pl-1">
                    {group.items.map((item: any) => {
                      const content = (
                         <>
                            <div className="flex items-center gap-4">
                               <item.icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                               <span className="text-[11px] font-[1000] uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white transition-colors">{item.name}</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-205 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                         </>
                      );

                      if (item.url) {
                        return (
                          <Link 
                            key={item.name}
                            href={item.url}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-left"
                          >
                             {content}
                          </Link>
                        );
                      }

                      return (
                        <button 
                          key={item.name}
                          onClick={() => setSelectedItem({ name: item.name, group: group.title })}
                          className="group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-left w-full"
                        >
                           {content}
                        </button>
                      );
                    })}
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Extended Marketplace Promo */}
         <section className="mt-32 p-8 md:p-12 lg:p-16 rounded-3xl md:rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
               <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-center gap-3">
                     <Landmark className="h-6 w-6 text-indigo-400" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Marketplace Network</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                    Extend your Protech <br /><span className="text-indigo-400">Capabilities!</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md uppercase tracking-tight text-[12px]">
                    Connect your favorite apps and streamline your workflow with our extensive integration library.
                  </p>
                  <Button className="h-16 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 transition-all shadow-2xl">Explore Marketplace</Button>
               </div>
               
               <div className="flex flex-wrap gap-4 items-center justify-center p-6 lg:p-12 bg-white/5 rounded-3xl lg:rounded-[3rem] border border-white/10 backdrop-blur-xl">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-16 lg:h-20 w-24 lg:w-32 bg-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                       <Plus className="h-5 w-5 lg:h-6 lg:w-6 text-slate-500" />
                    </div>
                  ))}
               </div>
            </div>
         </section>

         <footer className="mt-32 pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] italic">© 2026, Protech Assist (SL) Limited. Global Network Operations Center.</p>
         </footer>
      </main>

      {/* Dynamic Setting Config Modal */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-950">
          <DialogHeader className="mb-4">
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">{selectedItem?.group}</div>
            <DialogTitle className="text-2xl font-[1000] tracking-tight uppercase italic text-slate-950 dark:text-white">Configure {selectedItem?.name}</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-wider">Enterprise Configuration Node</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 pt-4">
              {getSettingFields(selectedItem.name).map((field) => {
                const currentVal = config[field.key] ?? (field.type === "boolean" ? false : "");
                
                return (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">{field.label}</label>
                    {field.type === "text" && (
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder={field.placeholder}
                          value={field.value ?? currentVal}
                          readOnly={field.readOnly}
                          onChange={(e) => !field.readOnly && setConfig({ ...config, [field.key]: e.target.value })}
                          className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pl-4 pr-10"
                        />
                        {field.readOnly && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg"
                            onClick={() => {
                              navigator.clipboard.writeText(field.value || "");
                              toast.success("Copied to clipboard");
                            }}
                          >
                            <Copy size={14} className="text-slate-400" />
                          </Button>
                        )}
                      </div>
                    )}

                    {field.type === "number" && (
                      <Input 
                        type="number" 
                        placeholder={field.placeholder}
                        value={currentVal}
                        onChange={(e) => setConfig({ ...config, [field.key]: parseFloat(e.target.value) || 0 })}
                        className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    )}

                    {field.type === "select" && (
                      <select 
                        value={currentVal || field.options?.[0]}
                        onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                        className="h-12 w-full px-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none"
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt} className="dark:bg-slate-950">{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === "boolean" && (
                      <div className="flex items-center gap-3 py-1">
                        <input 
                          type="checkbox"
                          id={field.key}
                          checked={currentVal}
                          onChange={(e) => setConfig({ ...config, [field.key]: e.target.checked })}
                          className="h-5 w-5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={field.key} className="text-xs font-bold text-slate-550 dark:text-slate-350 cursor-pointer">Enable this setting parameter</label>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-150 dark:border-slate-800/50">
                <Button variant="ghost" className="font-bold text-slate-400" onClick={() => setSelectedItem(null)}>Cancel</Button>
                <Button className="rounded-xl px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black" onClick={handleSave}>Save Configuration</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
