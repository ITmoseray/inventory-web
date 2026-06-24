"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, Smartphone, Zap, Save, Send, AlertTriangle, 
  Settings, CheckCircle2, Copy, RefreshCw, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CommunicationSettingsPage() {
  const [provider, setProvider] = useState("MOCK_PROVIDER");
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••");
  const [senderId, setSenderId] = useState("PROTECH");
  const [accountId, setAccountId] = useState("AC87654321");
  const [activeTab, setActiveTab] = useState("receipt");
  
  // Templates state
  const [templates, setTemplates] = useState({
    receipt: "Thank you for shopping at {business_name}! Your invoice {invoice_number} of Le {total_amount} is complete. View receipt: {receipt_url}.",
    debt: "Dear {customer_name}, this is a friendly reminder from {business_name} that you have an outstanding balance of Le {outstanding_amount} due on {due_date}. Please contact us to settle. Thank you!",
    stock: "System Alert: Product {product_name} is running low! Current stock: {current_stock} (Min: {min_quantity}). Please reorder from {supplier_name}."
  });

  // Test SMS state
  const [testPhone, setTestPhone] = useState("+232 77 123456");
  const [testMessage, setTestMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("comm_provider");
    const savedApiKey = localStorage.getItem("comm_api_key");
    const savedSenderId = localStorage.getItem("comm_sender_id");
    const savedAccountId = localStorage.getItem("comm_account_id");
    const savedTemplates = localStorage.getItem("comm_templates");

    if (savedProvider) setProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSenderId) setSenderId(savedSenderId);
    if (savedAccountId) setAccountId(savedAccountId);
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update test message based on current tab's template
  useEffect(() => {
    let mockText = "";
    if (activeTab === "receipt") {
      mockText = templates.receipt
        .replaceAll("{business_name}", "Eastside Pharmacy")
        .replaceAll("{invoice_number}", "INV-260623-482")
        .replaceAll("{total_amount}", "155,000")
        .replaceAll("{receipt_url}", "https://receipt.protech.sl/r/inv_482");
    } else if (activeTab === "debt") {
      mockText = templates.debt
        .replaceAll("{customer_name}", "Aminata Bangura")
        .replaceAll("{business_name}", "Eastside Pharmacy")
        .replaceAll("{outstanding_amount}", "45,000")
        .replaceAll("{due_date}", "Jun 30, 2026");
    } else if (activeTab === "stock") {
      mockText = templates.stock
        .replaceAll("{product_name}", "Amoxicillin 250mg")
        .replaceAll("{current_stock}", "8")
        .replaceAll("{min_quantity}", "20")
        .replaceAll("{supplier_name}", "Sierra Med Supplies");
    }
    setTestMessage(mockText);
  }, [activeTab, templates]);

  const handleSave = () => {
    localStorage.setItem("comm_provider", provider);
    localStorage.setItem("comm_api_key", apiKey);
    localStorage.setItem("comm_sender_id", senderId);
    localStorage.setItem("comm_account_id", accountId);
    localStorage.setItem("comm_templates", JSON.stringify(templates));
    toast.success("Settings and templates saved successfully.");
  };

  const handleSendTest = () => {
    if (!testPhone) return toast.error("Enter a valid test phone number");
    if (!testMessage) return toast.error("Message content is empty");

    setSendingTest(true);
    
    // Simulate API dispatch delay
    setTimeout(() => {
      setSendingTest(false);
      console.log(`[SMS INTEGRATION - ${provider}] Dispatched to ${testPhone}: "${testMessage}"`);
      
      toast.success("Test message dispatched successfully!", {
        description: `Delivered via ${provider === "MOCK_PROVIDER" ? "Mock Console Gateway" : provider}. Check your terminal / system logs for delivery details.`
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-[1000]">WhatsApp & SMS Hub</h1>
          <p className="text-slate-500 font-medium">Configure localized notification channels and write automated customer message templates.</p>
        </div>
        <Button onClick={handleSave} className="rounded-xl px-6 h-12 bg-slate-900 dark:bg-indigo-600 text-white font-black hover:bg-slate-800 flex items-center gap-2">
          <Save size={16} /> Save Configurations
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Setup and Templates */}
        <div className="md:col-span-2 space-y-6">
          {/* Provider Selection */}
          <Card className="border-none shadow-xl shadow-slate-100/50 bg-white dark:bg-slate-900 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Smartphone className="text-indigo-600 h-5 w-5" /> Provider Credentials
              </CardTitle>
              <CardDescription>Select the SMS/WhatsApp gateway connection details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 dark:text-slate-300">Gateway Provider</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "MOCK_PROVIDER", label: "Mock Gateway", desc: "Local Console Logs" },
                    { id: "AFRICAS_TALKING", label: "Africa's Talking", desc: "Pan-African Gateway" },
                    { id: "TWILIO", label: "Twilio", desc: "Global Messaging API" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 flex flex-col text-left transition-all",
                        provider === p.id 
                          ? "border-indigo-650 bg-indigo-50/20 text-indigo-900 dark:text-indigo-400" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent text-slate-500"
                      )}
                    >
                      <span className="font-black text-xs uppercase tracking-wide">{p.label}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {provider !== "MOCK_PROVIDER" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">API Key / Auth Token</Label>
                    <Input 
                      type="password" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Sender ID / Brand Name</Label>
                    <Input 
                      type="text" 
                      value={senderId} 
                      onChange={(e) => setSenderId(e.target.value)}
                      className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  {provider === "TWILIO" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Account SID</Label>
                      <Input 
                        type="text" 
                        value={accountId} 
                        onChange={(e) => setAccountId(e.target.value)}
                        className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>
              )}

              {provider === "MOCK_PROVIDER" && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                    Mock Gateway is active. Outbound SMS notifications will not spend credit and will print to the server console log files instead.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card className="border-none shadow-xl shadow-slate-100/50 bg-white dark:bg-slate-900 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <FileText className="text-indigo-600 h-5 w-5" /> Automation Templates
              </CardTitle>
              <CardDescription>Draft customized message templates utilizing system-wide variables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                  <TabsTrigger value="receipt" className="rounded-lg py-2">Sales Receipt</TabsTrigger>
                  <TabsTrigger value="debt" className="rounded-lg py-2">Debt Reminder</TabsTrigger>
                  <TabsTrigger value="stock" className="rounded-lg py-2">Low Stock Alert</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="receipt" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Sales Receipt Template</Label>
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">WhatsApp & SMS</span>
                      </div>
                      <Textarea 
                        rows={4} 
                        value={templates.receipt} 
                        onChange={(e) => setTemplates({...templates, receipt: e.target.value})}
                        className="rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 font-mono text-xs leading-relaxed"
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["{business_name}", "{invoice_number}", "{total_amount}", "{receipt_url}"].map((v) => (
                          <code key={v} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-850 text-[10px] font-mono text-slate-500 cursor-pointer" onClick={() => setTemplates({...templates, receipt: templates.receipt + " " + v})}>{v}</code>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="debt" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Outstanding Debt Reminder Template</Label>
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">WhatsApp & SMS</span>
                      </div>
                      <Textarea 
                        rows={4} 
                        value={templates.debt} 
                        onChange={(e) => setTemplates({...templates, debt: e.target.value})}
                        className="rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 font-mono text-xs leading-relaxed"
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["{customer_name}", "{business_name}", "{outstanding_amount}", "{due_date}"].map((v) => (
                          <code key={v} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-850 text-[10px] font-mono text-slate-500 cursor-pointer" onClick={() => setTemplates({...templates, debt: templates.debt + " " + v})}>{v}</code>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="stock" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Manager Low Stock Warning Template</Label>
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">SMS Only (Internal)</span>
                      </div>
                      <Textarea 
                        rows={4} 
                        value={templates.stock} 
                        onChange={(e) => setTemplates({...templates, stock: e.target.value})}
                        className="rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 font-mono text-xs leading-relaxed"
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["{product_name}", "{current_stock}", "{min_quantity}", "{supplier_name}"].map((v) => (
                          <code key={v} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-850 text-[10px] font-mono text-slate-500 cursor-pointer" onClick={() => setTemplates({...templates, stock: templates.stock + " " + v})}>{v}</code>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Live Tester */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-slate-100/50 bg-white dark:bg-slate-900 rounded-[2rem] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Send className="text-indigo-650 h-5 w-5" /> Dispatch Simulator
              </CardTitle>
              <CardDescription>Simulate outbound notification delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Recipient Phone</Label>
                  <Input 
                    type="text" 
                    value={testPhone} 
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+232 77 123456" 
                    className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Preview Message</Label>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed font-mono min-h-[120px] whitespace-pre-wrap select-all">
                    {testMessage}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 mt-6">
                <Button 
                  onClick={handleSendTest} 
                  disabled={sendingTest}
                  className="w-full rounded-xl h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all flex items-center justify-center gap-2"
                >
                  {sendingTest ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Dispatched...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Simulated Message
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
