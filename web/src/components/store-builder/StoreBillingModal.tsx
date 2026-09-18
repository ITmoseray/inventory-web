"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Check, Sparkles, Zap, ShieldCheck, Crown, 
  ArrowRight, CreditCard, Smartphone, CheckCircle2,
  AlertCircle, RefreshCw, BarChart3, Globe, ShoppingBag
} from "lucide-react";
import { toast } from "sonner";
import { 
  getStoreBillingOverviewAction, 
  upgradeStorePlanAction, 
  STORE_PLANS_CONFIG,
  StorePlanConfig
} from "@/lib/actions/store-builder-billing";
import { StorePlan } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
  onPlanUpdated?: (newPlan: StorePlan) => void;
}

export function StoreBillingModal({ isOpen, onClose, storeId, onPlanUpdated }: Props) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<StorePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("orange_money");
  const [phoneNumber, setPhoneNumber] = useState("");

  const loadBilling = async () => {
    setLoading(true);
    try {
      const res = await getStoreBillingOverviewAction(storeId);
      if (res.success) {
        setBillingData(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load billing info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBilling();
    }
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  const currentPlanId: StorePlan = billingData?.plan?.id || "FREE";

  const handleUpgrade = async (planKey: StorePlan) => {
    if (planKey === currentPlanId) {
      toast.info(`Your store is already on the ${STORE_PLANS_CONFIG[planKey].name} plan.`);
      return;
    }

    if (planKey === "FREE") {
      // Downgrade confirmation
      if (!confirm("Are you sure you want to switch back to the Free plan? Pro features will be paused.")) {
        return;
      }
    } else {
      setSelectedPlanToUpgrade(planKey);
      return;
    }

    executeUpgrade(planKey);
  };

  const executeUpgrade = async (planKey: StorePlan) => {
    setUpgrading(true);
    try {
      const res = await upgradeStorePlanAction({
        storeId: billingData?.storeId || storeId,
        plan: planKey,
        billingCycle,
        paymentMethod,
        paymentRef: phoneNumber ? `phone_${phoneNumber}_${Date.now()}` : undefined
      });

      if (res.success) {
        toast.success(`🎉 ${res.message}`);
        setSelectedPlanToUpgrade(null);
        if (onPlanUpdated) onPlanUpdated(planKey);
        await loadBilling();
      }
    } catch (err: any) {
      toast.error(err.message || "Upgrade failed");
    } finally {
      setUpgrading(false);
    }
  };

  const plansList = Object.values(STORE_PLANS_CONFIG);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border/80 shadow-2xl shadow-primary/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Store Builder Plans & Quotas
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose the best plan for your business. Cancel, upgrade, or downgrade anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Quota Status Bar */}
          {billingData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Tier
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-foreground">
                    {billingData.plan.name}
                  </span>
                  {billingData.plan.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {billingData.plan.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>AI GENERATIONS</span>
                  <span>{billingData.aiGenerationsUsed} / {billingData.aiGenerationsLimit > 1000 ? "∞" : billingData.aiGenerationsLimit}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (billingData.aiGenerationsUsed / (billingData.aiGenerationsLimit || 5)) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>STORE PRODUCTS</span>
                  <span>{billingData.productsCount} / {billingData.productsLimit > 1000 ? "Unlimited" : billingData.productsLimit}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (billingData.productsCount / (billingData.productsLimit || 10)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1 rounded-2xl bg-muted/60 border border-border/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  billingCycle === "monthly" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                  billingCycle === "yearly" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly Billing
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-amber-950">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plansList.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const price = billingCycle === "yearly" 
                ? Math.round(plan.priceYearlySLE / 12) 
                : plan.priceMonthlySLE;

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-3xl border p-5 transition-all relative ${
                    plan.isPopular
                      ? "border-primary bg-primary/[0.03] ring-2 ring-primary/30 shadow-xl shadow-primary/10"
                      : "border-border/80 bg-card hover:border-border"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <h4 className="text-lg font-black text-foreground">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground leading-snug min-h-[36px]">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-border/60">
                    <span className="text-3xl font-black text-foreground tracking-tight">
                      {price === 0 ? "Free" : `SLE ${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        / month
                      </span>
                    )}
                    {price > 0 && (
                      <span className="text-[10px] text-muted-foreground/70 ml-auto">
                        (~${plan.priceUSD}/mo)
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="flex-1 space-y-2.5 mb-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                          plan.isPopular ? "text-primary" : "text-emerald-500"
                        }`} />
                        <span className="text-foreground/90 leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={isCurrent || upgrading}
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-muted text-muted-foreground border border-border cursor-default"
                        : plan.isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                          : "bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Current Plan
                      </>
                    ) : plan.id === "FREE" ? (
                      "Switch to Free"
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Modal Sub-Step (When merchant clicks Upgrade) */}
          {selectedPlanToUpgrade && (
            <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Complete Upgrade to {STORE_PLANS_CONFIG[selectedPlanToUpgrade].name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Total: <strong className="text-primary font-bold">
                      SLE {(billingCycle === "yearly" 
                        ? STORE_PLANS_CONFIG[selectedPlanToUpgrade].priceYearlySLE 
                        : STORE_PLANS_CONFIG[selectedPlanToUpgrade].priceMonthlySLE
                      ).toLocaleString()}
                    </strong> ({billingCycle})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanToUpgrade(null)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("orange_money")}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    paymentMethod === "orange_money"
                      ? "border-amber-500 bg-amber-500/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <p className="text-xs">Orange Money</p>
                    <p className="text-[10px] text-muted-foreground">Direct mobile prompt</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("afrimoney")}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    paymentMethod === "afrimoney"
                      ? "border-red-500 bg-red-500/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-500" />
                  <div className="text-left">
                    <p className="text-xs">AfriMoney</p>
                    <p className="text-[10px] text-muted-foreground">Direct mobile prompt</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/10 text-foreground font-bold"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <p className="text-xs">Debit / Credit Card</p>
                    <p className="text-[10px] text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="text"
                  placeholder="Enter Mobile Money Phone (e.g. 076 123 456)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 w-full px-4 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  disabled={upgrading}
                  onClick={() => executeUpgrade(selectedPlanToUpgrade)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Activating Plan...
                    </>
                  ) : (
                    <>
                      Confirm & Activate
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure billing powered by ProTech Merchant Services. Cancel or upgrade anytime.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
